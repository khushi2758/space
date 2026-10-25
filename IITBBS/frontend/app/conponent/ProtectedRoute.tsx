
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/auth.api";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();

        console.log("Current user:", user);

        if (active) {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        if (active) {
          router.replace("/Loginpage");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <p className="text-blue-400 animate-pulse">
          Verifying your identity...
        </p>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
