import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online Developer Tools — JSON Formatter, Base64, Password Generator & More",
  description:
    "6 free online developer tools on ToolMint. Format JSON, encode/decode Base64 and URLs, generate strong passwords, write Python code and share snippets. No signup required.",
  keywords: [
    "developer tools online",
    "json formatter online",
    "base64 encoder decoder",
    "url encoder decoder",
    "password generator",
    "python code editor online",
    "code playground",
  ],
  alternates: { canonical: "/tools/developer-tools" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Free Online Developer Tools — JSON, Base64, Passwords & More | ToolMint",
    description:
      "6 free browser-based developer tools. Format JSON, encode data, generate passwords and run code.",
    url: "/tools/developer-tools",
  },
};

export default function DeveloperToolsPage() {
  return <ToolCategoryHub categoryId="developer" />;
}
