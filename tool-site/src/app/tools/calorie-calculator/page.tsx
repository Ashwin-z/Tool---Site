import type { Metadata } from "next";
import Link from "next/link";
import CalorieCalculatorTool from "@/components/calorie-calculator-tool";

export const metadata: Metadata = {
  title: "Calorie Calculator — BMR, TDEE & Macro Calculator | ToolMint",
  description:
    "Estimate your BMR, TDEE, and daily macro targets with ToolMint's free Calorie Calculator. Uses the Mifflin-St Jeor formula, activity multipliers, and built-in macro presets.",
  keywords: [
    "calorie calculator",
    "bmr calculator",
    "tdee calculator",
    "macro calculator",
    "maintenance calories calculator",
    "daily calorie needs",
    "mifflin st jeor calculator",
    "calorie deficit calculator",
    "macro split calculator",
    "protein fat carbs calculator",
    "calorie needs by activity",
    "toolmint calorie calculator",
  ],
  alternates: { canonical: "/tools/calorie-calculator" },
  openGraph: {
    title: "Calorie Calculator — BMR, TDEE & Macro Calculator | ToolMint",
    description:
      "Calculate BMR, maintenance calories, and macro targets using activity level and macro presets. Fast, private, and browser-based.",
    url: "/tools/calorie-calculator",
  },
};

const includedTools = [
  {
    title: "BMR Calculator",
    desc: "Estimates your Basal Metabolic Rate using the Mifflin-St Jeor formula, with separate calculations for male and female body stats.",
  },
  {
    title: "TDEE Calculator",
    desc: "Turns your BMR into daily maintenance calories by applying one of five activity multipliers from sedentary to very active.",
  },
  {
    title: "Activity Level Selector",
    desc: "Choose from 5 activity levels with clear descriptions so your maintenance calorie estimate matches your routine more accurately.",
  },
  {
    title: "Macro Presets",
    desc: "Switch between Balanced, High Protein, and Lower Carb presets to instantly calculate protein, fat, and carbohydrate targets.",
  },
  {
    title: "Daily Macro Breakdown",
    desc: "See each macro in both calories and grams, so you can use the results directly for meal planning or cutting and bulking phases.",
  },
];

const steps = [
  { title: "Enter body stats", desc: "Fill in your age, sex, height, and weight to provide the calculator with the data needed for BMR estimation." },
  { title: "Choose activity level", desc: "Pick the activity level that best matches your weekly routine so the tool can estimate your TDEE or maintenance calories." },
  { title: "Pick a macro preset", desc: "Select Balanced, High Protein, or Lower Carb to apply a macro ratio to your daily calories automatically." },
  { title: "Read your targets", desc: "Review your BMR, TDEE, and daily protein, fat, and carbohydrate grams to plan meals or calorie targets." },
];

const faqs = [
  {
    q: "What is the difference between BMR and TDEE?",
    a: "BMR is the number of calories your body needs at complete rest to maintain basic functions such as breathing and circulation. TDEE is your Total Daily Energy Expenditure, which adds activity on top of BMR and represents your estimated maintenance calories.",
  },
  {
    q: "Which formula does this calorie calculator use?",
    a: "ToolMint's Calorie Calculator uses the Mifflin-St Jeor formula for BMR. It is widely used because it gives practical calorie estimates for most adults when combined with an activity multiplier.",
  },
  {
    q: "How do I calculate calories for weight loss?",
    a: "Use the TDEE result as your maintenance baseline. For weight loss, most people subtract around 300 to 500 calories per day from maintenance. For muscle gain, they typically add calories above maintenance. This tool gives the baseline so you can adjust according to your goal.",
  },
  {
    q: "What macro presets are included?",
    a: "The calculator includes 3 built-in presets: Balanced 30/30/40, High Protein 35/30/35, and Lower Carb 35/40/25. These percentages are converted into daily grams for protein, fat, and carbs automatically.",
  },
  {
    q: "Does the calculator validate unrealistic inputs?",
    a: "Yes. The tool validates ranges such as age, height, and weight to keep the estimates practical. It accepts ages 5 to 120, heights 80 to 250 cm, and weights 20 to 350 kg.",
  },
];

export default function CalorieCalculatorPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Calorie Calculator — BMR, Maintenance Calories &amp; Macros
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Estimate your BMR and TDEE from your age, sex, height, weight, and activity level. Then use
          built-in macro presets to convert your daily calories into protein, fat, and carbohydrate targets
          you can actually use for meal planning.
        </p>

        <div className="mt-8">
          <CalorieCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Calorie Calculator Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            How to Use the Calorie Calculator
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
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
            {faqs.map((faq) => (
              <div key={faq.q}>
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
