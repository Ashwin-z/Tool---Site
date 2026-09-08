import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// This catch-all route now returns 404 for any unknown tool slug.
// All real tools have their own dedicated directories under /tools/.
// This prevents thin placeholder pages from being generated for arbitrary URLs.

export default async function ToolPlaceholderPage({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug } = await params;
  notFound();
}
