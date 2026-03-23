import type { Metadata } from "next";
import Link from "next/link";
import WifiSpeedCheckerTool from "@/components/wifi-speed-checker-tool";

export const metadata: Metadata = {
  title: "Internet Speed Test — Download, Upload & Ping | ToolCraft",
  description:
    "Free Internet Speed Test. Measure your download speed, upload speed, ping, and jitter instantly in your browser. See your IP and server info.",
};

export default function WifiSpeedCheckerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Internet Speed Test
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Test your download speed, upload speed, ping, and jitter — all from your browser. See your IP address and connection details.
      </p>

      <div className="mt-8">
        <WifiSpeedCheckerTool />
      </div>
    </main>
  );
}
