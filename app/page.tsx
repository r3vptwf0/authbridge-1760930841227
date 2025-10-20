"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="text-gray-600">Get started by logging in</p>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    </div>
  )
}
