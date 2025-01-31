"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUploadDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      console.log("Uploading files:", files);
      setFiles([]);
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby="upload-dialog-description">
        <DialogHeader>
          <DialogTitle>File Upload</DialogTitle>

          <DialogDescription id="upload-dialog-description">
            Drag & drop your files here, or click to browse.
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer rounded-lg transition ${
            isDragActive
              ? "border-blue-500 bg-blue-100"
              : "border-gray-400 bg-gray-50"
          }`}>
          <input {...getInputProps()} />
          <p>
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop files here, or click to select files"}
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="text-red-500">
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0}
          className="mt-4 w-full bg-blue-500 text-white hover:bg-blue-600">
          Upload Files
        </Button>
      </DialogContent>
    </Dialog>
  );
}
