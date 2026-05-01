export type LogLevel = "info" | "warn" | "error";

export interface LogPayload {
  [k: string]: unknown;
}

export interface LogOptions {
  pii?: boolean;
}

const PII_KEYS = new Set(["email", "phone", "name", "notes", "eventLocation"]);

function redact(payload: LogPayload): LogPayload {
  const out: LogPayload = {};
  for (const [k, v] of Object.entries(payload)) {
    if (PII_KEYS.has(k)) {
      out[k] = "[redacted]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redact(v as LogPayload);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function emit(level: LogLevel, event: string, payload?: LogPayload, opts?: LogOptions): void {
  const safe = payload ? (opts?.pii ? payload : redact(payload)) : {};
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...safe,
  });
  if (level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const log = {
  info(event: string, payload?: LogPayload, opts?: LogOptions): void {
    emit("info", event, payload, opts);
  },
  warn(event: string, payload?: LogPayload, opts?: LogOptions): void {
    emit("warn", event, payload, opts);
  },
  error(event: string, payload?: LogPayload, opts?: LogOptions): void {
    emit("error", event, payload, opts);
  },
};
