"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/translation";
import LanguageToggle from "./language-toggle";

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Şirket logosu */}
          <img
            src="https://sanel.com.tr/wp-content/uploads/2020/09/Favicon-64px.jpg"
            alt="Sanel Logo"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-bold text-xl ">{t.companyName}</span>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
