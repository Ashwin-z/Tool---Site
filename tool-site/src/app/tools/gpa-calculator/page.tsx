import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import GpaCalculatorTool from "@/components/gpa-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "GPA Calculator – Compute Semester GPA and CGPA Online",
  description:
    "Calculate GPA, CGPA, and weighted GPA online for free. Supports US 4.0 scale, India 10-point scale, UK classification, and custom grading. Instant results, no signup.",
  keywords: [
    "gpa calculator online free",
    "cgpa calculator india 10 point scale",
    "cgpa to percentage calculator",
    "semester gpa calculator",
    "weighted gpa calculator",
    "college gpa calculator",
    "how to calculate cgpa india",
    "gpa calculator 4.0 scale",
  ],
  alternates: { canonical: "/tools/gpa-calculator" },
  openGraph: {
    title: "GPA Calculator – Semester GPA, CGPA & 10-Point Scale | ToolMint",
    description:
      "Calculate semester GPA and CGPA with US 4.0, India 10-point, UK, or custom grading scales. Free, instant.",
    url: "/tools/gpa-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Tracking semester GPA",
    desc: "Enter your courses, grades, and credit hours to calculate your semester GPA and see how it affects your cumulative CGPA.",
  },
  {
    title: "Converting CGPA to percentage (India)",
    desc: "Use the 10-point scale to calculate CGPA and convert it to a percentage using the university-standard multiplier for Indian universities.",
  },
  {
    title: "Checking graduate school eligibility",
    desc: "Most graduate programs require a minimum GPA or CGPA. Calculate your current standing to know if you meet the threshold before applying.",
  },
];

const steps = [
  { title: "Add your courses", desc: "Enter each subject or course for the semester." },
  { title: "Enter grades and credits", desc: "Provide the grade and credit hours (or units) for each course." },
  { title: "Select grading scale", desc: "Choose US 4.0, India 10-point, UK classification, or a custom scale." },
  { title: "View GPA and CGPA", desc: "See your semester GPA and cumulative CGPA calculated instantly." },
];

const faqs = [
  {
    q: "How is CGPA calculated in Indian universities?",
    a: "CGPA (Cumulative Grade Point Average) is calculated by multiplying each subject's grade point by its credit hours, summing all those values, and dividing by the total credit hours. For example, if a 4-credit course has grade point 8 and a 3-credit course has grade point 9, CGPA = (4×8 + 3×9) ÷ (4+3) = (32+27) ÷ 7 = 8.43.",
  },
  {
    q: "How do I convert CGPA to percentage for Indian universities?",
    a: "The most common conversion is CGPA × 9.5, as recommended by several Indian universities including affiliates of the UGC. Some universities use their own multiplier — check your institution's specific policy. A CGPA of 8.0 × 9.5 = 76%.",
  },
  {
    q: "What is the US 4.0 GPA scale?",
    a: "The US 4.0 scale assigns grade points as: A/A+ = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C+ = 2.3, C = 2.0, D = 1.0, F = 0. GPA is the weighted average of grade points across all course credits.",
  },
  {
    q: "What GPA is needed for graduate school admission?",
    a: "Most US graduate programs look for a GPA of 3.0 or above on a 4.0 scale. Top programs in engineering, business, and medicine often prefer 3.5+. Indian graduate programs typically require CGPA 6.0+ on a 10-point scale.",
  },
  {
    q: "Can I calculate weighted GPA?",
    a: "Yes. The weighted GPA option accounts for the credit weight of each course, so heavier subjects (more credit hours) have more influence on the final GPA than lighter ones.",
  },
];

export default function GpaCalculatorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <WebAppSchema slug="gpa-calculator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Calculators", href: "/tools/calculators" },
            { name: "GPA Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          GPA Calculator – Semester GPA, CGPA & 10-Point Scale
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate semester GPA and cumulative CGPA online for free. Supports US 4.0 scale,
          India 10-point CGPA, UK degree classification, and custom grading scales. Enter
          your courses, grades, and credits for an instant result.
        </p>

        <div className="mt-8">
          <GpaCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a GPA Calculator
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Calculate GPA Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              India 10-Point CGPA vs. US 4.0 GPA: Understanding the Difference
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The Indian 10-point CGPA system and the US 4.0 GPA system measure academic
              performance on different scales but follow the same weighted average principle.
              In India, grade points typically range from 10 (O/Outstanding) down to 4
              (P/Pass), and subjects with more credits count proportionally more in the
              cumulative average. A CGPA of 8.5 on a 10-point scale is generally considered
              equivalent to roughly 3.4 on a US 4.0 scale. To convert CGPA to a percentage
              for job applications or graduate school in India, most universities use the
              formula: Percentage = CGPA × 9.5, though some institutions (like Anna University)
              use their own conversion tables. Always verify with your university&apos;s official
              policy before reporting a converted percentage.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Improve Your CGPA in Remaining Semesters
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              CGPA is a cumulative average, so improving it becomes harder as you complete more
              semesters — the weight of early grades is diluted but never erased. To estimate
              how much improvement is possible, use this tool to add future semesters with
              projected grade points and see what CGPA results. If you have completed 4
              semesters with a CGPA of 7.0 and want to reach 8.0, you would need to score an
              average of 9.0 in your remaining 4 semesters — which is mathematically achievable
              but requires consistent high performance. Focus first on high-credit courses, as
              improving by a grade point in a 4-credit subject has more impact than the same
              improvement in a 1-credit course. Use the credit-weighted view here to identify
              which courses move your CGPA most.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="gpa-calculator" />
      </main>
    </>
  );
}
