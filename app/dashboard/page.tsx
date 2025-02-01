"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, File, FileText, Music, Video } from "lucide-react";
import Image from "next/image";

interface FileItem {
  fileName: string;
  fileKey: string;
  type: string;
  cdnUrl: string;
}

export const refreshFilesRef = {
  refresh: () => {},
};

function Dashboard() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const CLOUD_FRONT_URL = "https://dsebtrmrf0wr2.cloudfront.net";

  const fetchUserFiles = async () => {
    try {
      if (!session?.user?.id) return;

      const response = await fetch(
        `/api/get-objects?userId=${session.user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();

      const processedFiles = data.files.map(
        (file: { fileName: string; fileKey: string }) => ({
          ...file,
          type: file.fileName.split(".").pop()?.toLowerCase() || "unknown",
          cdnUrl: `${CLOUD_FRONT_URL}/${file.fileKey}`,
        })
      );

      setFiles(processedFiles);
    } catch (error) {
      console.error("Error fetching user files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-12 w-12 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-12 w-12 text-blue-500" />;
      case "mp3":
        return <Music className="h-12 w-12 text-purple-500" />;
      case "mp4":
      case "mov":
        return <Video className="h-12 w-12 text-green-500" />;
      default:
        return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  const isImage = (type: string) => {
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(type);
  };

  const handleDelete = async (fileKey: string) => {
    try {
      const response = await fetch(`/api/delete-object`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKey }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      // Refresh the file list
      fetchUserFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  useEffect(() => {
    refreshFilesRef.refresh = fetchUserFiles;
  }, [session]);

  useEffect(() => {
    if (session) fetchUserFiles();
  }, [session]);

  return (
    <div className="p-6 flex flex-col space-y-4">
      <h1 className="text-xl font-bold mb-4">User Files</h1>
      {isLoading ? (
        <p>Loading files...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {files.length > 0 ? (
            files.map((file, index) => (
              <Card
                key={index}
                className="p-4 relative cursor-pointer w-full max-w-xs mx-auto">
                <a
                  href={file.cdnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block">
                  <div className="aspect-video relative mb-2 flex items-center justify-center bg-gray-50 rounded-md">
                    {isImage(file.type) ? (
                      <Image
                        src={file.cdnUrl}
                        alt={file.fileName}
                        fill
                        className="object-fill rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm truncate">{file.fileName}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleDelete(file.fileKey)}
                          className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </a>
              </Card>
            ))
          ) : (
            <p>No files found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
