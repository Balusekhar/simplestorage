// components/Dashboard.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export const refreshFilesRef = {
  refresh: () => {},
};

function Dashboard() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<{ fileName: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Set initial loading to true

  const fetchUserFiles = async () => {
    try {
      if (!session?.user?.id) return;

      const response = await fetch(
        `/api/get-objects?userId=${session.user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error fetching user files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFilesRef.refresh = fetchUserFiles;
  }, [session]);

  useEffect(() => {
    if (session) fetchUserFiles();
  }, [session]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Files</h1>
      {isLoading ? (
        <p>Loading files...</p>
      ) : (
        <>
          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="p-2 bg-gray-100 rounded-md">
                  {file.fileName}
                </li>
              ))}
            </ul>
          ) : (
            <p>No files found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
