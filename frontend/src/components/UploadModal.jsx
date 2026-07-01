import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, AlertCircle, Loader2 } from 'lucide-react';
import { uploadReceipt } from '../api/invoiceApi';

/**
 * UploadModal — drag-and-drop receipt upload with AI extraction.
 *
 * @param {{ isOpen: boolean, onClose: () => void, onExtracted: (data: object) => void }} props
 */
export default function UploadModal({ isOpen, onClose, onExtracted }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

  const validateAndSet = useCallback((f) => {
    if (!ACCEPTED.includes(f.type)) {
      setError('Please upload a PNG, JPEG, WebP or PDF file.');
      return;
    }
    setError('');
    setFile(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSet(f);
  }, [validateAndSet]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await uploadReceipt(file);
      onExtracted(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError('');
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="upload-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => { reset(); onClose(); }}
    >
      <div
        id="upload-modal"
        className="glass-card w-full max-w-lg p-6 animate-scale-in"
        style={{ background: 'rgba(15,23,42,0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload size={20} className="text-brand-400" />
            Upload Receipt
          </h2>
          <button
            id="upload-modal-close"
            onClick={() => { reset(); onClose(); }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          id="upload-drop-zone"
          className={`
            border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
            ${dragOver
              ? 'border-brand-400 bg-brand-400/10'
              : file
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }
          `}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) validateAndSet(e.target.files[0]); }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileImage size={36} className="text-emerald-400" />
              <p className="text-sm text-surface-200 font-medium">{file.name}</p>
              <p className="text-xs text-surface-400">
                {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={36} className="text-surface-500" />
              <p className="text-sm text-surface-300 font-medium">
                Drag & drop your receipt here
              </p>
              <p className="text-xs text-surface-500">
                PNG, JPEG, WebP or PDF — max 10 MB
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            id="upload-cancel-btn"
            onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-surface-400
                       hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="upload-submit-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white
                       bg-gradient-to-r from-indigo-500 to-violet-500
                       hover:from-indigo-400 hover:to-violet-400
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200 cursor-pointer
                       flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Extracting…
              </>
            ) : (
              'Extract with AI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
