"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="backdrop-blur-xl bg-white/20 p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border border-white/30"
      >
        <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Welcome ✨
        </h1>
        <p className="mt-4 text-lg text-white/80">
          Your journey starts here. Sign in to unlock the full experience.
        </p>

        <div className="mt-8">
          <Button
            size="lg"
            className="w-full bg-white text-purple-600 hover:bg-purple-100 font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push("/login")}
          >
            🚀 Go to Login
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
