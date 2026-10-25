
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
  verifyEmail,
  resendOtp,
} from "@/features/auth/auth.api";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("verificationEmail") || "";
  });

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Verify OTP
  const handleVerify = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await verifyEmail({ email: email.trim(), otp });

      sessionStorage.removeItem("verificationEmail");
      setMessage("Email verified successfully!");

      router.push("/Homepage");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ||
              "Invalid or expired OTP."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setMessage("");
    setResending(true);

    try {
      await resendOtp(email.trim());
      setMessage("A new OTP has been sent to your email.");
      setOtp("");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ||
              "Could not resend OTP."
          : "Something went wrong. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl"
      >
        <h1 className="mb-3 text-center text-3xl font-bold text-white">
          Verify Your Email
        </h1>

        <p className="mb-6 text-center text-sm text-slate-400">
          Enter the OTP sent to your email address.
        </p>

        <label className="mb-2 block text-sm text-slate-300">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-blue-400"
        />

        <label className="mb-2 block text-sm text-slate-300">
          One-Time Password
        </label>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value.replace(/\D/g, "").slice(0, 6)
            )
          }
          maxLength={6}
          required
          placeholder="Enter OTP"
          className="mb-5 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-center tracking-[0.4em] text-white outline-none focus:border-blue-400"
        />

        {error && (
          <p className="mb-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 text-sm text-green-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending || loading}
          className="mt-5 w-full text-sm text-blue-400 hover:underline disabled:opacity-50"
        >
          {resending ? "Sending OTP..." : "Resend OTP"}
        </button>
      </form>
    </main>
  );
}
