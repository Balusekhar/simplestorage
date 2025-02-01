"use client";
import { useSession, signOut } from "next-auth/react";
import { Cloud } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Check session status and redirect if unauthenticated
  if (status === "loading") {
    // You can show a loading spinner here if needed
  } else if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        {/* Left: Logo and App Name */}
        <div className="flex items-center gap-2">
          <Cloud className="text-blue-500" size={24} />
          <span className="text-lg font-bold text-gray-800">Simple Storage</span>
        </div>

        {/* Right: User Photo and Dropdown Menu */}
        {session && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
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
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>
    </div>
  );
}