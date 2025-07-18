"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { useTranslation } from "@/lib/translation";
import { CheckCircle2, Copy, Home } from "lucide-react";
import { useState } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessCode = searchParams.get("code") || "ERROR_NO_CODE";
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(accessCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy: ", err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = accessCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-2xl mx-auto py-12 px-4">
        <Card className="text-center shadow-lg border-t-4 border-t-green-500">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-600">
              {t.success.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>{t.success.description}</p>

            <div className="p-6 bg-muted/50 rounded-md border">
              <p className="text-sm font-medium mb-3">
                {t.success.accessCodeLabel}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold tracking-wider font-mono">
                  {accessCode}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-8 w-8"
                  title={language === "tr" ? "Kopyala" : "Copy"}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>{language === "tr" ? "Önemli:" : "Important:"}</strong>{" "}
                {t.success.note}
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <Button onClick={() => router.push("/")} className="gap-2">
              <Home className="h-4 w-4" />
              {t.success.homeButton}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
