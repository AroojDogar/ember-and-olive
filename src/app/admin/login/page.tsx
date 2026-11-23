
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!password.trim()) {
      setError("Please enter your admin password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to sign in."
        );
      }

      setPassword("");

      // Open admin dashboard after successful login.
      window.location.assign("/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1510] px-5 py-12 text-[#F6F0E6]">

      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#CBAA78]/10 blur-[130px]" />

        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-[#31543A]/30 blur-[130px]" />

        <div className="absolute inset-5 border border-[#CBAA78]/10 md:inset-10" />
      </div>

      {/* LOGIN CONTAINER */}
      <div className="relative z-10 w-full max-w-[480px]">

        {/* BRAND */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-[#CBAA78]/50">
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#CBAA78]/25">
              <span className="font-serif text-2xl italic text-[#D9BB88]">
                E&O
              </span>
            </div>
          </div>

          <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
            EMBER{" "}
            <span className="italic text-[#CBAA78]">
              &
            </span>{" "}
            OLIVE
          </h1>

          <p className="mt-5 text-[10px] uppercase tracking-[0.35em] text-[#CBAA78]">
            Private Management Portal
          </p>
        </div>

        {/* LOGIN CARD */}
        <section className="border border-[#CBAA78]/35 bg-[#15231A]/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl md:p-11">

          <div className="mb-9 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.27em] text-[#CBAA78]">
              RESTRICTED ACCESS / 001
            </p>

            <h2 className="font-serif text-4xl md:text-5xl">
              Welcome{" "}
              <span className="italic text-[#D9BB88]">
                Back.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xs text-sm leading-7 text-[#A5B1A4]">
              Enter your administrator credentials
              to access the restaurant management
              suite.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="adminLoginPassword"
                className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-[#D9BB88]"
              >
                Administrator Password
              </label>

              <div className="relative">
                <input
                  id="adminLoginPassword"
                  type={
                    showPassword ? "text" : "password"
                  }
                  required
                  autoComplete="current-password"
                  maxLength={256}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full border border-[#CBAA78]/30 bg-[#0B1510] px-5 py-4 pr-20 text-sm text-[#F6F0E6] outline-none transition placeholder:text-[#637467] focus:border-[#D9BB88]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute inset-y-0 right-4 text-[10px] uppercase tracking-wider text-[#D9BB88]"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm leading-6 text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D2B17B] px-6 py-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#101813] transition duration-300 hover:bg-[#E9CEA1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "VERIFYING ACCESS..."
                : "ACCESS DASHBOARD ↗"}
            </button>
          </form>

          <div className="mt-8 border-t border-[#CBAA78]/20 pt-7 text-center">
            <p className="text-xs text-[#889A8C]">
              Authorized management personnel only.
            </p>
          </div>
        </section>

        {/* BACK TO SITE */}
        <div className="mt-9 text-center">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.22em] text-[#CBAA78] transition hover:text-[#F6F0E6]"
          >
            ← RETURN TO RESTAURANT
          </Link>
        </div>

        <p className="mt-10 text-center text-[9px] uppercase tracking-[0.2em] text-[#657B69]">
          EMBER & OLIVE — ROYAL NOIR MANAGEMENT
        </p>
      </div>
    </main>
  );
}
