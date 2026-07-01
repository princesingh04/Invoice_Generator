from pydantic import BaseModel, Field
from typing import List, Optional

class ShopDetails(BaseModel):
    businessName: str = Field(description="The name of the business or shop selling the items.")
    address: Optional[str] = Field(None, description="The address of the shop or business.")
    email: Optional[str] = Field(None, description="The contact email of the shop.")
    phone: Optional[str] = Field(None, description="The contact phone number of the shop.")
    taxId: Optional[str] = Field(None, description="The Tax ID, GSTIN, VAT ID, or Business registration number of the shop.")

class CustomerDetails(BaseModel):
    name: Optional[str] = Field(None, description="The name of the customer buying the items (if present).")
    email: Optional[str] = Field(None, description="The email address of the customer (if present).")
    phone: Optional[str] = Field(None, description="The phone number of the customer (if present).")
    address: Optional[str] = Field(None, description="The address of the customer (if present).")
    taxId: Optional[str] = Field(None, description="The Tax ID or VAT ID of the customer (if present).")

class LineItem(BaseModel):
    description: str = Field(description="The description of the item or service.")
    quantity: float = Field(default=1.0, description="The quantity of the item purchased.")
    unitPrice: float = Field(description="The unit price of the item.")
    taxRate: float = Field(default=0.0, description="The tax rate percentage applied to this item (e.g. 18 for 18% tax). If not specified or if zero, default to 0.0.")
    total: float = Field(description="The total cost for this line item (usually quantity * unitPrice).")

class ExtractedInvoice(BaseModel):
    shop: ShopDetails = Field(description="Extracted details of the shop/seller.")
    customer: Optional[CustomerDetails] = Field(default=None, description="Extracted details of the customer/buyer (if present).")
    invoiceNumber: Optional[str] = Field(None, description="The invoice or receipt number.")
    issueDate: Optional[str] = Field(None, description="The issue or purchase date of the receipt (in YYYY-MM-DD format if possible, otherwise as text).")
    dueDate: Optional[str] = Field(None, description="The due date of the invoice (if present).")
    lineItems: List[LineItem] = Field(description="The list of purchased items/services.")
    subtotal: float = Field(description="The subtotal of all items before taxes.")
    taxTotal: float = Field(description="The total tax amount applied.")
    grandTotal: float = Field(description="The grand total amount (subtotal + taxTotal).")
