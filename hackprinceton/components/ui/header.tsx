import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

import Link from "next/link";

export default function Header() {
    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                  <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                    <div className="flex gap-5 items-center font-semibold">
                      <Link href={"/"}>AI AirBNB</Link>
                      <div className="flex items-center gap-2">
                     
                      </div>
                    </div>
                    <Link href={"/createListing"}>Create Listing</Link>
                    <Link href={"/listing"}>Listings</Link>
                    <AuthButton />
                    <ThemeSwitcher />
                  </div>
                </nav>
       
    );
}
