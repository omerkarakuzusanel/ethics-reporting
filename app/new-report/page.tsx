"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/navbar";
import { useTranslation } from "@/lib/translation";
import { AlertTriangle, ArrowRight, Check, Info, AlertCircle } from "lucide-react";

export default function NewReportPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleContinue = () => {
    if (acceptTerms) {
      router.push("/new-report/form");
    }
  };

  const toggleTerms = () => {
    setAcceptTerms(!acceptTerms);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <button
              onClick={() => router.push("/")}
              className="text-sm hover:text-foreground transition-colors"
            >
              {language === "tr" ? "Ana Sayfa" : "Home"}
            </button>
            <span>/</span>
            <span className="text-sm">
              {language === "tr" ? "Yeni Bildirim" : "New Report"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === "tr" ? "Yeni Bildirim" : "New Report"}
          </h1>
        </div>

        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{t.newReport.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-l-primary">
              <p>{t.newReport.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {language === "tr" ? "Etik İhlaller" : "Ethical Violations"}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {t.newReport.ethicalViolations.map((violation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 bg-muted/30 p-3 rounded-md"
                  >
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{violation}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-md bg-amber-50 border-amber-200">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm text-amber-800">
                  {language === "tr"
                    ? "Önemli Bilgilendirme"
                    : "Important Information"}
                </p>
                <p className="text-sm text-amber-700">
                  {language === "tr"
                    ? "Lütfen bildiriminizde mümkün olduğunca detaylı bilgi veriniz. Bu, durumun doğru değerlendirilmesi için önemlidir."
                    : "Please provide as much detail as possible in your report. This is important for a proper assessment of the situation."}
                </p>
              </div>
            </div>

            <div
              className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer"
              onClick={toggleTerms}
            >
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setAcceptTerms(checked as boolean)
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t.newReport.acceptTerms}
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => router.push("/")}>
              {t.newReport.backButton}
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!acceptTerms}
              className="gap-2"
            >
              {t.newReport.continueButton}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
