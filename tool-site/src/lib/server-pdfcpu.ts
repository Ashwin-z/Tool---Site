import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function resolvePdfcpuPath(): Promise<string | null> {
  const candidates = [
    process.env.PDFCPU_PATH,
    path.join(process.cwd(), "bin", "pdfcpu", "pdfcpu_0.11.1_Windows_x86_64", "pdfcpu.exe"),
    path.join(process.cwd(), "bin", "pdfcpu", "pdfcpu.exe"),
    "pdfcpu.exe",
    "pdfcpu",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (candidate.includes(path.sep)) {
      if (await pathExists(candidate)) return candidate;
      continue;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(candidate, ["version"], { stdio: "ignore", windowsHide: true });
        proc.once("error", reject);
        proc.once("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Exit code ${code}`));
        });
      });
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

export async function runPdfcpu(pdfcpuPath: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(pdfcpuPath, args, { windowsHide: true });
    let stderr = "";

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.once("error", reject);
    proc.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `pdfcpu exited with code ${code ?? "unknown"}`));
    });
  });
}

export function sanitizePdfFileName(fileName: string, suffix: string): string {
  const base = fileName.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${base}${suffix}.pdf`;
}
