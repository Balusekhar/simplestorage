"use client";
import {
  Cloud,
  File,
  FileImage,
  FileText,
  Home,
  Music,
  Plus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUploadDialog } from "./FileUploadDialog";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

// Menu items
const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Photos", url: "/dashboard/photos", icon: FileImage },
  { title: "Videos", url: "/dashboard/videos", icon: File },
  { title: "Documents", url: "/dashboard/documents", icon: FileText },
  { title: "Audio", url: "/dashboard/audio", icon: Music },
];

export function AppSidebar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
  } else if (status === "unauthenticated") {
    redirect("/");
  } else {
    // console.log("Session data:", session);
  }

  return (
    <Sidebar>
      {/* Header with App Name and Cloud Icon */}
      <SidebarHeader>
        <div className="flex items-center gap-2 py-4">
          <Cloud className="text-blue-500" size={24} />
          <span className="text-lg font-bold text-gray-800">
            Simple Storage
          </span>
        </div>
        {/* "New +" Button */}
        <div onClick={() => setOpen(true)} className="flex justify-center">
          <Button className="flex items-center w-full gap-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600">
            <span>New</span>
            <Plus size={16} />
          </Button>
        </div>
      </SidebarHeader>

      {/* File Upload Dialog */}
      <FileUploadDialog open={open} setOpen={setOpen} />

      <SidebarContent>
        {/* Sidebar Content with Categories */}
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="mr-3 text-gray-500" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with User Info */}
      {session && (
        <SidebarFooter className="p-4">
          <Separator className="my-4" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Image
                  src={session.user?.image || "/placeholder-avatar.png"}
                  alt="User avatar"
                  width={24}
                  height={24}
                  className="mr-2 rounded-full"
                />
                <span className="group-data-[collapsible=icon]:hidden">
                  {session.user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => signOut()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
