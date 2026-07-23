import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (file: File) => void;
  onRemove?: () => void;
  currentImage?: string | null;
  label?: string;
}

export default function CloudinaryUpload({
  onUpload,
  onRemove,
  currentImage,
  label = 'Upload Image',
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) onRemove();
  };

  return (
    <div className="cloudinary-upload">
      {preview ? (
        <div className="cloudinary-preview">
          <img src={preview} alt="Uploaded" />
          <button type="button" className="cloudinary-remove" onClick={handleRemove}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="cloudinary-trigger"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={20} />
          <span>{uploading ? 'Uploading...' : label}</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}