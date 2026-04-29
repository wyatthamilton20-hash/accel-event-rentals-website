"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
  variant: "footer" | "hero";
}

export function NewsletterForm({ variant }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("Thanks! You're on the list.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again in a moment.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again in a moment.");
    }
  }

  if (variant === "footer") {
    return (
      <>
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", position: "relative", maxWidth: "320px" }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
            style={{
              flex: 1,
              background: "transparent",
              border: "2px solid #111111",
              padding: "10px 90px 10px 16px",
              fontSize: "16px",
              color: "#111111",
              borderRadius: "50px",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            style={{
              position: "absolute",
              right: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#ff6c0e",
              color: "#ffffff",
              padding: "8px 20px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              borderRadius: "50px",
              border: "none",
              cursor: status === "submitting" ? "wait" : "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              opacity: status === "submitting" ? 0.6 : 1,
            }}
          >
            {status === "submitting" ? "…" : "SIGN UP"}
          </button>
        </form>
        {message && (
          <p
            role="status"
            style={{
              fontSize: "12px",
              marginTop: "8px",
              marginBottom: 0,
              color: status === "success" ? "#1a7f37" : "#b42318",
            }}
          >
            {message}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="mx-auto mt-6 flex max-w-[500px] flex-col gap-3 sm:relative sm:flex-row sm:gap-0"
      >
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="w-full rounded-full border-2 border-[#111] bg-transparent px-6 py-3 text-[16px] text-[#111] outline-none sm:pr-[150px]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-[#ff6c0e] px-6 py-3 text-[14px] font-bold tracking-wider text-white cursor-pointer sm:absolute sm:right-1 sm:top-1/2 sm:w-auto sm:-translate-y-1/2 sm:px-6 sm:py-2.5 disabled:opacity-60 transition-colors hover:bg-[#e55d00]"
          style={{ border: "none", letterSpacing: "1px" }}
        >
          {status === "submitting" ? "…" : "SIGN ME UP"}
        </button>
      </form>
      {message && (
        <p
          role="status"
          className="mt-4 text-[13px]"
          style={{ color: status === "success" ? "#1a7f37" : "#b42318" }}
        >
          {message}
        </p>
      )}
    </>
  );
}
