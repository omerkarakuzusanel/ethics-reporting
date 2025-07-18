"use client"

import * as React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.replace("/admin/login")
    }
  }, [user, loading, pathname, router])

  // Don't render anything during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  // Don't render the layout on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { name: "Arayüz", path: "/admin" },
    { name: "Bildirimler", path: "/admin/reports" },
    //{ name: "Ayarlar", path: "/admin/settings" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={pathname === item.path ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push(item.path)}
                      >
                        {item.name}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold">Etik Bildirim Kontrol Paneli</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm hidden md:inline-block">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r hidden md:block">
          <div className="p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}

