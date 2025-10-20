"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-2xl text-gray-600">IN CONSTRUCTION</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push('/wallet')}>
            Go to Wallet
          </Button>
          <Button onClick={() => router.push('/stock')}>
            Stock Management
          </Button>
        </div>
      </div>
    </div>
  )
}
