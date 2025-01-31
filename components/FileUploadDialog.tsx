"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { refreshFilesRef } from "@/app/dashboard/page";

export function FileUploadDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { data: session } = useSession();

  const onDrop = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getPresignedUrl = async () => {
    if (files.length === 0) return;
    setIsUploading(true); // Start loader
    try {
      const userId = session?.user?.id;
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          files: files.map((file) => ({ name: file.name, type: file.type })),
          userId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch presigned URLs");

      const data = await response.json();
      await uploadFilesToS3(data.presignedUrls);
      setFiles([]);
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false); // Stop loader
    }
  };

  const uploadFilesToS3 = async (presignedUrls: { signedUrl: string }[]) => {
    try {
      await Promise.all(
        files.map(async (file, index) => {
          const fileData = presignedUrls[index];

          if (!fileData || !fileData.signedUrl) {
            console.error(`No signed URL found for file: ${file.name}`);
            return;
          }

          console.log("File:", file);

          const response = await fetch(fileData.signedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        })
      );
      console.log("All files uploaded successfully.");
      refreshFilesRef.refresh();
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
          <div
            className="mt-4 space-y-2"
            style={{ maxHeight: "200px", overflowY: "auto" }}>
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
          onClick={getPresignedUrl}
          disabled={files.length === 0 || isUploading}
          className={`mt-4 w-full ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}>
          {isUploading ? "Uploading..." : "Upload Files"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
