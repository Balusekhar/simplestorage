"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import FileCard from "@/components/FileCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FileUploadDialog } from "@/components/FileUploadDialog";

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
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [open, setOpen] = useState<boolean>(false); // State to control dialog visibility

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
      setFilteredFiles(processedFiles); // Set all files initially
    } catch (error) {
      console.error("Error fetching user files:", error);
    } finally {
      setIsLoading(false);
    }
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

  // Function to handle the filter logic
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);

    let filtered: FileItem[] = [];

    // Check the filter type and apply the filtering logic based on file extensions
    switch (filter) {
      case "all":
        filtered = files;
        break;
      case "photo":
        filtered = files.filter((file) => {
          const ext = file.type;
          return ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext);
        });
        break;
      case "video":
        filtered = files.filter((file) => {
          const ext = file.type;
          return ["mp4", "avi", "mov", "mkv", "flv"].includes(ext);
        });
        break;
      case "document":
        filtered = files.filter((file) => {
          const ext = file.type;
          return ["pdf", "doc", "docx", "txt", "ppt", "xls"].includes(ext);
        });
        break;
      default:
        filtered = files;
        break;
    }

    setFilteredFiles(filtered); // Update filtered files state
  };

  useEffect(() => {
    refreshFilesRef.refresh = fetchUserFiles;
  }, [session]);

  useEffect(() => {
    if (session) fetchUserFiles();
  }, [session]);

  return (
    <div className="p-6 flex flex-col space-y-4">
      {/* Filter Section */}
      <div className="flex justify-between mb-4">
        <div className="space-x-4">
          <button
            onClick={() => handleFilterChange("all")}
            className={`text-sm px-3 py-1 rounded-lg ${
              selectedFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}>
            All
          </button>
          <button
            onClick={() => handleFilterChange("photo")}
            className={`text-sm px-3 py-1 rounded-lg ${
              selectedFilter === "photo"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}>
            Photos
          </button>
          <button
            onClick={() => handleFilterChange("video")}
            className={`text-sm px-3 py-1 rounded-lg ${
              selectedFilter === "video"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}>
            Videos
          </button>
          <button
            onClick={() => handleFilterChange("document")}
            className={`text-sm px-3 py-1 rounded-lg ${
              selectedFilter === "document"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}>
            Documents
          </button>
        </div>

        {/* New File Button */}
        <div onClick={() => setOpen(true)} className="flex justify-center">
          <Button className="flex items-center gap-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600">
            <span>New</span>
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Loading and Files Section */}
      {isLoading ? (
        <p>Loading files...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <FileCard key={index} file={file} onDelete={handleDelete} />
            ))
          ) : (
            <p>No files found.</p>
          )}
        </div>
      )}

      {/* File Upload Dialog */}
      <FileUploadDialog open={open} setOpen={setOpen} />
    </div>
  );
}

export default Dashboard;
