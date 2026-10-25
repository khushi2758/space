
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import astronaut from '@/public/bglog.png'
import space from '@/public/images/bg.jpg'
import { registerUser } from "@/features/auth/auth.api";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [stars, setStars] = useState('')
const [stars2, setStars2] = useState('')


const router = useRouter();

const handleRegister = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  try {
    await registerUser({ username, email, password });

    sessionStorage.setItem("verificationEmail", email);
    router.push("/Verify");
  } catch (error) {
    console.error("Registration failed:", error);
  }
};

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  return (
    
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-200 flex items-center justify-center px-6">

      <div className="absolute inset-0 z-0">
        <Image
          src={space}
          alt="Background"
          fill
          className="object-cover opacity-40 scale-105"
          priority
        />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#020617]/60 to-[#020617]" />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="stars" />
        <div className="stars2" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        <div className="absolute -top-35 left-1/2 -translate-x-1/2 z-20">
          <Image
            src={astronaut}
            alt="astronaut"
            className="w-44 sm:w-52 drop-shadow-[0_20px_50px_rgba(0,150,255,0.3)]"
            priority
          />
        </div>

        <div className="relative z-10 bg-white/3 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-white/10 mt-10">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Join the mission and explore the universe
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="group">
              <label htmlFor="username" className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            <div className="group">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            {message && <p role="status" className="text-sm text-green-400">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Already have an account?{' '}
          <Link href="/Loginpage" className="text-blue-400 cursor-pointer hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .stars, .stars2 {
          position: absolute;
          width: 1px;
          height: 1px;
          background: transparent;
          top: 0;
          left: 0;
        }
        .stars {
          box-shadow: ${isClient ? generateStars(700, '0.9') : 'none'};
          animation: animStar 150s linear infinite;
        }
        .stars2 {
          box-shadow: ${isClient ? generateStars(200, '0.4') : 'none'};
          animation: animStar 100s linear infinite;
        }
        @keyframes animStar {
          from { transform: translateY(0); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  )
}

function generateStars(count: number, opacity: string): string {
  return Array.from({ length: count })
    .map(() => `${Math.random() * 2000}px ${Math.random() * 2000}px rgba(255,255,255,${opacity})`)
    .join(',')
}
