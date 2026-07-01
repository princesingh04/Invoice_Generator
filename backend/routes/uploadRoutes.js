import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Multer configuration: store files locally ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    // Prefix with timestamp to avoid collisions
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image and PDF files are allowed.'));
  },
});

// ---------------------------------------------------------------------------
// POST /api/upload-receipt – Upload a receipt image and forward to AI worker
// ---------------------------------------------------------------------------
router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Build the publicly accessible URL for the uploaded file
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Forward the file URL to the Python AI worker for extraction
    const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';

    const aiResponse = await fetch(`${aiWorkerUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_url: fileUrl }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI worker error:', errorText);
      return res.status(502).json({
        message: 'AI extraction service returned an error.',
        fileUrl,
        details: errorText,
      });
    }

    const extractedData = await aiResponse.json();

    // Return the structured extraction along with the file URL
    res.json({
      message: 'Receipt uploaded and processed successfully.',
      fileUrl,
      extractedData,
    });
  } catch (error) {
    console.error('Error processing receipt upload:', error);

    // If the AI worker is unreachable, still return the file URL
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      return res.status(503).json({
        message: 'File uploaded but AI extraction service is unavailable.',
        fileUrl,
        error: error.message,
      });
    }

    res.status(500).json({ message: error.message });
  }
});

export default router;
