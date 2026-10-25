"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export default function ChatbotIcon() {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      onClick={() => alert("Chatbot coming soon ")}
      className="
        fixed bottom-6 right-6 z-[999]
        h-14 w-14 rounded-full
        bg-cyan-500
        flex items-center justify-center
        shadow-[0_0_30px_rgba(34,211,238,0.6)]
        hover:shadow-[0_0_45px_rgba(34,211,238,0.9)]
        transition-shadow
      "
      aria-label="Open Chatbot"
    >
      <MessageCircle className="h-6 w-6 text-black" />
    </motion.button>
  )
}
