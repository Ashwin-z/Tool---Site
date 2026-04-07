import type { Metadata } from "next";
import Link from "next/link";
import GpaCalculatorTool from "@/components/gpa-calculator-tool";

export const metadata: Metadata = {
  title: "GPA Calculator Online Free - GPA, CGPA, Weighted GPA & Custom Scales",
  description:
    "Use ToolMint's free GPA calculator to compute GPA, CGPA, and weighted GPA with US 4.0, India 10-point, UK, 5-point, and custom grading scales.",
  keywords: [
    "gpa calculator",
    "gpa calculator online free",
    "cgpa calculator",
    "college gpa calculator",
    "custom grading scale calculator",
    "credit hour gpa calculator",
    "weighted gpa calculator",
    "free grade calculator",
  ],
  alternates: { canonical: "/tools/gpa-calculator" },
  openGraph: {
    title: "GPA Calculator Online Free | ToolMint",
    description:
      "Calculate GPA, CGPA, and weighted GPA with multiple grading scales, credits, and custom grade points in one tool.",
    url: "/tools/gpa-calculator",
  },
};

const includedTools = [
  { title: "GPA & CGPA Calculator", desc: "Calculate semester GPA or cumulative CGPA from grades and credits." },
  { title: "Weighted GPA", desc: "Account for course credit weight so heavier subjects influence results correctly." },
  { title: "Multiple Grading Scales", desc: "Switch between US 4.0, India 10-point, UK, 5-point, and custom scales." },
  { title: "Academic Standing", desc: "Review the resulting standing and track total credits and grade points." },
];

const steps = [
  { title: "Choose grading scale", desc: "Select US 4.0, India 10-point, UK, 5-point, or a custom scale." },
  { title: "Add courses and credits", desc: "Enter each subject, the grade earned, and its credit weight." },
  { title: "Calculate GPA", desc: "The tool computes weighted GPA or CGPA instantly based on your inputs." },
  { title: "Review and adjust", desc: "Change grades or credits to model target GPA scenarios for future semesters." },
];

const faqs = [
  {
    q: "What is GPA?",
    a: "GPA stands for Grade Point Average, a weighted average of your course grades based on credit hours or course weight.",
  },
  {
    q: "Does this tool support CGPA too?",
    a: "Yes. You can use it for both GPA and CGPA calculations depending on your education system and grading format.",
  },
  {
    q: "Can I use a custom grading scale?",
    a: "Yes. In addition to common grading systems, the calculator supports custom grade point mappings.",
  },
  {
    q: "Does this page calculate weighted GPA?",
    a: "Yes. Credits determine how much each course influences the final GPA, so the tool calculates weighted results automatically.",
  },
  {
    q: "Is this GPA calculator free?",
    a: "Yes. It is free to use online without signup.",
  },
];

export default function GpaCalculatorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          GPA Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate semester GPA or overall CGPA with ToolMint&apos;s flexible grade calculator. Add courses,
          credits, and letter grades, switch between common grading systems, and calculate weighted results for upcoming terms.
        </p>

        <div className="mt-8">
          <GpaCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included GPA Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Calculate GPA Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
