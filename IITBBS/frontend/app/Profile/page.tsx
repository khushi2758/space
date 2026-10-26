"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import {
  Activity,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Fingerprint,
  Globe2,
  History,
  LayoutGrid,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Orbit,
  Pencil,
  Rocket,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  Zap,
} from "lucide-react";
import Navbar from "../Homepage/navbar";
import { getCurrentUser, logoutUser } from "@/features/auth/auth.api";

/* ---------- Fonts (same look as the dashboard: blocky display + mono) ---------- */
const display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

/* ---------- Star field (box-shadow technique) ---------- */
function generateStars(count: number, opacity: string): string {
  if (typeof window === "undefined") return "";

  return Array.from({ length: count })
    .map(
      () =>
        `${Math.random() * 2000}px ${Math.random() * 2000}px rgba(255,255,255,${opacity})`
    )
    .join(",");
}

function StarField() {
  // Generated after mount only, so server and client HTML match (no hydration error).
  const [stars, setStars] = useState({ small: "", medium: "", large: "" });

  useEffect(() => {
    setStars({
      small: generateStars(500, "0.5"),
      medium: generateStars(200, "0.7"),
      large: generateStars(80, "0.95"),
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 h-px w-px rounded-full"
        style={{ boxShadow: stars.small }}
      />
      <div
        className="absolute left-0 top-0 h-[2px] w-[2px] rounded-full"
        style={{ boxShadow: stars.medium }}
      />
      <div
        className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full"
        style={{ boxShadow: stars.large }}
      />
    </div>
  );
}

type Tab = "Overview" | "Account" | "Security" | "Preferences";

const initialProfile = {
  name: "Space Explorer",
  username: "space_explorer",
  email: "",
  bio: "Exploring the universe, one asteroid at a time.",
  location: "Earth, Solar System",
};

const tabs: { label: Tab; icon: typeof UserRound }[] = [
  { label: "Overview", icon: Activity },
  { label: "Account", icon: UserRound },
  { label: "Security", icon: ShieldCheck },
  { label: "Preferences", icon: Settings },
];

/* ---------- Shared style tokens ---------- */
const card = "rounded-xl border border-white/10 bg-[#050912]";
const insetCard = "rounded-lg border border-white/[0.07] bg-[#02050c]";
const monoFont = "font-[family-name:var(--font-mono)]";
const displayFont = "font-[family-name:var(--font-display)]";

function SectionTitle({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon?: typeof Orbit;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={22} className="text-slate-200" />}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {subtitle && (
        <p className={`mt-1 text-xs text-slate-500 ${monoFont}`}>{subtitle}</p>
      )}
    </div>
  );
}

/* Unframed stat, like "Tracked Objects / Hazardous" in the dashboard */
function Stat({
  label,
  value,
  icon: Icon,
  tone = "text-white",
}: {
  label: string;
  value: string;
  icon: typeof Orbit;
  tone?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${tone}`}>
        {value}
      </p>
      <Icon size={22} className="mt-2 text-slate-400" strokeWidth={1.5} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-white/10 bg-[#02050c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10 ${monoFont}`}
      />
    </label>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* Circular gauge, same construction as the Velocity ring */
function Ring({ percent }: { percent: number }) {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="#2a3344"
          strokeWidth="8"
        />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[#1a2233]">
        <span className="text-4xl font-bold text-white">{percent}</span>
        <span className="text-xs text-slate-400">% complete</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [profile, setProfile] = useState(initialProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError("");

        const result = await getCurrentUser();
        // Supports common response shapes: { user }, { data: { user } }, or a user object.
        const user = result?.user ?? result?.data?.user ?? result?.data ?? result;

        if (!user || typeof user !== "object") {
          throw new Error("The current-user endpoint returned an invalid response.");
        }

        if (!cancelled) {
          setProfile({
            name: user.name ?? user.fullName ?? user.username ?? "Space Explorer",
            username: user.username ?? "",
            email: user.email ?? "",
            bio: user.bio ?? initialProfile.bio,
            location: user.location ?? initialProfile.location,
          });
        }
      } catch (error) {
        console.error("Failed to load Cosmic Watch profile:", error);
        if (!cancelled) {
          setProfileError(
            "Unable to load your profile. Check that you are logged in and that the backend is available."
          );
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    asteroidAlerts: true,
    weeklyDigest: false,
    compactView: false,
  });

  const updateProfile = (key: keyof typeof initialProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const saveProfile = () => {
    // No profile-update endpoint was included in the supplied auth.api.ts.
    // Keep the edited values in UI state and clearly tell the user they are not persisted.
    setEditMode(false);
    setSaved(true);
    setMessage(
      "Profile updated in this page only. Add a backend profile-update endpoint to save these changes permanently."
    );
  };

  const handleLogout = async () => {
    if (loadingLogout) return;

    setLoadingLogout(true);
    setMessage("");

    try {
      await logoutUser();
      router.replace("/Loginpage");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage(
        "Logout failed. Check your backend connection and the /api/auth/logout route."
      );
    } finally {
      setLoadingLogout(false);
    }
  };

  const filled = [
    profile.name,
    profile.username,
    profile.email,
    profile.bio,
    profile.location,
  ].filter((v) => v.trim()).length;
  const completeness = Math.round((filled / 5) * 100);
  const initial = profile.name.charAt(0).toUpperCase() || "S";

  return (
    <main
      className={`${display.variable} ${mono.variable} relative min-h-screen overflow-hidden bg-[#02040a] text-white`}
    >
      <StarField />

      <Navbar />

      {(loadingProfile || profileError) && (
        <div className="relative z-20 mx-auto max-w-[1400px] px-6 pt-5">
          {loadingProfile ? (
            <div
              role="status"
              className={`rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200 ${monoFont}`}
            >
              Loading your Cosmic Watch profile...
            </div>
          ) : (
            <div
              role="alert"
              className={`flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between ${monoFont}`}
            >
              <span>{profileError}</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-fit rounded-md border border-amber-400/30 px-3 py-1.5 hover:bg-amber-500/10"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16">
        {/* Page heading */}
        <div className="mb-10">
          <h1
            className={`bg-gradient-to-r from-blue-500 to-slate-400 bg-clip-text text-5xl font-bold leading-tight text-transparent ${displayFont}`}
          >
            Profile
          </h1>
          <p className={`mt-1 text-sm tracking-wider text-slate-300 ${monoFont}`}>
            Explorer identity &amp; account control
          </p>
        </div>

        {/* Stats row */}
        <section className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          <Stat label="Asteroids Explored" value="128" icon={Orbit} />
          <Stat
            label="Saved Objects"
            value="24"
            icon={Star}
            tone="text-red-400"
          />
          <Stat label="Research Sessions" value="36" icon={Activity} />
          <Stat label="Explorer Score" value="2,480" icon={Zap} />
        </section>

        {/* Main grid */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* LEFT */}
          <div className="min-w-0 space-y-8">
            {/* Profile hero */}
            <div>
              <SectionTitle title="Explorer Profile" icon={Globe2} />

              <div className={`${card} relative overflow-hidden`}>
                <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/40 bg-gradient-to-br from-[#10213f] to-[#050912] text-3xl font-bold text-blue-300">
                        {initial}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#050912] bg-teal-500 text-white">
                        <Check size={12} />
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold">
                          {profile.name}
                        </h2>
                        <span
                          className={`rounded-md border border-teal-500/40 bg-teal-950/60 px-2 py-0.5 text-[11px] text-teal-300 ${monoFont}`}
                        >
                          Explorer
                        </span>
                      </div>
                      <p className={`mt-1 text-sm text-slate-400 ${monoFont}`}>
                        @{profile.username}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} />
                          {profile.email || "Email not connected"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Globe2 size={14} />
                          {profile.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("Account");
                      setEditMode(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 md:w-auto"
                  >
                    <Pencil size={15} />
                    Edit profile
                  </button>
                </div>

                <div className="grid gap-4 border-t border-white/[0.07] px-6 py-4 sm:grid-cols-3">
                  {[
                    {
                      icon: Rocket,
                      label: "Explorer rank",
                      value: "Space Pioneer",
                      tone: "text-blue-300",
                    },
                    {
                      icon: Star,
                      label: "Member status",
                      value: "Cosmic Explorer",
                      tone: "text-amber-300",
                    },
                    {
                      icon: ShieldCheck,
                      label: "Account security",
                      value: "Protected session",
                      tone: "text-teal-300",
                    },
                  ].map(({ icon: Icon, label, value, tone }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={20} className={tone} strokeWidth={1.5} />
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-0.5 text-sm font-semibold">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs + content */}
            <div>
              <SectionTitle title="Account Center" icon={Settings} />

              <div className={`${card} overflow-hidden`}>
                <nav className="flex overflow-x-auto border-b border-white/[0.08] px-2">
                  {tabs.map(({ label, icon: Icon }) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => {
                        setActiveTab(label);
                        setMessage("");
                      }}
                      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm transition ${
                        activeTab === label
                          ? "border-blue-500 text-white"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          activeTab === label
                            ? "text-blue-400"
                            : "text-slate-500"
                        }
                      />
                      {label}
                    </button>
                  ))}
                </nav>

                <section className="min-w-0 p-5 sm:p-6">
                  {message && (
                    <div
                      role="status"
                      className={`mb-5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-200 ${monoFont}`}
                    >
                      {message}
                    </div>
                  )}

                  {activeTab === "Overview" && (
                    <div className="space-y-8">
                      <div>
                        <SectionTitle
                          title="Profile overview"
                          subtitle="Your identity in the Cosmic Watch universe."
                        />

                        <div className={`${insetCard} p-5`}>
                          <p className="text-sm leading-7 text-slate-300">
                            {profile.bio}
                          </p>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-slate-500">
                                Display name
                              </p>
                              <p className="mt-1 text-sm text-white">
                                {profile.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Username</p>
                              <p className={`mt-1 text-sm text-white ${monoFont}`}>
                                @{profile.username}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Email</p>
                              <p className="mt-1 break-all text-sm text-white">
                                {profile.email || "Not connected"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Location</p>
                              <p className="mt-1 text-sm text-white">
                                {profile.location}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("Account");
                              setEditMode(true);
                            }}
                            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
                          >
                            Update your profile
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <SectionTitle
                          title="Recent activity"
                          subtitle="Example activity items. Connect your history API for real records."
                        />

                        <div className="space-y-3">
                          {[
                            {
                              icon: Orbit,
                              title: "Asteroid explorer",
                              detail: "Continue exploring near-Earth objects",
                              time: "Explore",
                              color: "text-blue-300",
                            },
                            {
                              icon: Star,
                              title: "Saved discoveries",
                              detail: "Review your favourite celestial objects",
                              time: "Saved",
                              color: "text-amber-300",
                            },
                            {
                              icon: ShieldCheck,
                              title: "Account security",
                              detail: "Review your authentication settings",
                              time: "Secure",
                              color: "text-teal-300",
                            },
                          ].map((item) => {
                            const Icon = item.icon;

                            return (
                              <div
                                key={item.title}
                                className={`${insetCard} flex items-center gap-4 p-4 transition hover:border-white/20`}
                              >
                                <Icon
                                  size={22}
                                  strokeWidth={1.5}
                                  className={`shrink-0 ${item.color}`}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white">
                                    {item.title}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {item.detail}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs text-slate-500 ${monoFont}`}
                                >
                                  {item.time}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "Account" && (
                    <div>
                      <SectionTitle
                        title="Account settings"
                        subtitle="Update your personal information."
                      />

                      <div
                        className={`${insetCard} mb-6 flex items-center gap-4 p-4`}
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/40 bg-gradient-to-br from-[#10213f] to-[#050912] text-xl font-bold text-blue-300">
                          {initial}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {profile.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Profile avatar
                          </p>
                        </div>
                        <span className={`text-xs text-slate-500 ${monoFont}`}>
                          Initials
                        </span>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Display name"
                          value={profile.name}
                          onChange={(value) => updateProfile("name", value)}
                          placeholder="Your name"
                        />
                        <Field
                          label="Username"
                          value={profile.username}
                          onChange={(value) => updateProfile("username", value)}
                          placeholder="Your username"
                        />
                        <Field
                          label="Email address"
                          type="email"
                          value={profile.email}
                          onChange={(value) => updateProfile("email", value)}
                          placeholder="you@example.com"
                        />
                        <Field
                          label="Location"
                          value={profile.location}
                          onChange={(value) => updateProfile("location", value)}
                          placeholder="Your location"
                        />
                        <div className="sm:col-span-2">
                          <label className="block">
                            <span className="mb-2 block text-xs text-slate-400">
                              Bio
                            </span>
                            <textarea
                              rows={3}
                              value={profile.bio}
                              onChange={(event) =>
                                updateProfile("bio", event.target.value)
                              }
                              className={`w-full resize-y rounded-lg border border-white/10 bg-[#02050c] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10 ${monoFont}`}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={saveProfile}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                          Save changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfile(initialProfile);
                            setEditMode(false);
                            setSaved(false);
                          }}
                          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
                        >
                          Reset demo data
                        </button>
                      </div>

                      {saved && (
                        <p
                          className={`mt-4 flex items-center gap-2 text-xs text-amber-400 ${monoFont}`}
                        >
                          <Check size={14} />
                          UI updated locally. Connect your profile-update API
                          to persist changes.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "Security" && (
                    <div>
                      <SectionTitle
                        title="Security & privacy"
                        subtitle="Manage how you access your Cosmic Watch account."
                      />

                      <div className="mb-6 space-y-3">
                        {[
                          {
                            icon: Mail,
                            tone: "text-teal-300",
                            title: "Email verification",
                            text: profile.email
                              ? "Check your account's verification status with the backend."
                              : "Connect your registered email to view its verification status.",
                            badge: (
                              <span
                                className={`rounded-md border border-amber-500/30 bg-amber-950/50 px-2 py-0.5 text-[11px] text-amber-300 ${monoFont}`}
                              >
                                Unverified UI
                              </span>
                            ),
                          },
                          {
                            icon: LockKeyhole,
                            tone: "text-blue-300",
                            title: "Password & authentication",
                            text: "Your backend should manage password changes and authentication tokens securely.",
                            badge: (
                              <span
                                className={`text-xs text-slate-500 ${monoFont}`}
                              >
                                JWT
                              </span>
                            ),
                          },
                          {
                            icon: Fingerprint,
                            tone: "text-slate-300",
                            title: "Active sessions",
                            text: "Manage sessions through your backend's session management endpoints.",
                            badge: (
                              <span
                                className={`text-xs text-slate-500 ${monoFont}`}
                              >
                                Managed by API
                              </span>
                            ),
                          },
                        ].map(({ icon: Icon, tone, title, text, badge }) => (
                          <div
                            key={title}
                            className={`${insetCard} flex items-start gap-4 p-4`}
                          >
                            <Icon
                              size={22}
                              strokeWidth={1.5}
                              className={`mt-0.5 shrink-0 ${tone}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white">
                                {title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {text}
                              </p>
                            </div>
                            {badge}
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-5">
                        <h3 className="font-semibold text-white">Sign out</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Revoke your current session using your backend logout
                          endpoint.
                        </p>
                        <button
                          type="button"
                          disabled={loadingLogout}
                          onClick={handleLogout}
                          className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <LogOut size={16} />
                          {loadingLogout ? "Signing out..." : "Log out"}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "Preferences" && (
                    <div>
                      <SectionTitle
                        title="Preferences"
                        subtitle="Choose how Cosmic Watch keeps you informed."
                      />

                      <div className="divide-y divide-white/[0.07]">
                        <SettingToggle
                          title="Email notifications"
                          description="Receive account updates by email."
                          checked={preferences.emailAlerts}
                          onChange={() => togglePreference("emailAlerts")}
                        />
                        <SettingToggle
                          title="Asteroid alerts"
                          description="Show alerts for configured asteroid conditions."
                          checked={preferences.asteroidAlerts}
                          onChange={() => togglePreference("asteroidAlerts")}
                        />
                        <SettingToggle
                          title="Weekly digest"
                          description="Receive a weekly summary of your activity."
                          checked={preferences.weeklyDigest}
                          onChange={() => togglePreference("weeklyDigest")}
                        />
                        <SettingToggle
                          title="Compact view"
                          description="Prefer denser layouts when supported."
                          checked={preferences.compactView}
                          onChange={() => togglePreference("compactView")}
                        />
                      </div>

                      <div className={`${insetCard} mt-6 p-4`}>
                        <div className="flex items-start gap-3">
                          <Moon size={18} className="mt-0.5 text-blue-300" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              Cosmic dark mode
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              This dashboard uses a dark theme. Notification
                              and display preferences currently remain in local
                              page state until you connect a preferences API.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>

          {/* RIGHT: gauge panel, mirrors the Velocity card */}
          <aside className={`${card} p-6 lg:sticky lg:top-6`}>
            <div className="mb-6 flex items-center gap-3">
              <Zap size={22} className="text-slate-200" />
              <h2 className="text-lg font-semibold">Profile Strength</h2>
            </div>

            <Ring percent={completeness} />

            <div className="mt-5 text-center">
              <p className="text-lg font-semibold">
                {completeness === 100 ? "Fully Charted" : "Mapping in Progress"}
              </p>
              <p className="text-sm text-slate-400">
                {filled} of 5 profile fields filled
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Activity size={22} className="text-slate-200" />
              <h3 className="text-lg font-semibold">Quick Stats</h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className={`${insetCard} p-3`}>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <Orbit size={14} className="text-blue-400" />
                  Explored
                </p>
                <p className="mt-2 text-lg font-semibold">128</p>
              </div>
              <div className={`${insetCard} p-3`}>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap size={14} className="text-amber-400" />
                  Score
                </p>
                <p className="mt-2 text-lg font-semibold">2,480</p>
              </div>
            </div>

            <div className={`${insetCard} mt-6 p-4`}>
              <div className="flex items-center gap-3">
                <CircleHelp size={20} className="text-blue-300" />
                <p className="text-sm font-medium text-white">Need help?</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Having trouble with your cosmic account?
              </p>
              <button
                type="button"
                onClick={() => setMessage("Connect your support page here.")}
                className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                Contact support
              </button>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.07] pt-6 text-xs text-slate-600 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Cosmic Watch. Explore responsibly.</p>
          <div className={`flex items-center gap-2 ${monoFont}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Cosmic systems standing by
          </div>
        </footer>
      </div>
    </main>
  );
}