import { getToolBySlug } from "@/lib/tool-categories";

type Props = { slug: string; name?: string; description?: string };

export default function WebAppSchema({ slug, name, description }: Props) {
  const tool = getToolBySlug(slug);
  const resolvedName = name ?? tool?.name ?? slug;
  const resolvedDesc = description ?? tool?.desc ?? "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${resolvedName} – ToolMint`,
    url: `https://toolmint.tools/tools/${slug}`,
    description: resolvedDesc,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "ToolMint",
      url: "https://toolmint.tools",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}