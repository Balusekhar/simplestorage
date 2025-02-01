"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { refreshFilesRef } from "@/app/utils/refreshFileRef";

export function FileUploadDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const { data: session } = useSession();

  console.log("files in upload dialog", files);
  console.log("error in upload dialog", errorMessage);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Reset error message on new drop
      setErrorMessage(null);

      // Handle rejected files (wrong file types)
      if (rejectedFiles.length > 0) {
        setErrorMessage("File size should not be more than 500MB and no more than 10 files should be uploaded");
        return;
      }

      // Check file count and size limit before adding files
      const totalFiles = [...files, ...acceptedFiles];
      const totalSize = totalFiles.reduce((acc, file) => acc + file.size, 0);

      // Only show one error message for size or file count limits
      let error = null;
      if (totalFiles.length > 10) {
        error = "You can only upload a maximum of 3 files.";
      } else if (totalSize > 500 * 1024 * 1024) {
        // 500MB limit
        error = "Total file size exceeds 500MB.";
      }

      // Only show one error message if either condition is met
      if (error) {
        setErrorMessage(error);
        return;
      }

      setFiles(totalFiles);
    },
    [files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 10, // Set max files to 3 for testing
    maxSize: 500 * 1024 * 1024, // Max file size 500MB for testing
    accept: {
      // Images
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/webp": [".webp"],

      // Documents
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],

      // Audio
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/ogg": [".ogg"],

      // Video
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/x-msvideo": [".avi"],
    },
  });

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

        {/* Error Message */}
        {errorMessage && (
          <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
        )}

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
