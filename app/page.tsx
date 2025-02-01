import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/auth";
import { CloudUpload } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  return (
    <div className="max-h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_center,#C9EBFF,transparent)]">
          <div className="flex h-full flex-col justify-center items-center text-center p-6">
            <div className="p-9 mb-8">
              <h1 className="text-8xl p-4 font-medium lg:text-7xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-slate-800 to-slate-600">
                The Ultimate <br /> Cloud Storage
              </h1>
              <p className="text-xl lg:text2xl mb-6 px-10 text-[#52525b] max-w-3xl mx-auto">
                Upload, organize, and access your files anytime, anywhere.
                Experience seamless file storage with ease and security.
              </p>
              <form
                action={async () => {
                  "use server";
                  if (!session?.user) {
                    await signIn("google", { redirectTo: "/dashboard" });
                  } else {
                    redirect("/dashboard");
                  }
                }}>
                <Button className="shadow-2xl">
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Start Uploading
                  </span>
                  <CloudUpload />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
