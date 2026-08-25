"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface UploadCardProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
}

export default function UploadCard({ onUpload, maxFiles = 2 }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFiles = (filesList: FileList | File[]) => {
    const filesArray = Array.from(filesList).slice(0, maxFiles);
    if (filesArray.length > 0) {
      setSelectedFiles(filesArray);
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      if (onUpload) onUpload(filesArray);
    }
  };

  const openFileDialog = () => inputRef.current?.click();

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newFiles.map((file) => URL.createObjectURL(file)));
    if (onUpload) onUpload(newFiles);
  };

  return (
    <section id="upload" className="w-full">
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 dark:border-purple-400 scale-[1.01]"
            : "border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs"
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
        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 mb-2">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold mb-1 text-sm text-center">
          {maxFiles === 1 ? "Drag & drop 1 satellite image, or click to select" : "Drag & drop 1 or 2 satellite images, or click to select"}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
          {maxFiles === 1 ? "PNG, JPG, TIFF, NPY (Single File Mode)" : "PNG, JPG, TIFF, NPY (Select 2 files for Change/SAR Analysis)"}
        </p>
        <input
          type="file"
          accept="image/*,.npy,.tif,.tiff"
          multiple={maxFiles > 1}
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <button
          type="button"
          onClick={openFileDialog}
          className="mt-3 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-4 py-1.5 text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900 transition shadow-2xs"
        >
          📁 Select Satellite Image(s)
        </button>

        {previewUrls.length > 0 && (
          <div className="mt-4 w-full grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950 text-center shadow-xs">
                <span className="absolute top-1.5 left-1.5 bg-purple-600 dark:bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  {maxFiles === 1 ? "Selected File" : `Image ${idx + 1}`}
                </span>
                <img src={url} alt={`preview-${idx}`} className="rounded-lg object-cover w-full h-28 mt-2 border border-slate-200/50 dark:border-slate-800/50" />
                <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mt-1.5 truncate" title={selectedFiles[idx]?.name}>
                  {selectedFiles[idx]?.name}
                </p>
                <button
                  type="button"
                  onClick={(e) => handleRemove(idx, e)}
                  className="mt-1 text-xs text-red-500 dark:text-red-400 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );


}

