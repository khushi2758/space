import React from 'react'
import Image from "next/image";
import { History, BellRing, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import avt from "../../public/icon/avt.png";

const Navbar = () => {
  return (
    <div className="bg-[radial-gradient(circle,rgba(1,2,18,1)_0%,rgba(13,25,43,1)_100%)] z-30 absolute top-0 left-0 w-full">
      <div className="flex items-center justify-between border-b border-amber-50 px-3">
        <Link href="/Homepage" className="text-blue-200 hover:text-gray-400 p-4 font-bold uppercase tracking-widest shadow-blue-600">
          Cosmic Watch
        </Link>

        <nav>
          <ul className="flex items-center gap-6 p-4">
            <li className="relative group">
              <Link href="/AestDest" className="text-white">
                <LayoutDashboard />
              </Link>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition bg-blue-950 text-white text-xs px-3 py-1 rounded-md border border-blue-900">
                Dashboard
              </span>
            </li>

            <li className="relative group">
              <Link href="/HistoryPage" className="text-white">
                <History />
              </Link>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition bg-blue-950 text-white text-xs px-3 py-1 rounded-md border border-blue-900">
                History
              </span>
            </li>

            <li className="relative group">
              <Link href="/Alert" className="text-white">
                <BellRing />
              </Link>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition bg-blue-950 text-white text-xs px-3 py-1 rounded-md border border-blue-900">
                Alert
              </span>
            </li>

            <li className="relative group">
              <Image src={avt} alt="Avatar" className="w-6 h-6 rounded-full" />
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition bg-blue-950 text-white text-xs px-3 py-1 rounded-md border border-blue-900">
                Profile
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Navbar
