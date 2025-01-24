import {
  Cloud,
  File,
  FileImage,
  FileText,
  Music,
  Plus,
  Settings,
  User,
} from "lucide-react";
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
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

// Menu items
const items = [
  {
    title: "Photos",
    url: "#",
    icon: FileImage,
  },
  {
    title: "Videos",
    url: "#",
    icon: File,
  },
  {
    title: "Documents",
    url: "#",
    icon: FileText,
  },
  {
    title: "Audio",
    url: "#",
    icon: Music,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export async function AppSidebar() {
  const session = await auth();
  console.log(session)

  if (!session?.user) {
    redirect("/");
  }

  const handleLogout = async () => {
    "use server";
    await signOut();
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header with App Name and Cloud Icon */}
      <SidebarHeader>
        <div className="flex items-center gap-2 py-4">
          <Cloud className="text-blue-500" size={24} />
          <span className="text-lg font-bold text-gray-800">
            Simple Storage
          </span>
        </div>
        {/* "New +" Button */}
        <div className="flex justify-center">
          <Button className="flex items-center w-full gap-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600">
            <span>New</span>
            <Plus size={16} />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Sidebar Content with Categories */}
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="mr-3 text-gray-500" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with User Info */}
      {session && (
        <SidebarFooter onClick={handleLogout}>
          <div className="flex items-center gap-2 p-4 border-t cursor-pointer">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="User Image"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <User className="w-10 h-10 text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-800">
              {session.user.name}
            </span>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
