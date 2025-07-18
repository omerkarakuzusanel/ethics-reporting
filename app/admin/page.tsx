"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getReportStats } from "@/lib/admin-api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAdminAuth } from "@/lib/admin-auth"

interface ReportStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  rejected: number
  recentReports: {
    date: string
    count: number
  }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAdminAuth()

  const adminEmails = ["etikadmin@sanel.com.tr", "admin2@sanel.com.tr"]
  const readonlyEmails = ["etik01@sanel.com.tr", "readonly2@sanel.com.tr"]

  const isAdmin = adminEmails.includes(user?.email ?? "")
  const isReadonly = readonlyEmails.includes(user?.email ?? "")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getReportStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div>Dashboard verileri yükleniyor...</div>
  }

  if (!stats) {
    return <div>Dashboard verileri yüklenemedi</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Rapor</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Onay Bekliyor</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Değerlendiriliyor</CardDescription>
            <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tamamlandı</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Etik İhlal Tespit Edilmedi</CardDescription>
            <CardTitle className="text-3xl">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Raporlar</CardTitle>
          <CardDescription>Son 6 ayda alınan rapor sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.recentReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

