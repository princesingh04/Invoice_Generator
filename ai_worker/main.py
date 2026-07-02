import os
import httpx
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

from schemas import ExtractedInvoice

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Invoice AI Extraction Service",
    description="FastAPI service utilizing Gemini 2.5 Flash to extract structured invoice data from images and PDFs."
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractionRequest(BaseModel):
    file_url: str = Field(..., description="The public URL of the receipt image or PDF file.")

def get_mime_type(url: str, content_type: str = None) -> str:
    """Helper to determine MIME type from URL extension or content-type header."""
    if content_type:
        mime = content_type.split(";")[0].strip().lower()
        if mime in ["image/jpeg", "image/png", "image/webp", "application/pdf"]:
            return mime

    # Fallback to extension
    url_lower = url.lower()
    if url_lower.endswith(".pdf"):
        return "application/pdf"
    elif url_lower.endswith(".png"):
        return "image/png"
    elif url_lower.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    elif url_lower.endswith(".webp"):
        return "image/webp"
    
    # Default fallback
    return "image/jpeg"

@app.post("/extract", response_model=ExtractedInvoice)
async def extract_invoice(request: ExtractionRequest):
    # 1. Validate Gemini API Key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY environment variable is not set on the AI worker."
        )

    # 2. Download the file into memory
    print(f"Downloading file from: {request.file_url}")
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(request.file_url)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to download file from URL. HTTP Status: {response.status_code}"
                )
            file_bytes = response.content
            content_type = response.headers.get("content-type")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error connecting to file URL: {str(e)}"
        )

    # 3. Determine MIME type
    mime_type = get_mime_type(request.file_url, content_type)
    print(f"File size: {len(file_bytes)} bytes, MIME Type: {mime_type}")

    # 4. Invoke Gemini API using google-genai SDK
    try:
        # Initialize Google GenAI client
        # Note: genai.Client() automatically picks up GEMINI_API_KEY from environment
        ai_client = genai.Client()
        
        # Prepare the binary file part
        file_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=mime_type
        )
        
        prompt = (
            "Extract all text and structured invoice details from this document. "
            "Identify the seller/shop details (name, address, tax ID, email, phone), "
            "the buyer/customer details (if visible), invoice metadata (invoice number, "
            "issue date in YYYY-MM-DD format), all individual line items (description, "
            "quantity, unit price, tax rate percentage, and line item total), and "
            "overall totals (subtotal, tax total, and grand total). "
            "If any field (like taxRate) is missing or not mentioned, return 0.0 or null as appropriate. "
            "Ensure the totals align: subtotal + taxTotal = grandTotal."
        )

        print("Sending request to Gemini 2.5 Flash...")
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[file_part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractedInvoice,
                temperature=0.1,
            )
        )
        
        # The response text will be a JSON string conforming to the ExtractedInvoice schema
        extracted_data_json = response.text
        print("Gemini Response received.")
        
        # Validate the response against the schema by parsing it with Pydantic
        extracted_invoice = ExtractedInvoice.model_validate_json(extracted_data_json)
        return extracted_invoice

    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI extraction failed: {str(e)}"
        )

@app.get("/health")
def health():
    return {"status": "healthy", "gemini_key_set": bool(os.getenv("GEMINI_API_KEY"))}
