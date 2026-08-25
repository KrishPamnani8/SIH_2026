"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface UploadCardProps {
  onUpload?: (files: FileList) => void;
}

export default function UploadCard({ onUpload }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
    }
    if (onUpload) onUpload(files);
  };

  const openFileDialog = () => inputRef.current?.click();

  return (
    <section id="upload" className="my-8 max-w-3xl mx-auto">
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors ${
          isDragging ? "border-purple-600 bg-purple-50" : "border-slate-300 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={openFileDialog}
      >
        <Upload className="h-12 w-12 text-slate-500 mb-4" />
        <p className="text-slate-600 mb-2">Drag & drop an image, or click to select</p>
        <p className="text-sm text-slate-500">Supported formats: JPG, PNG, TIFF</p>
        <input
          type="file"
          accept="image/*"
          multiple={false}
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <button
          type="button"
          onClick={openFileDialog}
          className="mt-4 inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-100 transition"
        >
          Choose File
        </button>
        {previewUrl && (
          <div className="mt-4 w-full max-w-xs text-center">
            <img src={previewUrl} alt="preview" className="rounded-md object-cover w-full h-48" />
            <p className="text-sm text-slate-600 mt-1 truncate" title={fileName}>{fileName}</p>
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setFileName('');
              }}
              className="mt-1 text-xs text-red-500 underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
