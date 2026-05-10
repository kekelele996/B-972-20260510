import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Toaster } from "sonner"

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster position="top-center" richColors />
      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-white">
        © 2024 小双子包子铺。保留所有权利。
      </footer>
    </div>
  )
}
