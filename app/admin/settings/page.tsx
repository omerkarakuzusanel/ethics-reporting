"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { updateAdminSettings } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: true,
    autoAssign: false,
    defaultLanguage: "tr",
  })

  const handleToggle = (field: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }))
  }

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAdminSettings(settings)
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ayarlar</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>Uygulama genel ayarlarını yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Varsayılan Dil</Label>
                <select
                  id="defaultLanguage"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.defaultLanguage}
                  onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">İngilizce</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoAssign">Otomatik Rapor Atama</Label>
                  <p className="text-sm text-muted-foreground">Yeni raporları otomatik olarak müsait yöneticilere ata</p>
                </div>
                <Switch
                  id="autoAssign"
                  checked={settings.autoAssign}
                  onCheckedChange={() => handleToggle("autoAssign")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>Bildirim alma tercihlerinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificationsEnabled">Bildirimleri Etkinleştir</Label>
                  <p className="text-sm text-muted-foreground">Yeni raporlar ve güncellemeler için bildirim al</p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={() => handleToggle("notificationsEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">Önemli güncellemeler için e-posta bildirimleri al</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                  disabled={!settings.notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>Hesap güvenlik ayarlarınızı yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifreyi Onayla</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Şifreyi Değiştir</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>
    </div>
  )
}

