"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/us-states";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const US_COUNTRY_ID = 3;

type Status = "idle" | "submitting" | "success" | "error";

const ORANGE = "#ff6c0e";

const inputClass =
  "w-full rounded-full border-2 border-[#111] bg-transparent px-6 py-3 text-[15px] text-[#111] outline-none focus:border-[#ff6c0e] disabled:opacity-60";
const selectClass = inputClass + " appearance-none";
const labelClass =
  "block text-[12px] font-bold uppercase tracking-[0.2em] text-[#111] mb-2";

interface FormData {
  clientType: "" | "private" | "professional";
  firstName: string;
  lastName: string;
  // Pro Planner branch only
  companyName: string;
  companyCountryId: number | "";
  companyState: string;
  // Private Client branch only
  venue: "" | "residential" | "commercial";
  eventType: "" | "wedding" | "corporate" | "fundraiser" | "party";
  eventDate: string;
  attendees: string;
  island: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostcode: string;
  billingCountryId: number | "";
  email: string;
  phone: string;
  usedBefore: "" | "yes" | "no";
  message: string;
  consent: boolean;
  _hp_company_url: string;
}

const INITIAL: FormData = {
  clientType: "",
  firstName: "",
  lastName: "",
  companyName: "",
  companyCountryId: "",
  companyState: "",
  venue: "",
  eventType: "",
  eventDate: "",
  attendees: "",
  island: "Oahu",
  billingStreet: "",
  billingCity: "",
  billingState: "",
  billingPostcode: "",
  billingCountryId: US_COUNTRY_ID,
  email: "",
  phone: "",
  usedBefore: "",
  message: "",
  consent: false,
  _hp_company_url: "",
};

