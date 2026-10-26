"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  History,
  BellRing,
  LayoutGrid,
  UserRound,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
  LoaderCircle,
  Mail,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { JetBrains_Mono } from "next/font/google";
import avt from "../../public/icon/avt.png";
import {
  getCurrentUser,
  logoutUser,
} from "@/features/auth/auth.api";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
});

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

const navItems = [
  { label: "Dashboard", href: "/AestDest", icon: LayoutGrid },
  { label: "History", href: "/HistoryPage", icon: History },
  { label: "Alerts", href: "/Alert", icon: BellRing },
];

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const dropdownRef = useRef<HTMLLIElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch the currently authenticated user from the backend
  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUser();

        // Support common API response structures
        const currentUser =
          response?.user ??
          response?.data?.user ??
          response?.data ??
          response;

        if (!active) return;

        if (currentUser && typeof currentUser === "object") {
          setUser({
            id: String(
              currentUser._id ??
                currentUser.id ??
                currentUser.userId ??
                ""
            ),
            username:
              currentUser.username ??
              currentUser.name ??
              currentUser.fullName ??
              "Space Explorer",
            email: currentUser.email ?? "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setUserLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Backend logout
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setProfileOpen(false);
      router.replace("/Loginpage");
      router.refresh();
      setLoggingOut(false);
    }
  };

  const dropdownLinkClass =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050912]/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/Homepage"
          className={`text-sm font-bold tracking-[0.2em] text-slate-100 transition hover:text-white ${mono.className}`}
        >
          COSMIC WATCH
        </Link>

        {/* Main Navigation */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    title={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      active
                        ? "bg-white/10 text-blue-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                  </Link>
                </li>
              );
            })}

            {/* Profile Button and Dropdown */}
            <li ref={dropdownRef} className="relative ml-1">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
                className={`flex items-center gap-1 rounded-full border p-0.5 pr-1.5 transition ${
                  profileOpen
                    ? "border-blue-400/70 bg-white/10"
                    : "border-white/20 hover:border-white/50 hover:bg-white/5"
                }`}
              >
                <Image
                  src={avt}
                  alt="Profile avatar"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />

                <ChevronDown
                  size={14}
                  className={`text-slate-300 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-xl border border-white/15 bg-[#0a1020]/60 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl backdrop-saturate-150"
                >
                  {/* Backend User Information */}
                  <div className="border-b border-white/10 px-3 py-4">
                    <div className="mb-4 flex items-center gap-3">
                      <Image
                        src={avt}
                        alt="Profile avatar"
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full border border-white/25 object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {userLoading
                            ? "Loading profile..."
                            : user?.username || "Space Explorer"}
                        </p>

                        <p className={`text-xs text-teal-300 ${mono.className}`}>
                          Cosmic Watch Member
                        </p>
                      </div>
                    </div>

                    {userLoading ? (
                      <div className="flex items-center gap-2 py-2 text-xs text-slate-300">
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                        Fetching account details...
                      </div>
                    ) : user ? (
                      <div className="space-y-3">
                        {/* User ID */}
                        <div className="flex items-start gap-3">
                          <Fingerprint
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-300"
                          />

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">User ID</p>
                            <p
                              title={user.id || "ID not provided by backend"}
                              className={`break-all text-xs text-slate-100 ${mono.className}`}
                            >
                              {user.username || "Not available"}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-3">
                          <Mail
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-300"
                          />

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">
                              Email address
                            </p>
                            <p
                              className={`break-all text-xs text-slate-100 ${mono.className}`}
                            >
                              {user.email || "Not available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="py-2 text-xs text-amber-300">
                        Unable to load account details.
                        Please sign in again if needed.
                      </p>
                    )}
                  </div>

                  {/* Dropdown Navigation */}
                  <div className="space-y-1 py-2">
                    <Link
                      href="/Profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className={dropdownLinkClass}
                    >
                      <UserRound size={17} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/Profile?tab=account"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className={dropdownLinkClass}
                    >
                      <Settings size={17} />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href="/Profile?tab=security"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className={dropdownLinkClass}
                    >
                      <ShieldCheck size={17} />
                      <span>Security</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-white/10 pt-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <LogOut size={17} />
                      )}

                      <span>
                        {loggingOut ? "Logging out..." : "Logout"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;