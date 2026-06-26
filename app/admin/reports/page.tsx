"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Search } from "lucide-react"
import { getAllReports } from "@/lib/admin-api"

interface Report {
  id: string
  created_at: string
  description: string
  location: string
  date: string
  status: "pending" | "inProgress" | "completed" | "rejected"
  access_code: string
  hr_manual_entry: boolean
}

const STATUS_LABELS: Record<Report["status"], string> = {
  pending: "Onay Bekliyor",
  inProgress: "Değerlendiriliyor",
  completed: "Tamamlandı",
  rejected: "İhlal Tespit Edilmedi",
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllReports()
        setReports(data)
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.access_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || report.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">Onay Bekliyor</Badge>
      case "inProgress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Değerlendiriliyor</Badge>
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Tamamlandı</Badge>
      case "rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">İhlal Tespit Edilmedi</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEntryTypeBadge = (isHrManualEntry: boolean) => {
    if (isHrManualEntry) {
      return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">İK Manuel Girişi</Badge>
    }

    return <Badge variant="outline">Standart Bildirim</Badge>
  }

  const escapeExcelCell = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  const handleExport = () => {
    if (filteredReports.length === 0) {
      return
    }

    const rows = filteredReports
      .map((report) => {
        const createdAt = new Date(report.created_at).toLocaleString("tr-TR")
        const incidentDate = new Date(report.date).toLocaleDateString("tr-TR")
        const entryType = report.hr_manual_entry ? "İK Manuel Girişi" : "Standart Bildirim"
        const status = STATUS_LABELS[report.status]

        return `
          <tr>
            <td>${escapeExcelCell(createdAt)}</td>
            <td>${escapeExcelCell(report.access_code)}</td>
            <td>${escapeExcelCell(entryType)}</td>
            <td>${escapeExcelCell(status)}</td>
            <td>${escapeExcelCell(report.location)}</td>
            <td>${escapeExcelCell(incidentDate)}</td>
            <td>${escapeExcelCell(report.description)}</td>
          </tr>
        `
      })
      .join("")

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th>Rapor Tarihi</th>
                <th>Erişim Kodu</th>
                <th>Giriş Tipi</th>
                <th>Durum</th>
                <th>Konum</th>
                <th>Olay Tarihi</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([String.fromCharCode(0xfeff), html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tum-raporlar-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <Button onClick={handleExport} disabled={loading || filteredReports.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          Excel&apos;e Aktar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Raporlarda ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Duruma göre filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Onay Bekliyor</SelectItem>
                <SelectItem value="inProgress">Değerlendiriliyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="rejected">İhlal Tespit Edilmedi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-8 text-center">Raporlar yükleniyor...</div>
          ) : filteredReports.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Arama kriterlerinize uygun rapor bulunamadı</div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Erişim Kodu</TableHead>
                    <TableHead>Giriş Tipi</TableHead>
                    <TableHead className="hidden md:table-cell">Konum</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell>{new Date(report.created_at).toLocaleDateString("tr-TR")}</TableCell>
                      <TableCell className="font-mono">{report.access_code}</TableCell>
                      <TableCell>{getEntryTypeBadge(report.hr_manual_entry)}</TableCell>
                      <TableCell className="hidden md:table-cell">{report.location}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/reports/${report.id}`)}>
                          Görüntüle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
