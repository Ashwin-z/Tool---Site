"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type PdfSecurityMode = "protect" | "unlock";
type PermissionMode = "none" | "print" | "all";

type Props = {
  mode: PdfSecurityMode;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PdfSecurityTool({ mode }: Props) {
  const isProtect = mode === "protect";
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [permission, setPermission] = useState<PermissionMode>("none");
  const [unlockPassword, setUnlockPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const title = isProtect ? "Protect PDF" : "Unlock PDF";
  const subtitle = isProtect
    ? "Add password protection with AES-256 encryption and control viewer permissions."
    : "Remove PDF password protection when you know the correct password.";

  const ctaLabel = isProtect ? "Protect PDF" : "Unlock PDF";
  const endpoint = isProtect ? "/api/tools/protect-pdf" : "/api/tools/unlock-pdf";

  const canSubmit = useMemo(() => {
    if (!file || processing) return false;
    return isProtect ? userPassword.trim().length >= 4 : unlockPassword.trim().length > 0;
  }, [file, isProtect, processing, unlockPassword, userPassword]);

  const setSelectedFile = useCallback((nextFile: File | null) => {
    if (!nextFile) return;
    if (!nextFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please choose a PDF file.");
      return;
    }

    setFile(nextFile);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const onInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  }, [setSelectedFile]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    setSelectedFile(event.dataTransfer.files?.[0] ?? null);
  }, [setSelectedFile]);

  const handleSubmit = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (isProtect) {
        formData.append("userPassword", userPassword.trim());
        formData.append("ownerPassword", ownerPassword.trim());
        formData.append("permission", permission);
      } else {
        formData.append("password", unlockPassword.trim());
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = isProtect ? "Failed to protect PDF." : "Failed to unlock PDF.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const fileName = decodeURIComponent(
        response.headers.get("x-file-name") ?? `${file.name.replace(/\.pdf$/i, "")}_${mode}.pdf`,
      );
      const ownerGenerated = response.headers.get("x-owner-password-generated") === "true";

      downloadBlob(blob, fileName);
      setSuccessMessage(
        isProtect
          ? ownerGenerated
            ? "PDF protected and downloaded. An internal owner password was generated automatically."
            : "PDF protected and downloaded successfully."
          : "PDF unlocked and downloaded successfully.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : isProtect ? "Failed to protect PDF." : "Failed to unlock PDF.");
    } finally {
      setProcessing(false);
    }
  }, [endpoint, file, isProtect, mode, ownerPassword, permission, unlockPassword, userPassword]);

  const resetState = useCallback(() => {
    setFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUserPassword("");
    setOwnerPassword("");
    setUnlockPassword("");
    setPermission("none");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-6 lg:py-6">
        <div className="space-y-4">
          <div>
            <div className="inline-flex rounded-full border border-border bg-surface/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9fa1b7]">
              PDF Security
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-white">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{subtitle}</p>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`rounded-2xl border border-dashed px-5 py-8 text-center transition ${dragOver ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-border bg-surface/30"}`}
          >
            <input ref={inputRef} type="file" accept="application/pdf" onChange={onInputChange} className="hidden" />
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#6c63ff]/15 text-2xl text-[#b7b2ff]">🔐</div>
            <h3 className="text-base font-semibold text-white">Drop your PDF here</h3>
            <p className="mt-2 text-sm text-muted">
              {isProtect ? "Upload one PDF to lock it with a password." : "Upload one protected PDF and enter its password to unlock it."}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111118] transition hover:bg-[#f2f2f7]"
            >
              Choose PDF
            </button>

            {file ? (
              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-4 text-left">
                <div className="text-sm font-semibold text-white">{file.name}</div>
                <div className="mt-1 text-xs text-[#9fa1b7]">{formatBytes(file.size)}</div>
              </div>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-surface/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c8ea6]">Settings</div>

          <div className="mt-4 space-y-4">
            {isProtect ? (
              <>
                <label className="grid gap-2">
                  <span className="text-sm text-[#d8d8e6]">Open password</span>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(event) => setUserPassword(event.target.value)}
                    placeholder="Required to open the PDF"
                    className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[#d8d8e6]">Owner password (optional)</span>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(event) => setOwnerPassword(event.target.value)}
                    placeholder="Auto-generated if left empty"
                    className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-[#d8d8e6]">Permissions</span>
                  <select
                    value={permission}
                    onChange={(event) => setPermission(event.target.value as PermissionMode)}
                    className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60"
                  >
                    <option value="none" className="bg-white text-black">No viewer permissions</option>
                    <option value="print" className="bg-white text-black">Allow printing</option>
                    <option value="all" className="bg-white text-black">Allow all permissions</option>
                  </select>
                </label>
              </>
            ) : (
              <label className="grid gap-2">
                <span className="text-sm text-[#d8d8e6]">PDF password</span>
                <input
                  type="password"
                  value={unlockPassword}
                  onChange={(event) => setUnlockPassword(event.target.value)}
                  placeholder="Enter the current password"
                  className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60"
                />
              </label>
            )}

            <div className="rounded-2xl border border-border bg-surface/50 p-4 text-sm leading-7 text-[#adb0c5]">
              {isProtect
                ? "Protect PDF uses the bundled native pdfcpu engine with AES-256 encryption. Your file is processed on the server and the protected PDF is returned for download."
                : "Unlock PDF removes password protection using the password you enter. If the password is wrong, the original PDF is left untouched and an error is shown."}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-full bg-[#ff4d6d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff365a] disabled:cursor-not-allowed disabled:bg-[#8f4151]"
              >
                {processing ? `${ctaLabel}…` : ctaLabel}
              </button>
              <button
                type="button"
                onClick={resetState}
                disabled={processing}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-[#c7c8d8] transition hover:bg-surface/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
