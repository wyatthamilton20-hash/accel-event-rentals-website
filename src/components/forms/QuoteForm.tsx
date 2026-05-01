"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/lib/site-config";

type Status = "idle" | "submitting" | "error";

interface FormState {
  name: string;
  email: string;
  phone: string;
  eventLocation: string;
  guestCount: string;
  delivery: "delivery" | "pickup" | "";
  notes: string;
  website: string; // honeypot — must stay empty
}

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  eventLocation: "",
  guestCount: "",
  delivery: "",
  notes: "",
  website: "",
};

const FIELD_LABEL =
  "block text-[12px] font-bold uppercase tracking-[0.12em] text-[#666] mb-1.5";
const FIELD_INPUT =
  "w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 text-[14px] text-[#111] outline-none transition-colors focus:border-[#111] disabled:opacity-60";

function emailLooksValid(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function phoneLooksValid(s: string): boolean {
  // Reasonable: at least 7 digits in any format
  return s.replace(/\D/g, "").length >= 7;
}

export function QuoteForm() {
  const router = useRouter();
  const {
    items,
    eventDates,
    hydrated,
    idempotencyKey,
    clearCart,
    setCartOpen,
  } = useCart();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please share your name.";
    if (!emailLooksValid(form.email))
      errs.email = "Please enter a valid email address.";
    if (!phoneLooksValid(form.phone))
      errs.phone = "Please enter a valid phone number.";
    if (form.delivery !== "delivery" && form.delivery !== "pickup")
      errs.delivery = "Pick delivery or pickup.";
    return errs;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    if (!eventDates.start || !eventDates.end) {
      setErrorMessage(
        "Your event dates are missing. Please go back to your cart and pick start and end dates."
      );
      setStatus("error");
      return;
    }
    if (items.length === 0) {
      setErrorMessage(
        "Your cart is empty. Add at least one rental item before requesting a quote."
      );
      setStatus("error");
      return;
    }

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setErrorMessage("Please fix the highlighted fields.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      startDate: eventDates.start,
      endDate: eventDates.end,
      guestCount: form.guestCount ? Number(form.guestCount) : undefined,
      eventLocation: form.eventLocation.trim() || undefined,
      delivery: form.delivery,
      notes: form.notes.trim() || undefined,
      items: items.map((i) => ({ id: i.id, qty: i.qty })),
      website: form.website,
      idempotencyKey,
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      const data: { ok?: boolean; quoteId?: string; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.ok && data.ok && data.quoteId) {
        clearCart();
        router.push(`/quote/submitted?id=${encodeURIComponent(data.quoteId)}`);
        return;
      }

      setStatus("error");
      setErrorMessage(
        data.error ||
          `We couldn't submit your request — please try again or call us at ${SITE.phone}.`
      );
    } catch {
      setStatus("error");
      setErrorMessage(
        `We couldn't submit your request — please try again or call us at ${SITE.phone}.`
      );
    }
  }

  if (!hydrated) {
    return (
      <div className="rounded-2xl bg-white border border-[#e5e5e5] p-8 animate-pulse">
        <div className="h-5 w-40 rounded bg-[#eee]" />
        <div className="mt-4 h-4 w-full rounded bg-[#f0f0f0]" />
        <div className="mt-2 h-4 w-3/4 rounded bg-[#f0f0f0]" />
        <p className="mt-6 text-[13px] text-[#999]">Loading your quote…</p>
      </div>
    );
  }

  const hasItems = items.length > 0;
  const hasDates = eventDates.start !== "" && eventDates.end !== "";

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_320px]">
      {/* Left column — form fields */}
      <div className="space-y-6">
        {/* Contact */}
        <div className="rounded-2xl bg-white border border-[#e5e5e5] p-6 sm:p-8">
          <h2 className="text-[18px] font-bold text-[#111]">Your details</h2>
          <p className="mt-1 text-[13px] text-[#666]">
            So we know who to follow up with.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={FIELD_LABEL} htmlFor="qf-name">
                Name <span className="text-[#ff6c0e]">*</span>
              </label>
              <input
                id="qf-name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={FIELD_INPUT}
                disabled={status === "submitting"}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[12px] text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="qf-email">
                Email <span className="text-[#ff6c0e]">*</span>
              </label>
              <input
                id="qf-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={FIELD_INPUT}
                disabled={status === "submitting"}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[12px] text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="qf-phone">
                Phone <span className="text-[#ff6c0e]">*</span>
              </label>
              <input
                id="qf-phone"
                type="tel"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={FIELD_INPUT}
                disabled={status === "submitting"}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-[12px] text-red-600">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="qf-guests">
                Guest count
              </label>
              <input
                id="qf-guests"
                type="number"
                min={1}
                inputMode="numeric"
                value={form.guestCount}
                onChange={(e) => update("guestCount", e.target.value)}
                className={FIELD_INPUT}
                disabled={status === "submitting"}
              />
            </div>
          </div>
        </div>

        {/* Event */}
        <div className="rounded-2xl bg-white border border-[#e5e5e5] p-6 sm:p-8">
          <h2 className="text-[18px] font-bold text-[#111]">Event details</h2>

          <div className="mt-4">
            <label className={FIELD_LABEL} htmlFor="qf-location">
              Event location
            </label>
            <input
              id="qf-location"
              type="text"
              placeholder="e.g. Honolulu, Maui, private estate"
              value={form.eventLocation}
              onChange={(e) => update("eventLocation", e.target.value)}
              className={FIELD_INPUT}
              disabled={status === "submitting"}
            />
          </div>

          <div className="mt-5">
            <span className={FIELD_LABEL}>
              Delivery or pickup <span className="text-[#ff6c0e]">*</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(["delivery", "pickup"] as const).map((opt) => {
                const checked = form.delivery === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-[#ddd] bg-white text-[#111] hover:border-[#999]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={opt}
                      checked={checked}
                      onChange={() => update("delivery", opt)}
                      className="sr-only"
                      disabled={status === "submitting"}
                    />
                    <span className="text-[13px] font-semibold capitalize">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
            {fieldErrors.delivery && (
              <p className="mt-1 text-[12px] text-red-600">
                {fieldErrors.delivery}
              </p>
            )}
          </div>

          <div className="mt-5">
            <label className={FIELD_LABEL} htmlFor="qf-notes">
              Anything else we should know?
            </label>
            <textarea
              id="qf-notes"
              rows={4}
              placeholder="Setup notes, layout ideas, special requests…"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className={`${FIELD_INPUT} resize-y min-h-[100px]`}
              disabled={status === "submitting"}
            />
          </div>

          {/* Honeypot — visually hidden, AI-bot bait */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              height: 0,
              width: 0,
              opacity: 0,
            }}
          />
        </div>

        {/* Error banner */}
        {status === "error" && errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={status === "submitting" || !hasItems || !hasDates}
            className="w-full rounded-full bg-[#ff6c0e] px-6 py-4 text-[14px] font-bold tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ letterSpacing: "1px" }}
          >
            {status === "submitting"
              ? "Sending…"
              : "SEND MY QUOTE REQUEST"}
          </button>
          <p className="mt-3 text-[12px] text-[#888] leading-relaxed">
            We use your details only to respond to your request. We don&apos;t
            share them or store them beyond what&apos;s needed to follow up.
          </p>
        </div>
      </div>

      {/* Right column — cart summary */}
      <aside className="space-y-4">
        <div className="rounded-2xl bg-white border border-[#e5e5e5] p-6 sticky top-[160px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#111]">Your cart</h2>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="text-[12px] font-semibold text-[#ff6c0e] hover:underline cursor-pointer"
            >
              Edit cart
            </button>
          </div>

          {/* Dates */}
          <div className="mt-4 rounded-lg bg-[#f7f7f7] px-3 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#888]">
              Event dates
            </p>
            {hasDates ? (
              <p className="mt-0.5 text-[13px] font-semibold text-[#111]">
                {eventDates.start} → {eventDates.end}
              </p>
            ) : (
              <p className="mt-0.5 text-[13px] text-red-600">
                <Link
                  href="/"
                  onClick={() => setCartOpen(true)}
                  className="underline"
                >
                  Pick dates in your cart
                </Link>
              </p>
            )}
          </div>

          {/* Items */}
          <div className="mt-4">
            {!hasItems ? (
              <p className="text-[13px] text-[#999]">
                Your cart is empty.{" "}
                <Link href="/" className="underline text-[#111]">
                  Browse rentals
                </Link>
                .
              </p>
            ) : (
              <ul className="flex flex-col gap-3 max-h-[360px] overflow-y-auto">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-[#eee] p-2"
                  >
                    <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-[#f5f5f5]">
                      {(item.imageUrl || item.thumbUrl) ? (
                        <Image
                          src={item.imageUrl || item.thumbUrl!}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#111] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#888]">
                        Qty {item.qty}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}
