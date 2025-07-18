"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { useTranslation } from "@/lib/translation";
import { AlertCircle, FileText, Lock, Shield, ShieldAlert } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const { t, language } = useTranslation();

  const handleNewReport = () => {
    router.push("/new-report");
  };

  const handleTrackReport = () => {
    if (accessCode.trim()) {
      router.push(`/track-report?code=${accessCode}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {language === "tr"
              ? "Sanel Etik Bildirim Sistemi"
              : "Sanel Ethics Reporting System"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === "tr"
              ? "Etik değerlerimize aykırı durumları güvenle bildirebileceğiniz ve takip edebileceğiniz platform."
              : "A platform where you can safely report and track situations that violate our ethical values."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="overflow-hidden border-t-4 border-t-primary shadow-md transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t.submitReport.title}</CardTitle>
              <CardDescription>{t.submitReport.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-[20px] mt-0.5">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "tr"
                      ? "Bildirimleriniz gizlilik içerisinde değerlendirilir."
                      : "Your reports are evaluated confidentially."}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="min-w-[20px] mt-0.5">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "tr"
                      ? "Tüm bildirimler titizlikle incelenir ve gerekli aksiyonlar alınır."
                      : "All reports are carefully reviewed and necessary actions are taken."}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                onClick={handleNewReport}
                className="w-full gap-2"
                size="lg"
              >
                <AlertCircle className="h-4 w-4" />
                {t.submitReport.button}
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-secondary shadow-md transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="mb-2 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>{t.trackReport.title}</CardTitle>
              <CardDescription>{t.trackReport.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="relative">
                <Input
                  placeholder={t.trackReport.accessCodePlaceholder}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="pl-10 h-12 text-lg tracking-wider font-mono"
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                onClick={handleTrackReport}
                className="w-full"
                size="lg"
                variant="secondary"
                disabled={!accessCode.trim()}
              >
                {t.trackReport.button}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="bg-muted/50 p-6 rounded-lg border text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">
              {language === "tr" ? "Gizlilik" : "Confidentiality"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Kimliğinizi gizli tutabilir veya paylaşabilirsiniz. Her iki durumda da bildiriminiz ciddiyetle ele alınır."
                : "You can keep your identity confidential or share it. In either case, your report is taken seriously."}
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg border text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">
              {language === "tr" ? "Şeffaflık" : "Transparency"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Bildiriminizin durumunu erişim kodunuzla takip edebilir, süreç hakkında bilgi alabilirsiniz."
                : "You can track the status of your report with your access code and get information about the process."}
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg border text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">
              {language === "tr" ? "Güvenlik" : "Security"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Tüm bildirimler güvenli bir şekilde saklanır ve yalnızca yetkili kişiler tarafından görüntülenebilir."
                : "All reports are stored securely and can only be viewed by authorized personnel."}
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            {language === "tr"
              ? "© 2025 SANEL. Tüm hakları saklıdır."
              : "© 2025 SANEL. All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
