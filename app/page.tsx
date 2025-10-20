"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6">
      <div className="relative bg-white/80 backdrop-blur-lg p-12 rounded-2xl shadow-2xl text-center max-w-lg w-full border border-gray-200 hover:shadow-3xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Glow circle background */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-tr from-gray-400/10 to-gray-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-tr from-gray-300/10 to-gray-400/10 rounded-full blur-3xl"></div>

        {/* Logo placeholder */}
        <div className="mb-8">
          <h1 className="text-6xl font-extralight text-gray-900 tracking-tight">
            Welcome
          </h1>
        </div>

        <p className="mt-4 text-lg text-gray-600 font-light leading-relaxed">
          Take control of your <span className="text-gray-900 font-medium">finances</span> 
          {" "}and boost your <span className="text-gray-900 font-medium">productivity</span> 
          {" "}— all in one intuitive platform.
        </p>

        <div className="mt-10">
          <Button
            size="lg"
            className="w-full py-6 rounded-xl text-lg font-light bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push("/login")}
          >
            Get Started
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-400 font-light">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-gray-900 hover:underline cursor-pointer font-medium"
          >
            Sign in here
          </span>
        </p>
      </div>
    </div>
  )
}
