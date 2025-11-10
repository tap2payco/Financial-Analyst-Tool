import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface UploadBoxProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const UploadBox: React.FC<UploadBoxProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  const handleBoxClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);
  
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (isLoading) return;
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
        onFileUpload(file);
    }
  }, [isLoading, onFileUpload]);


  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
        isLoading 
          ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
          : 'border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-900/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 cursor-pointer'
      }`}
      onClick={handleBoxClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf"
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center">
        <UploadIcon className={`w-12 h-12 mb-4 ${isLoading ? 'text-slate-400' : 'text-sky-500'}`} />
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          {isLoading ? 'Processing your file...' : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Excel, CSV, or PDF files
        </p>
      </div>
    </div>
  );
};

export default UploadBox;