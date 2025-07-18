"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { getAllReports } from "@/lib/admin-api"
import { useTranslation } from "@/lib/translation"
import { supabase } from "@/lib/supabase"

interface Report {
  id: string
  created_at: string
  description: string
  location: string
  date: string
  status: "pending" | "inProgress" | "completed" | "rejected"
  access_code: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { t } = useTranslation()
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Onay Bekliyor</Badge>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Raporlar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="text-center py-8">Raporlar yükleniyor...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Arama kriterlerinize uygun rapor bulunamadı</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Erişim Kodu</TableHead>
                    <TableHead className="hidden md:table-cell">Konum</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell>{new Date(report.created_at).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell className="font-mono">{report.access_code}</TableCell>
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

