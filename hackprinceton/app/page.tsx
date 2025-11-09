
import Trips from "@/components/trips";
import ChatBox from "@/components/chat-box";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


export default async function Home() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) {
    redirect("/auth/login");
  }


  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4">
          
           
            <div className="mt-8 ">
              <Trips userId={user?.id} />
              <div className="mt-20">
              <ChatBox />
              </div>
              
            </div>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built by{" "}
            <a
              href="https://www.yogeshsam.me/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Yogesh
            </a>
  
          </p>
        
        </footer>
      </div>
    </main>
  );
}
