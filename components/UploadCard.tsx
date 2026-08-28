"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface UploadCardProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  mode?: "single" | "change" | "optical-sar";
}

export default function UploadCard({ onUpload, maxFiles = 2, mode = "single" }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const isOpticalSar = mode === "optical-sar";

  const handleFiles = (filesList: FileList | File[], slotIndex?: number) => {
    const newIncoming = Array.from(filesList);
    if (newIncoming.length === 0) return;

    let updatedFiles: File[] = [];

    if (maxFiles === 1) {
      updatedFiles = [newIncoming[0]];
    } else {
      if (slotIndex === 0) {
        // Replace or set Image 1 (Before / Optical)
        const image2 = selectedFiles[1];
        updatedFiles = image2 ? [newIncoming[0], image2] : [newIncoming[0]];
      } else if (slotIndex === 1) {
        // Set Image 2 (After / SAR)
        const image1 = selectedFiles[0];
        updatedFiles = image1 ? [image1, newIncoming[0]] : [newIncoming[0]];
      } else {
        // Drag & drop or batch select
        const combined = [...selectedFiles, ...newIncoming];
        updatedFiles = combined.slice(0, maxFiles);
      }
    }

    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedFiles.map((file) => URL.createObjectURL(file)));
    if (onUpload) onUpload(updatedFiles);
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviewUrls(newFiles.map((file) => URL.createObjectURL(file)));
    if (onUpload) onUpload(newFiles);
  };

  if (maxFiles === 2) {
    return (
      <section id="upload" className="w-full space-y-3">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>📡</span> {isOpticalSar ? "Select Optical & SAR Radar Files Individually:" : "Select 2 Bi-Temporal Satellite Files (Before & After) Individually:"}
        </p>

        {/* Hidden inputs for Slot 1 and Slot 2 */}
        <input
          type="file"
          accept="image/*,.npy,.tif,.tiff"
          ref={fileInputRef1}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files, 0)}
        />
        <input
          type="file"
          accept="image/*,.npy,.tif,.tiff"
          ref={fileInputRef2}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files, 1)}
        />

        <div className="grid grid-cols-2 gap-3">
          {/* SLOT 1 (Optical / Before) */}
          <div
            onClick={() => fileInputRef1.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer min-h-[160px] relative ${
              selectedFiles[0]
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                : "border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:border-purple-400 dark:hover:border-purple-500"
            }`}
          >
            <span className="absolute top-2 left-2 bg-purple-600 dark:bg-purple-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {isOpticalSar ? "Optical Image (Sentinel-2)" : "Image 1 (T1 / Before)"}
            </span>

            {selectedFiles[0] ? (
              <div className="w-full flex flex-col items-center pt-4">
                <img
                  src={previewUrls[0]}
                  alt="Image 1"
                  className="rounded-xl object-cover w-full h-24 border border-slate-200/60 dark:border-slate-800/60 shadow-xs"
                />
                <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mt-2 truncate w-full text-center" title={selectedFiles[0].name}>
                  {selectedFiles[0].name}
                </p>
                <div className="flex gap-3 mt-1">
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline">Change</span>
                  <button type="button" onClick={(e) => handleRemove(0, e)} className="text-[11px] text-red-500 dark:text-red-400 font-semibold hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-1.5 pt-3">
                <div className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isOpticalSar ? "+ Add Optical Image" : "+ Add Image 1 (Before)"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {isOpticalSar ? "Sentinel-2 RGB/Multi-Spectral" : "Click to select File 1"}
                </p>
              </div>
            )}
          </div>

          {/* SLOT 2 (SAR / After) */}
          <div
            onClick={() => fileInputRef2.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer min-h-[160px] relative ${
              selectedFiles[1]
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                : "border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:border-purple-400 dark:hover:border-purple-500"
            }`}
          >
            <span className="absolute top-2 left-2 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {isOpticalSar ? "SAR Radar Image (Sentinel-1)" : "Image 2 (T2 / After)"}
            </span>

            {selectedFiles[1] ? (
              <div className="w-full flex flex-col items-center pt-4">
                <img
                  src={previewUrls[1]}
                  alt="Image 2"
                  className="rounded-xl object-cover w-full h-24 border border-slate-200/60 dark:border-slate-800/60 shadow-xs"
                />
                <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mt-2 truncate w-full text-center" title={selectedFiles[1].name}>
                  {selectedFiles[1].name}
                </p>
                <div className="flex gap-3 mt-1">
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Change</span>
                  <button type="button" onClick={(e) => handleRemove(1, e)} className="text-[11px] text-red-500 dark:text-red-400 font-semibold hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-1.5 pt-3">
                <div className="p-2.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isOpticalSar ? "+ Add SAR Radar Image" : "+ Add Image 2 (After)"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {isOpticalSar ? "Sentinel-1 VV/VH Radar Backscatter" : "Click to select File 2"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }


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
        onClick={() => inputRef.current?.click()}
      >
        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 mb-2">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold mb-1 text-sm text-center">
          Drag & drop 1 satellite image, or click to select
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
          PNG, JPG, TIFF, NPY (Single File Mode)
        </p>
        <input
          type="file"
          accept="image/*,.npy,.tif,.tiff"
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-4 py-1.5 text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900 transition shadow-2xs cursor-pointer"
        >
          📁 Select Satellite Image
        </button>

        {previewUrls.length > 0 && (
          <div className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950 text-center shadow-xs">
              <span className="absolute top-1.5 left-1.5 bg-purple-600 dark:bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                Selected File
              </span>
              <img src={previewUrls[0]} alt="preview" className="rounded-lg object-cover w-full h-28 mt-2 border border-slate-200/50 dark:border-slate-800/50" />
              <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mt-1.5 truncate" title={selectedFiles[0]?.name}>
                {selectedFiles[0]?.name}
              </p>
              <button
                type="button"
                onClick={(e) => handleRemove(0, e)}
                className="mt-1 text-xs text-red-500 dark:text-red-400 hover:underline font-semibold cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );



}

