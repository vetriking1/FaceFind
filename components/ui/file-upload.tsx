"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X, Image, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  multiple = false,
  maxFiles = 5,
  maxSize = 10485760, // 10MB
  accept = { 'image/*': ['.jpeg', '.jpg', '.png'] },
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
    setFiles(newFiles);
    
    // Generate previews
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
    
    // Simulate upload progress
    setUploadProgress(0);
    setUploadComplete(false);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    onFileSelect(newFiles);
    
    // Clean up preview URLs
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [files, multiple, onFileSelect, previews]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize,
  });
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Clean up preview URL
    URL.revokeObjectURL(previews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFileSelect(newFiles);
  };
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      <motion.div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        <motion.div
          className="flex flex-col items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Upload className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium mt-2">
            {isDragActive ? "Drop to upload" : "Drag & drop photos here"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {multiple
              ? `Upload up to ${maxFiles} photos (max ${maxSize / 1048576}MB each)`
              : `Upload a photo (max ${maxSize / 1048576}MB)`}
          </p>
          <Button type="button" variant="secondary" className="mt-2">
            Or browse files
          </Button>
        </motion.div>
      </motion.div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <motion.div
                key={preview}
                className="relative group aspect-square rounded-md overflow-hidden border border-border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="size-3" />
                </Button>
              </motion.div>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {uploadComplete
                  ? "Upload complete"
                  : `Uploading ${files.length} ${files.length === 1 ? "file" : "files"}...`}
              </span>
              {uploadComplete && (
                <Check className="text-green-500 size-4" />
              )}
            </div>
            <Progress value={uploadProgress} />
          </div>
        </div>
      )}
    </div>
  );
}