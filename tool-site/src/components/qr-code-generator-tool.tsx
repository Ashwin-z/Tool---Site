"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Minimal QR Code encoder (no dependencies) ─── */

// We use the browser's canvas to render a QR code generated via a minimal encoder.
// For simplicity and zero-dependency, we use a well-known technique:
// encode data into a Google Charts-compatible URL? No — that's external.
// Instead, we'll use a compact QR matrix generator inline.

// Since a full QR encoder from scratch is ~500+ lines, we'll use an efficient
// approach: render via SVG path data computed from a minimal QR matrix builder.

// However, for practical purposes without pulling in a library, we use the
// proven technique of generating QR via an inline minimal encoder.
// Below is a compact alphanumeric/byte-mode QR encoder for versions 1-10.

type ErrorCorrection = "L" | "M" | "Q" | "H";

// Use a canvas-based approach with the minimal QR encoding
// For the MVP, we'll generate QR using a data URL approach with SVG

function generateQRSvg(text: string, size: number, fg: string, bg: string): string {
  // Encode using a simple QR matrix generator
  const modules = encodeQR(text);
  if (!modules) return "";
  
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;
  
  let paths = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        paths += `M${col * cellSize},${row * cellSize}h${cellSize}v${cellSize}h-${cellSize}z`;
      }
    }
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${bg}"/>
    <path d="${paths}" fill="${fg}"/>
  </svg>`;
}

// ─── Compact QR encoder (Byte mode, ECC-L, versions 1-10) ───

function encodeQR(text: string): boolean[][] | null {
  const data = new TextEncoder().encode(text);
  const version = selectVersion(data.length);
  if (!version) return null;
  
  const size = version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  
  // Place finder patterns
  placeFinderPattern(matrix, 0, 0);
  placeFinderPattern(matrix, size - 7, 0);
  placeFinderPattern(matrix, 0, size - 7);
  
  // Place separators
  placeSeparators(matrix, size);
  
  // Place alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = getAlignmentPositions(version);
    for (const row of positions) {
      for (const col of positions) {
        if (matrix[row]?.[col] === null) {
          placeAlignmentPattern(matrix, row, col);
        }
      }
    }
  }
  
  // Place timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }
  
  // Dark module
  matrix[size - 8][8] = true;
  
  // Reserve format info areas
  reserveFormatAreas(matrix, size);
  
  // Reserve version info (version >= 7)
  if (version >= 7) {
    reserveVersionAreas(matrix, size);
  }
  
  // Encode data
  const encoded = encodeData(data, version);
  
  // Place data bits
  placeDataBits(matrix, encoded, size);
  
  // Apply mask (mask 0 for simplicity) and write format info
  applyMask(matrix, size, 0);
  writeFormatInfo(matrix, size, 0); // ECC L, mask 0
  
  if (version >= 7) {
    writeVersionInfo(matrix, size, version);
  }
  
  return matrix.map(row => row.map(cell => cell === true));
}

const VERSION_CAPACITIES_L = [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271]; // byte mode, ECC-L

function selectVersion(dataLen: number): number | null {
  for (let v = 1; v <= 10; v++) {
    if (dataLen <= VERSION_CAPACITIES_L[v]) return v;
  }
  return null;
}

function placeFinderPattern(matrix: (boolean | null)[][], row: number, col: number) {
  const pattern = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
  ];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (row + r < matrix.length && col + c < matrix.length) {
        matrix[row + r][col + c] = pattern[r][c] === 1;
      }
    }
  }
}

function placeSeparators(matrix: (boolean | null)[][], size: number) {
  // Horizontal & vertical separators around finder patterns
  for (let i = 0; i < 8; i++) {
    // Top-left
    if (matrix[7]?.[i] === null) matrix[7][i] = false;
    if (matrix[i]?.[7] === null) matrix[i][7] = false;
    // Top-right
    if (matrix[7]?.[size - 8 + i] === null) matrix[7][size - 8 + i] = false;
    if (matrix[i]?.[size - 8] === null) matrix[i][size - 8] = false;
    // Bottom-left
    if (matrix[size - 8]?.[i] === null) matrix[size - 8][i] = false;
    if (matrix[size - 8 + i]?.[7] === null) matrix[size - 8 + i][7] = false;
  }
}

function getAlignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const positions: number[][] = [
    [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
  ];
  return positions[version - 1] || [];
}

function placeAlignmentPattern(matrix: (boolean | null)[][], centerRow: number, centerCol: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[centerRow + r][centerCol + c] = isEdge || isCenter;
    }
  }
}

function reserveFormatAreas(matrix: (boolean | null)[][], size: number) {
  for (let i = 0; i < 9; i++) {
    if (i < size && matrix[8][i] === null) matrix[8][i] = false;
    if (i < size && matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = 0; i < 8; i++) {
    if (matrix[8][size - 8 + i] === null) matrix[8][size - 8 + i] = false;
    if (matrix[size - 8 + i]?.[8] === null) matrix[size - 8 + i][8] = false;
  }
}

function reserveVersionAreas(matrix: (boolean | null)[][], size: number) {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[i][size - 11 + j] === null) matrix[i][size - 11 + j] = false;
      if (matrix[size - 11 + j]?.[i] === null) matrix[size - 11 + j][i] = false;
    }
  }
}

// Total data codewords for each version (ECC Level L)
const TOTAL_CODEWORDS_L = [0, 19, 34, 55, 80, 108, 136, 156, 194, 232, 274];
const EC_CODEWORDS_L = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18];

function encodeData(data: Uint8Array, version: number): boolean[] {
  const totalCodewords = TOTAL_CODEWORDS_L[version];
  const ecCodewords = EC_CODEWORDS_L[version];
  const dataCodewords = totalCodewords - ecCodewords;
  
  const bits: number[] = [];
  
  // Mode indicator (0100 = byte mode)
  bits.push(0, 1, 0, 0);
  
  // Character count (8 bits for version 1-9, 16 bits for 10+)
  const countBits = version <= 9 ? 8 : 16;
  for (let i = countBits - 1; i >= 0; i--) {
    bits.push((data.length >> i) & 1);
  }
  
  // Data
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  
  // Terminator (up to 4 bits)
  const maxBits = dataCodewords * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }
  
  // Pad to byte boundary
  while (bits.length % 8 !== 0 && bits.length < maxBits) {
    bits.push(0);
  }
  
  // Pad codewords
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    for (let i = 7; i >= 0; i--) {
      bits.push((padBytes[padIdx] >> i) & 1);
    }
    padIdx = (padIdx + 1) % 2;
  }
  
  // Convert to codewords
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i + j] || 0);
    }
    codewords.push(byte);
  }
  
  // Generate EC codewords using Reed-Solomon
  const ecBytes = generateEC(codewords.slice(0, dataCodewords), ecCodewords);
  
  // Combine
  const allCodewords = [...codewords.slice(0, dataCodewords), ...ecBytes];
  
  // Convert back to bits
  const result: boolean[] = [];
  for (const cw of allCodewords) {
    for (let i = 7; i >= 0; i--) {
      result.push(((cw >> i) & 1) === 1);
    }
  }
  
  // Add remainder bits (version-dependent)
  const remainderBits = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];
  for (let i = 0; i < (remainderBits[version] || 0); i++) {
    result.push(false);
  }
  
  return result;
}

// GF(256) math for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function generateEC(data: number[], ecCount: number): number[] {
  // Build generator polynomial
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], GF_EXP[i]);
    }
    gen = newGen;
  }
  
  // Polynomial division
  const result = new Array(ecCount).fill(0);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < gen.length - 1; i++) {
      result[i] ^= gfMul(factor, gen[i + 1]);
    }
  }
  
  return result;
}

function placeDataBits(matrix: (boolean | null)[][], bits: boolean[], size: number) {
  let bitIdx = 0;
  let col = size - 1;
  
  while (col >= 0) {
    if (col === 6) col--; // skip timing column
    
    for (let row = 0; row < size; row++) {
      const actualRow = col % 4 < 2 ? size - 1 - row : row;
      
      for (const offset of [0, -1]) {
        const c = col + offset;
        if (c < 0 || c >= size) continue;
        if (matrix[actualRow][c] !== null) continue;
        
        if (bitIdx < bits.length) {
          matrix[actualRow][c] = bits[bitIdx];
          bitIdx++;
        } else {
          matrix[actualRow][c] = false;
        }
      }
    }
    
    col -= 2;
  }
}

function applyMask(matrix: (boolean | null)[][], size: number, _mask: number) {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isReserved(matrix, row, col, size)) continue;
      if ((row + col) % 2 === 0) {
        matrix[row][col] = !matrix[row][col];
      }
    }
  }
}

function isReserved(_matrix: (boolean | null)[][], row: number, col: number, size: number): boolean {
  // Finder patterns + separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  return false;
}

// Format info bits for ECC L, mask 0
const FORMAT_INFO_BITS = 0x77C4; // pre-computed for L/mask0

function writeFormatInfo(matrix: (boolean | null)[][], size: number, _mask: number) {
  const bits = FORMAT_INFO_BITS;
  const positions1 = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  const positions2 = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4],
    [8, size - 5], [8, size - 6], [8, size - 7],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8],
    [size - 3, 8], [size - 2, 8], [size - 1, 8], [size - 8, 8],
  ];
  
  for (let i = 0; i < 15; i++) {
    const bit = ((bits >> (14 - i)) & 1) === 1;
    const [r1, c1] = positions1[i];
    if (r1 < size && c1 < size) matrix[r1][c1] = bit;
    const [r2, c2] = positions2[i];
    if (r2 < size && c2 < size) matrix[r2][c2] = bit;
  }
}

// Version info (versions 7-10)
const VERSION_INFO: Record<number, number> = {
  7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3,
};

function writeVersionInfo(matrix: (boolean | null)[][], size: number, version: number) {
  const info = VERSION_INFO[version];
  if (!info) return;
  
  for (let i = 0; i < 18; i++) {
    const bit = ((info >> i) & 1) === 1;
    const row = Math.floor(i / 3);
    const col = size - 11 + (i % 3);
    matrix[row][col] = bit;
    matrix[col][row] = bit;
  }
}

/* ─── Component ─── */
export default function QrCodeGeneratorTool() {
  const [text, setText] = useState("https://toolcraft.site");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [size] = useState(300);
  const [svgContent, setSvgContent] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(() => {
    if (!text.trim()) return;
    const svg = generateQRSvg(text, size, fgColor, bgColor);
    setSvgContent(svg);
  }, [text, size, fgColor, bgColor]);

  useEffect(() => {
    generate();
  }, [generate]);

  const downloadPNG = useCallback(() => {
    if (!svgContent) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx.drawImage(img, 0, 0, size * 2, size * 2);
      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.download = "qr-code.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }, [svgContent, size]);

  const downloadSVG = useCallback(() => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "qr-code.svg";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }, [svgContent]);

  const copyToClipboard = useCallback(async () => {
    if (!svgContent || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = async () => {
      canvasRef.current!.width = size * 2;
      canvasRef.current!.height = size * 2;
      ctx.drawImage(img, 0, 0, size * 2, size * 2);
      URL.revokeObjectURL(url);

      try {
        const pngBlob = await new Promise<Blob | null>((res) =>
          canvasRef.current!.toBlob(res, "image/png")
        );
        if (pngBlob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": pngBlob }),
          ]);
        }
      } catch {
        /* clipboard API might not be available */
      }
    };
    img.src = url;
  }, [svgContent, size]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">QR Code Generator</h2>
          <p className="mt-1 text-xs text-muted">Generate QR codes from text, URLs, or any content.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 px-5 py-5 md:grid-cols-2">
          {/* Input side */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                Text or URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Enter text, URL, email, phone number..."
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
              <div className="mt-1 text-right text-[11px] text-muted-2">
                {new TextEncoder().encode(text).length} / 271 bytes
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                  Foreground
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-[#6c63ff]/50"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-[#6c63ff]/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview side */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center justify-center rounded-xl border border-border bg-white p-4"
              style={{ minHeight: 200, minWidth: 200 }}
            >
              {svgContent ? (
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              ) : (
                <span className="text-sm text-gray-400">Enter text to generate</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadPNG}
                disabled={!svgContent}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong disabled:opacity-40"
              >
                Download PNG
              </button>
              <button
                onClick={downloadSVG}
                disabled={!svgContent}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong disabled:opacity-40"
              >
                Download SVG
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!svgContent}
                className="rounded-lg border border-[#6c63ff]/40 bg-[#6c63ff]/10 px-4 py-2 text-xs font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20 disabled:opacity-40"
              >
                Copy Image
              </button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="⚡" title="Instant" desc="QR code generates as you type — no server needed." />
        <InfoCard icon="🎨" title="Customizable" desc="Pick custom foreground and background colours." />
        <InfoCard icon="📥" title="Export" desc="Download as PNG or SVG, or copy to clipboard." />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
