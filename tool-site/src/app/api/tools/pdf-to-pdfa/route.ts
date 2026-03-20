import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink, mkdir, writeFile as writeFileAsync } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { tmpdir } from "os";

export const maxDuration = 120; // 2 min max runtime

/** Path to Ghostscript console binary (Windows) */
const GS_BIN = join(process.cwd(), "bin", "ghostscript", "gs", "bin", "gswin64c.exe");

/** Path to the ICC profile directory */
const ICC_DIR = join(process.cwd(), "bin", "ghostscript", "gs", "iccprofiles");

/** Path to Ghostscript lib (contains PDFA_def.ps etc.) */
const GS_LIB = join(process.cwd(), "bin", "ghostscript", "gs", "lib");

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const conformance = (formData.get("conformance") as string) ?? "2"; // PDF/A-2b by default

  if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Please upload a valid PDF file." }, { status: 400 });
  }

  // Validate conformance level
  const validLevels = ["1", "2", "3"];
  const level = validLevels.includes(conformance) ? conformance : "2";

  const sessionDir = join(tmpdir(), `pdfa-${randomUUID()}`);
  await mkdir(sessionDir, { recursive: true });

  const inputPath = join(sessionDir, "input.pdf");
  const outputPath = join(sessionDir, "output.pdf");
  const pdfaDefPath = join(sessionDir, "PDFA_def.ps");

  try {
    // Write uploaded PDF to disk
    const arrayBuf = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(arrayBuf));

    // Create a custom PDFA_def.ps that points to our ICC profile
    const iccPath = join(ICC_DIR, "srgb.icc").replace(/\\/g, "/");
    const pdfaDef = `
% Custom PDFA_def.ps for PDF/A-${level}b conversion
systemdict /ProcessColorModel known {
} {
  /ProcessColorModel /DeviceRGB def
} ifelse

[{
  /ICCProfile (${iccPath}) def
  /OutputCondition (sRGB)
  /OutputConditionIdentifier (Custom)
  /RegistryName (http://www.color.org)
  /Info (sRGB IEC61966-2.1)
  /OutputConditionIdentifier (sRGB IEC61966-2.1)
} /PUT pdfmark

[{
  /Title (${file.name.replace(/'/g, "\\'")})
  /DOCINFO pdfmark
`;
    await writeFileAsync(pdfaDefPath, pdfaDef, "utf-8");

    // Build Ghostscript arguments
    const gsArgs = [
      "-dPDFA=" + level,
      "-dBATCH",
      "-dNOPAUSE",
      "-dNOOUTERSAVE",
      "-sProcessColorModel=DeviceRGB",
      "-sColorConversionStrategy=RGB",
      "-sDEVICE=pdfwrite",
      "-dPDFACompatibilityPolicy=1",
      `-sOutputFile=${outputPath}`,
      `-I${GS_LIB}`,
      pdfaDefPath,
      inputPath,
    ];

    // Run Ghostscript
    const result = await new Promise<{ code: number; stderr: string }>((resolve, reject) => {
      const proc = spawn(GS_BIN, gsArgs, { cwd: sessionDir, windowsHide: true });

      let stderr = "";
      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      proc.stdout.on("data", () => {
        /* discard stdout */
      });

      const timeout = setTimeout(() => {
        proc.kill("SIGKILL");
        reject(new Error("Ghostscript timed out after 90 seconds."));
      }, 90_000);

      proc.on("close", (code) => {
        clearTimeout(timeout);
        resolve({ code: code ?? 1, stderr });
      });

      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    if (result.code !== 0) {
      console.error("[pdf-to-pdfa] GS stderr:", result.stderr);
      return NextResponse.json(
        { error: `Ghostscript exited with code ${result.code}. The PDF may be malformed or unsupported.` },
        { status: 500 },
      );
    }

    // Read the output PDF
    const outBuf = await readFile(outputPath);

    const safeName = file.name.replace(/\.pdf$/i, "") + "_pdfa.pdf";

    return new NextResponse(outBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch (err) {
    console.error("[pdf-to-pdfa] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF/A conversion failed." },
      { status: 500 },
    );
  } finally {
    // Cleanup temp files
    await Promise.allSettled([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
      unlink(pdfaDefPath).catch(() => {}),
    ]);
    // Try to remove session directory
    try {
      const { rmdir } = await import("fs/promises");
      await rmdir(sessionDir);
    } catch {
      /* ignore — non-empty or already removed */
    }
  }
}
