"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function WalletPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Wallet</h1>
        <p className="text-2xl text-gray-600">IN CONSTRUCTION</p>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
