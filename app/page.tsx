"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white flex items-center justify-center px-4">
      <div className="bg-white p-12 rounded-lg shadow-xl text-center max-w-md w-full border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-light tracking-tight text-gray-900">
          Welcome
        </h1>
        <p className="mt-6 text-lg text-gray-500 font-light">
          Your personal finance and productivity management platform
        </p>

        <div className="mt-10">
          <Button
            size="lg"
            className="w-full bg-gray-900 text-white hover:bg-gray-800 font-light text-lg py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => router.push("/login")}
          >
            Get Started
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-400 font-light">
          Sign in to access your dashboard
        </p>
      </div>
    </div>
  )
}
