"use client";

import { useEffect, useState } from "react";
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
import { getReportByAccessCode } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building,
  File,
} from "lucide-react";
import { shortenFileName } from "@/lib/utils";

interface ReportFile {
  id: string;
  file_name: string;
  file_url: string;
  file_uploader_name: string | null;
  file_uploader_email: string | null;
  file_upload_date: string;
}

interface ReportData {
  id: string;
  created_at: string;
  description: string;
  location: string;
  date: string;
  status: "pending" | "inProgress" | "completed" | "rejected";
  admin_notes: string | null;
  connection_option: string;
  name: string;
  updated_at: string;
  report_files: ReportFile[];
}

export default function TrackReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessCode = searchParams.get("code") || "";
  const { t, language } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessCode) {
      setLoading(false);
      setError("No access code provided");
      return;
    }

    const fetchReport = async () => {
      try {
        const { data, error } = await getReportByAccessCode(accessCode);

        if (error) {
          throw error;
        }

        if (data) {
          console.log("data1", data);
          setReport(data);
        } else {
          setError("Report not found");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [accessCode]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "inProgress":
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "rejected":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "inProgress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return language === "tr"
          ? "Bildiriminiz sistemimize ulaştı ve kayıt altına alındı.İnceleme aşaması yakında başlayacaktır."
          : "Your report has been received and is under review. It will be evaluated as soon as possible.";
      case "inProgress":
        return language === "tr"
          ? "Bildiriminiz şu anda aktif olarak değerlendirilmektedir. Bu süreç birkaç gün sürebilir."
          : "Your report is currently being actively evaluated. This process may take several days.";
      case "completed":
        return language === "tr"
          ? "Bildiriminizin değerlendirme süreci tamamlanmıştır. Gerekli aksiyonlar alınmıştır."
          : "The evaluation process of your report has been completed. Necessary actions have been taken.";
      case "rejected":
        return language === "tr"
          ? "Bildiriminiz değerlendirilmiş ancak etik ihlal kapsamına girmediği tespit edilmiştir."
          : "Your report has been evaluated but was determined not to fall within the scope of ethical violations.";
      default:
        return "";
    }
  };

  const getConnectionLabel = (option: string) => {
    // Check if it's an "other" type with details
    if (option.startsWith("other:")) {
      const otherValue = option.substring(6); // Remove "other:" prefix
      return `${t.reportForm.connection.other} (${otherValue})`;
    }

    // Standard options
    switch (option) {
      case "employee":
        return t.reportForm.connection.employee;
      case "former":
        return t.reportForm.connection.formerEmployee;
      case "other":
        return t.reportForm.connection.other;
      default:
        return option;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-3xl mx-auto py-12 px-4">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              {t.trackingPage.title}
              <Badge variant="outline" className="ml-2 text-xs">
                {accessCode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">
                  {t.trackingPage.loading}
                </p>
              </div>
            ) : error || !report ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-medium text-lg">
                  {t.trackingPage.notFound}
                </p>
                <p className="text-muted-foreground mt-2">
                  {language === "tr"
                    ? "Lütfen erişim kodunuzu kontrol edin ve tekrar deneyin."
                    : "Please check your access code and try again."}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Status Card */}
                <div
                  className={`p-6 rounded-lg border ${getStatusColor(
                    report.status
                  )}`}
                >
                  <div className="flex items-start gap-4">
                    {getStatusIcon(report.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {
                          t.statusLabels[
                            report.status as keyof typeof t.statusLabels
                          ]
                        }
                      </h3>
                      <p className="text-sm">
                        {getStatusDescription(report.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="py-4">
                  <h3 className="font-medium text-sm text-muted-foreground mb-6">
                    {language === "tr" ? "Bildirim Durumu" : "Report Status"}
                  </h3>
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                        style={{
                          width:
                            report.status === "pending"
                              ? "25%"
                              : report.status === "inProgress"
                              ? "50%"
                              : report.status === "completed" ||
                                report.status === "rejected"
                              ? "100%"
                              : "0%",
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            report.status
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          1
                        </div>
                        <span className="text-xs mt-2">
                          {language === "tr" ? "Alındı" : "Received"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            report.status === "inProgress" ||
                            report.status === "completed" ||
                            report.status === "rejected"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          2
                        </div>
                        <span className="text-xs mt-2">
                          {language === "tr" ? "Onay Bekliyor" : "In Review"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            report.status === "completed" ||
                            report.status === "rejected"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          3
                        </div>
                        <span className="text-xs mt-2">
                          {language === "tr" ? "Sonuçlandı" : "Completed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="space-y-6 pt-4">
                  <h3 className="font-medium border-b pb-2">
                    {language === "tr"
                      ? "Bildirim Detayları"
                      : "Report Details"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "tr" ? "Bildirim Tarihi" : "Report Date"}
                      </p>
                      <p className="font-medium">
                        {new Date(report.created_at).toLocaleDateString(
                          language === "tr" ? "tr-TR" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "tr" ? "Son Güncelleme" : "Last Updated"}
                      </p>
                      <p className="font-medium">
                        {new Date(report.updated_at).toLocaleDateString(
                          language === "tr" ? "tr-TR" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "tr"
                          ? "Bildirimde Bulunan"
                          : "Reported By"}
                      </p>
                      <p className="font-medium">
                        {report.name ? report.name : (language === "tr" ? "Anonim Bildirim" : "Anonymous Report")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "tr" ? "Olay Tarihi" : "Incident Date"}
                      </p>
                      <p className="font-medium">
                        {new Date(report.date).toLocaleDateString(
                          language === "tr" ? "tr-TR" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {language === "tr"
                          ? "Şirket ile Bağlantı"
                          : "Connection to Company"}
                      </p>
                      <p className="font-medium">
                        {getConnectionLabel(report.connection_option)}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "tr" ? "Olay Yeri" : "Incident Location"}
                      </p>
                      <p className="font-medium">{report.location}</p>
                    </div>

                    {/* Dosya Bilgileri */}
                    {report.report_files && report.report_files.length > 0 && (
                      <div className="md:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <File className="h-5 w-5" />
                          {language === "tr" ? "Yüklenen Dosyalar" : "Uploaded Files"}
                        </h3>
                        <div className="grid gap-4">
                          {report.report_files.map((file) => (
                            <div
                              key={file.id}
                              className="p-4 border rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <File className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium" title={file.file_name}>
                                      {shortenFileName(file.file_name)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {language === "tr" ? "Yükleyen" : "Uploaded by"}:{" "}
                                      {file.file_uploader_name || (language === "tr" ? "Anonim" : "Anonymous")}
                                      {file.file_uploader_email && ` (${file.file_uploader_email})`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {language === "tr" ? "Yükleme Tarihi" : "Upload Date"}:{" "}
                                      {new Date(file.file_upload_date).toLocaleString(
                                        language === "tr" ? "tr-TR" : "en-US"
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="flex items-center gap-2"
                                  >
                                    <File className="h-4 w-4" />
                                    {language === "tr" ? "Dosyayı İndir" : "Download File"}
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "tr"
                          ? "Bildirim İçeriği"
                          : "Report Content"}
                      </p>
                      <p className="whitespace-pre-line bg-muted/50 p-4 rounded-md text-sm">
                        {report.description}
                      </p>
                    </div>

                    {report.admin_notes && (
                      <div className="md:col-span-2 mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {language === "tr" ? "Yönetici Notu" : "Admin Notes"}
                        </p>
                        <div className="whitespace-pre-line bg-blue-50 border border-blue-200 p-4 rounded-md text-sm text-blue-800">
                          {report.admin_notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-muted/30 p-4 rounded-md border">
                  <h3 className="font-medium text-sm mb-2">
                    {language === "tr" ? "Sonraki Adımlar" : "Next Steps"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "tr"
                      ? "Bildiriminizin durumu değiştiğinde bu sayfayı ziyaret ederek güncel durumu görebilirsiniz. Lütfen erişim kodunuzu güvenli bir yerde saklayınız."
                      : "You can visit this page to see the current status when your report status changes. Please keep your access code in a safe place."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => router.push("/")}>
              {t.trackingPage.homeButton}
            </Button>

            {report && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => window.print()}
              >
                {language === "tr" ? "Yazdır" : "Print"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