export function RentalInquiryForm() {
  const [data, setData] = useState<FormData>(INITIAL);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stepError, setStepError] = useState("");
  const [startedAt] = useState<number>(() => Date.now());

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    if (stepError) setStepError("");
  }

  function validateStep1(): string {
    if (!data.clientType) return "Please choose Private Client or Professional Planner.";
    if (!data.firstName.trim() || !data.lastName.trim()) return "Please enter your first and last name.";
    if (data.clientType === "private") {
      if (!data.venue) return "Please choose a venue type.";
    } else {
      if (!data.companyName.trim()) return "Please enter the company name.";
      if (!data.companyCountryId) return "Please choose a company country.";
      if (data.companyCountryId === US_COUNTRY_ID && !data.companyState) return "Please choose a company state.";
    }
    return "";
  }

  function validateStep2(): string {
    if (!data.eventDate) return "Please choose your event date.";
    if (!/^\d+$/.test(data.attendees) || Number(data.attendees) < 1) return "Please enter the number of attendees.";
    if (!data.island) return "Please choose an island.";
    if (!data.billingStreet.trim() || !data.billingCity.trim() || !data.billingState.trim() || !data.billingPostcode.trim()) {
      return "Please complete the billing address.";
    }
    if (!data.billingCountryId) return "Please choose a billing country.";
    return "";
  }

  function validateStep3(): string {
    if (!data.email.trim() || !EMAIL_RE.test(data.email.trim())) return "Please enter a valid email address.";
    if (!data.phone.trim()) return "Please enter a phone number.";
    if (!data.usedBefore) return "Please tell us if you've used our services before.";
    if (!data.consent) return "Please tick the acknowledgment box to continue.";
    return "";
  }

  function next() {
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) { setStepError(err); return; }
    setStepError("");
    setStep((s) => (s === 1 ? 2 : 3));
  }

  function back() {
    setStepError("");
    setStep((s) => (s === 3 ? 2 : 1));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const err = validateStep3();
    if (err) { setStepError(err); return; }

    setStatus("submitting");
    setErrorMsg("");

    const payload = {
      ...data,
      companyCountryId: data.companyCountryId || null,
      billingCountryId: data.billingCountryId || null,
      _t: Date.now() - startedAt,
    };

    try {
      const res = await fetch("/api/rental-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(json.error || "Something went wrong. Please try again in a moment.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again in a moment.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-10 sm:p-14 text-center" role="status">
        <p className="text-[12px] font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>
          Got it
        </p>
        <h3 className="mt-3 text-[#111] font-bold leading-[1.1]" style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}>
          Thanks, we&apos;ll be in touch<span style={{ color: ORANGE }}>.</span>
        </h3>
        <p className="mt-4 text-[15px] leading-[1.7] text-[#555] max-w-[520px] mx-auto">
          Your inquiry is in. A team member will follow up personally within one business day to confirm
          dates, availability, and the details.
        </p>
      </div>
    );
  }

  const isPro = data.clientType === "professional";
  const nameLabel = isPro ? "Planner Name" : "Name";

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#e5e5e5] rounded-2xl p-6 sm:p-10">
      {/* Honeypot — hidden from real users */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <label>
          Company URL (leave blank)
          <input
            type="text"
            name="_hp_company_url"
            tabIndex={-1}
            autoComplete="off"
            value={data._hp_company_url}
            onChange={(e) => update("_hp_company_url", e.target.value)}
          />
        </label>
      </div>

      <Stepper step={step} />

      {step === 1 && (
        <div className="mt-8 grid gap-6">
          <Field label="Which fits you best?">
            <select
              value={data.clientType}
              onChange={(e) => update("clientType", e.target.value as FormData["clientType"])}
              className={selectClass}
              required
            >
              <option value="">Select…</option>
              <option value="private">Private Client</option>
              <option value="professional">Professional Planner</option>
            </select>
          </Field>

          {data.clientType && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={`${nameLabel} (First)`}>
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={inputClass}
                  autoComplete="given-name"
                  required
                />
              </Field>
              <Field label={`${nameLabel} (Last)`}>
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={inputClass}
                  autoComplete="family-name"
                  required
                />
              </Field>
            </div>
          )}

          {data.clientType === "private" && (
            <RadioGroup
              label="Venue"
              name="venue"
              value={data.venue}
              options={[
                { value: "residential", label: "Residential" },
                { value: "commercial", label: "Commercial" },
              ]}
              onChange={(v) => update("venue", v as FormData["venue"])}
            />
          )}

          {isPro && (
            <>
              <Field label="Company Name">
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  className={inputClass}
                  autoComplete="organization"
                  required
                />
              </Field>

              <Field label="Company Country">
                <select
                  value={data.companyCountryId}
                  onChange={(e) => update("companyCountryId", e.target.value ? Number(e.target.value) : "")}
                  className={selectClass}
                  required
                >
                  <option value="">Select…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              {data.companyCountryId === US_COUNTRY_ID && (
                <Field label="Company State">
                  <select
                    value={data.companyState}
                    onChange={(e) => update("companyState", e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Select…</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date of Event">
              <input
                type="date"
                value={data.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Number of Attendees">
              <input
                type="number"
                min={1}
                value={data.attendees}
                onChange={(e) => update("attendees", e.target.value.replace(/\D/g, ""))}
                className={inputClass}
                required
              />
            </Field>
          </div>

          <Field label="Which island is your event on?">
            <select
              value={data.island}
              onChange={(e) => update("island", e.target.value)}
              className={selectClass}
            >
              <option value="Oahu">Oahu</option>
            </select>
          </Field>

          <p className={labelClass + " !mb-0 mt-2"}>Billing Address</p>
          <Field label="Street">
            <input
              type="text"
              value={data.billingStreet}
              onChange={(e) => update("billingStreet", e.target.value)}
              className={inputClass}
              autoComplete="street-address"
              required
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City">
              <input
                type="text"
                value={data.billingCity}
                onChange={(e) => update("billingCity", e.target.value)}
                className={inputClass}
                autoComplete="address-level2"
                required
              />
            </Field>
            <Field label="State / Province">
              <input
                type="text"
                value={data.billingState}
                onChange={(e) => update("billingState", e.target.value)}
                className={inputClass}
                autoComplete="address-level1"
                required
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="ZIP / Postal Code">
              <input
                type="text"
                value={data.billingPostcode}
                onChange={(e) => update("billingPostcode", e.target.value)}
                className={inputClass}
                autoComplete="postal-code"
                required
              />
            </Field>
            <Field label="Country">
              <select
                value={data.billingCountryId}
                onChange={(e) => update("billingCountryId", e.target.value ? Number(e.target.value) : "")}
                className={selectClass}
                required
              >
                <option value="">Select…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
                autoComplete="tel"
                required
              />
            </Field>
          </div>

          <RadioGroup
            label="Have you used our services before?"
            name="usedBefore"
            value={data.usedBefore}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            onChange={(v) => update("usedBefore", v as FormData["usedBefore"])}
          />

          <Field label="Tell us about the event you are having (optional)">
            <textarea
              value={data.message}
              onChange={(e) => update("message", e.target.value)}
              rows={5}
              maxLength={4000}
              className="w-full rounded-2xl border-2 border-[#111] bg-transparent px-6 py-3 text-[15px] text-[#111] outline-none focus:border-[#ff6c0e] resize-y"
            />
          </Field>

          <label className="flex items-start gap-3 text-[14px] text-[#444] leading-[1.6] cursor-pointer">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#ff6c0e]"
              required
            />
            <span>
              I agree to be contacted by Accel Event Rentals about this inquiry.
            </span>
          </label>
        </div>
      )}

      {(stepError || errorMsg) && (
        <p role="status" className="mt-6 text-[14px]" style={{ color: "#b42318" }}>
          {stepError || errorMsg}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="rounded-full border-2 border-[#111] bg-transparent px-8 py-3 text-[13px] font-bold tracking-wider text-[#111] hover:bg-[#111] hover:text-white transition-colors"
          >
            ← BACK
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-[#ff6c0e] px-8 py-3 text-[13px] font-bold tracking-wider text-white hover:bg-[#e55d00] transition-colors"
          >
            CONTINUE →
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-full bg-[#ff6c0e] px-8 py-3 text-[13px] font-bold tracking-wider text-white hover:bg-[#e55d00] transition-colors disabled:opacity-60"
          >
            {status === "submitting" ? "SENDING…" : "START A QUOTE"}
          </button>
        )}
      </div>
    </form>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Personal" },
    { n: 2, label: "Event" },
    { n: 3, label: "Contact" },
  ];
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      {items.map((it, i) => {
        const active = step === it.n;
        const done = step > it.n;
        return (
          <div key={it.n} className="flex items-center gap-2 sm:gap-4 flex-1">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors"
              style={{
                borderColor: active || done ? ORANGE : "#ccc",
                backgroundColor: done ? ORANGE : "transparent",
                color: done ? "#fff" : active ? ORANGE : "#999",
              }}
            >
              {done ? "✓" : it.n}
            </div>
            <span
              className="text-[12px] font-bold uppercase tracking-[0.2em]"
              style={{ color: active ? "#111" : done ? "#111" : "#999" }}
            >
              {it.label}
            </span>
            {i < items.length - 1 && (
              <div className="hidden sm:block flex-1 h-[2px]" style={{ backgroundColor: done ? ORANGE : "#e5e5e5" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function RadioGroup({ label, name, value, options, onChange }: RadioGroupProps) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className="cursor-pointer select-none"
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                className="inline-block rounded-full border-2 px-6 py-2.5 text-[14px] font-semibold transition-colors"
                style={{
                  borderColor: checked ? ORANGE : "#111",
                  backgroundColor: checked ? ORANGE : "transparent",
                  color: checked ? "#fff" : "#111",
                }}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
