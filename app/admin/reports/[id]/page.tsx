"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save } from "lucide-react"
import { getReportById, updateReport } from "@/lib/admin-api"
import { useTranslation } from "@/lib/translation"
import { useToast } from "@/hooks/use-toast"
import { shortenFileName } from "@/lib/utils"

interface ReportDetail {
  id: string
  created_at: string
  description: string
  location: string
  date: string
  status: "pending" | "inProgress" | "completed" | "rejected"
  access_code: string
  identity_option: string
  connection_option: string
  name: string | null
  email: string | null
  phone: string | null
  admin_notes: string | null
  updated_at: string
  updated_by: string | null
  report_files: {
    id: string
    file_name: string
    file_url: string
    file_uploader_name: string | null
    file_uploader_email: string | null
    file_upload_date: string
  }[]
  report_updates: {
    id: string
    updated_at: string
    updated_by: string | null
    previous_status: string
    new_status: string
    previous_notes: string | null
    new_notes: string | null
    update_type: string
  }[]
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportById(resolvedParams.id)
        setReport(data)
        setStatus(data.status)
        setAdminNotes(data.admin_notes || "")
      } catch (error) {
        console.error("Error fetching report:", error)
        toast({
          title: language === "tr" ? "Hata" : "Error",
          description: language === "tr" ? "Rapor yüklenirken bir hata oluştu" : "Error loading report",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [resolvedParams.id, toast, language])

  const handleSave = async () => {
    if (!report) return

    setSaving(true)
    try {
      await updateReport(report.id, {
        status,
        admin_notes: adminNotes,
      })

      // Update local state
      setReport({
        ...report,
        status: status as any,
        admin_notes: adminNotes,
      })

      // Show success toast
      toast({
        title: language === "tr" ? "Başarılı" : "Success",
        description: language === "tr" ? "Rapor başarıyla güncellendi" : "Report updated successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error updating report:", error)

      // Show error toast
      toast({
        title: language === "tr" ? "Hata" : "Error",
        description: error?.message || (language === "tr" ? "Rapor güncellenirken bir hata oluştu" : "Failed to update report"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading report details...</div>
  }

  if (!report) {
    return <div>Report not found</div>
  }

  const getConnectionLabel = (option: string) => {
    // Check if it's an "other" type with details
    if (option.startsWith("other:")) {
      const otherValue = option.substring(6) // Remove "other:" prefix
      return `${t.reportForm.connection.other} (${otherValue})`
    }

    // Standard options
    switch (option) {
      case "employee":
        return t.reportForm.connection.employee
      case "former":
        return t.reportForm.connection.formerEmployee
      case "other":
        return t.reportForm.connection.other
      default:
        return option
    }
  }

  const getIdentityLabel = (option: string) => {
    switch (option) {
      case "share":
        return report.name || report.email || report.phone 
          ? t.reportForm.identity.shareInfo 
          : "Anonim Bildirim"
      case "anonymous":
        return t.reportForm.identity.anonymous
      default:
        return option
    }
  }

  // Tarih formatlaması için yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    if (!mounted) return dateString // Sunucu tarafında ham tarihi göster
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR')
    } catch (e) {
      return dateString
    }
  }

  // Tarih ve saat formatlaması için yardımcı fonksiyon
  const formatDateTime = (dateString: string) => {
    if (!mounted) return dateString // Sunucu tarafında ham tarihi göster
    
    try {
      const date = new Date(dateString)
      return date.toLocaleString('tr-TR')
    } catch (e) {
      return dateString
    }
  }

  // Güncelleme tipini Türkçe'ye çeviren yardımcı fonksiyon
  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case "status_change":
        return "Durum Değişikliği"
      case "notes_update":
        return "Not Güncellemesi"
      case "general_update":
        return "Genel Güncelleme"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Rapor Detayları</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapor Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Açıklama</h3>
                <p className="whitespace-pre-line">{report.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Konum</h3>
                  <p>{report.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Olay Tarihi</h3>
                  <p>{formatDate(report.date)}</p>
                </div>
              </div>

              {report.report_files && report.report_files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Yüklenen Dosyalar</h3>
                  <div className="space-y-2">
                    {report.report_files.map((file) => (
                      <div key={file.id} className="p-4 rounded-md border bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium" title={file.file_name}>
                              {shortenFileName(file.file_name)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {mounted && (language === "tr" ? "Yükleyen" : "Uploaded by")}: {file.file_uploader_name || (mounted && language === "tr" ? "Anonim" : "Anonymous")}
                              {file.file_uploader_email && ` (${file.file_uploader_email})`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {mounted && (language === "tr" ? "Yükleme Tarihi" : "Upload Date")}: {formatDateTime(file.file_upload_date)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              {mounted && (language === "tr" ? "Dosyayı Görüntüle" : "View File")}
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bildiren Kişi</h3>
                <p>{getIdentityLabel(report.identity_option)}</p>
              </div>

              {report.identity_option === "share" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">İsim</h3>
                    <p>{report.name || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">E-posta</h3>
                    <p>{report.email || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefon</h3>
                    <p>{report.phone || "Belirtilmemiş"}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Şirketle İlişki</h3>
                <p>{getConnectionLabel(report.connection_option)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapor Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Rapor ID</h3>
                <p className="text-sm font-mono">{report.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Erişim Kodu</h3>
                <p className="text-sm font-mono">{report.access_code}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Gönderilme Tarihi</h3>
                <p>{formatDateTime(report.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Mevcut Durum</h3>
                <Badge className="mt-1">{mounted && t.statusLabels[report.status as keyof typeof t.statusLabels]}</Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Son Güncelleme</h3>
                <p>{formatDateTime(report.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Durum Güncelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Durum</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Onay Bekliyor</SelectItem>
                    <SelectItem value="inProgress">Değerlendiriliyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="rejected">İhlal Tespit Edilmedi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Yönetici Notları</label>
                <Textarea
                  placeholder="Bu rapor hakkında iç notlar ekleyin"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Not: Bu notlar rapor sahibi tarafından görülebilir.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full flex items-center gap-2" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Güncelleme Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              {report.report_updates && report.report_updates.length > 0 ? (
                <div className="space-y-4">
                  {report.report_updates.map((update) => (
                    <div key={update.id} className="p-4 border rounded-md bg-muted/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{getUpdateTypeLabel(update.update_type)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(update.updated_at)}
                          </p>
                        </div>
                      </div>
                      
                      {update.update_type === "status_change" && (
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="font-medium">Önceki Durum:</span>{" "}
                            {mounted && t.statusLabels[update.previous_status as keyof typeof t.statusLabels]}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Yeni Durum:</span>{" "}
                            {mounted && t.statusLabels[update.new_status as keyof typeof t.statusLabels]}
                          </p>
                        </div>
                      )}
                      
                      {update.update_type === "notes_update" && (
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="font-medium">Önceki Not:</span>{" "}
                            {update.previous_notes || "Not yok"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Yeni Not:</span>{" "}
                            {update.new_notes || "Not yok"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Henüz güncelleme yapılmamış.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

