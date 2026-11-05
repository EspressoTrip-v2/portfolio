"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { CV_FILE_NAME } from "@/lib/cv/file";
import { type CvChanges as Changes, type CvEvent, cvLimits, type TailoredCv, tidySpec } from "@/lib/cv/schema";
import { CvChanges } from "./CvChanges";
import { CvProgress, type ProgressStage } from "./CvProgress";
import { renderCvPdf } from "./renderCv";

type Pdf = { url: string; fileName: string };

/** The passcode is remembered on Juan's own device only. Storage can be unavailable, so every access is guarded. */
const PASSCODE_KEY = "cv-passcode";

function loadPasscode() {
  try {
    return localStorage.getItem(PASSCODE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Other tabs saving or forgetting the passcode. */
function onPasscodeChange(update: () => void) {
  window.addEventListener("storage", update);
  return () => window.removeEventListener("storage", update);
}

function savePasscode(value: string) {
  try {
    if (value) localStorage.setItem(PASSCODE_KEY, value);
    else localStorage.removeItem(PASSCODE_KEY);
  } catch {
    // Not remembered; it still works for this visit.
  }
}

/** Reads the API's newline-delimited events as they arrive. */
async function* readEvents(response: Response) {
  const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop()!;
    for (const line of lines) if (line.trim()) yield JSON.parse(line) as CvEvent;
  }
}

/** Paste a job spec, get Juan's CV for the role. The PDF shown is the PDF that downloads. */
export function CvGenerator({ standard }: { standard: TailoredCv }) {
  const [spec, setSpec] = useState("");
  // The server render has no storage, so it starts empty and the client fills in the remembered value.
  const remembered = useSyncExternalStore(onPasscodeChange, loadPasscode, () => "");
  const [typed, setPasscode] = useState<string>();
  const passcode = typed ?? remembered;
  const [cv, setCv] = useState(standard);
  const [changes, setChanges] = useState<Changes>();
  const [stage, setStage] = useState<ProgressStage>();
  const [error, setError] = useState<string>();
  const [pdf, setPdf] = useState<Pdf>();
  const length = tidySpec(spec).length;
  const tooShort = length < cvLimits.minSpecChars;
  const tooLong = length > cvLimits.maxSpecChars;
  const busy = stage !== undefined;

  // Render whichever CV is current (the general one first, then the one for the spec) to a PDF.
  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    renderCvPdf(cv)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPdf({ url, fileName: CV_FILE_NAME });
      })
      .catch((cause) => {
        console.error("CV PDF render failed", cause);
        if (!cancelled) setError("The PDF couldn't be loaded. Reload the page and try again.");
      })
      .finally(() => {
        if (!cancelled) setStage((current) => (current === "building" ? undefined : current));
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [cv]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (tooShort || tooLong || busy) return;
    setError(undefined);
    setStage("reading");
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(passcode ? { Authorization: `Bearer ${passcode}` } : {}),
        },
        body: JSON.stringify({ jobSpec: spec }),
      });
      if (!response.ok) {
        if (response.status === 401) savePasscode("");
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Try again.");
        return setStage(undefined);
      }
      savePasscode(passcode);
      for await (const item of readEvents(response)) {
        if (item.type === "stage") setStage(item.stage);
        if (item.type === "error") {
          setError(item.message);
          return setStage(undefined);
        }
        if (item.type === "result") {
          setStage("building");
          setChanges(item.changes);
          setCv(item.cv);
          return;
        }
      }
      setError("The connection closed before the CV was ready. Try again.");
      setStage(undefined);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStage(undefined);
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <form onSubmit={create} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="cv-passcode" className="block font-bold">
              Passcode
            </label>
            <input
              id="cv-passcode"
              type="password"
              autoComplete="current-password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              className="mt-1 w-72 max-w-full rounded-[4px] border border-ink-3 bg-chart px-3 py-2 text-small text-ink"
            />
          </div>
          {passcode && (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                savePasscode("");
                setPasscode("");
              }}
            >
              Forget passcode
            </Button>
          )}
        </div>
        <label htmlFor="job-spec" className="block font-bold">
          Job spec
        </label>
        <textarea
          id="job-spec"
          value={spec}
          onChange={(event) => setSpec(event.target.value)}
          rows={10}
          placeholder="Paste the full job description, including requirements and responsibilities."
          className="w-full resize-y rounded-[4px] border border-ink-3 bg-chart p-4 text-small text-ink placeholder:text-ink-3"
          aria-describedby="job-spec-count"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="job-spec-count" className={`text-data tabular-nums ${tooLong ? "text-red-ink" : "text-ink-2"}`}>
            {tooShort
              ? `${length.toLocaleString("en-GB")} / at least ${cvLimits.minSpecChars} characters`
              : `${length.toLocaleString("en-GB")} / ${cvLimits.maxSpecChars.toLocaleString("en-GB")} characters`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={tooShort || tooLong || busy}>
              {busy ? "Getting CV…" : "Get CV"}
            </Button>
            {pdf && !busy ? (
              <Button href={pdf.url} download={pdf.fileName} variant="secondary">
                Download CV
              </Button>
            ) : (
              <Button type="button" variant="secondary" disabled>
                Download CV
              </Button>
            )}
          </div>
        </div>
        {error && (
          <p role="alert" className="text-small text-red-ink">
            {error}
          </p>
        )}
      </form>

      {stage && <CvProgress stage={stage} />}

      {process.env.NODE_ENV === "development" && changes && !busy && <CvChanges changes={changes} />}

      <section aria-label="CV preview">
        {pdf ? (
          <iframe
            key={pdf.url}
            src={`${pdf.url}#view=FitH`}
            title={`CV preview: ${pdf.fileName}`}
            className="h-[85vh] w-full rounded-[2px] border border-ink-3/40 bg-white shadow-[0_10px_30px_-18px_rgb(0_0_0/0.5)]"
          />
        ) : (
          <p className="text-small text-ink-2">Preparing the CV preview…</p>
        )}
      </section>
    </div>
  );
}
