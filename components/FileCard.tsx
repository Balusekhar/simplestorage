// FileCard.tsx
import React from "react";
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

interface FileCardProps {
  file: FileItem;
  onDelete: (fileKey: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
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

  return (
    <Card
      key={file.fileKey}
      className="pb-4 relative cursor-pointer w-full max-w-xs mx-auto">
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
              className="object-cover rounded-t-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            getFileIcon(file.type)
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm ps-1 truncate">{file.fileName}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => onDelete(file.fileKey)}
                className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </a>
    </Card>
  );
};

export default FileCard;
