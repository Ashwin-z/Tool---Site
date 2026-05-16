import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import CalorieCalculatorTool from "@/components/calorie-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Calorie Calculator – Daily Calorie Needs for Weight Loss or Gain",
  description:
    "Calculate your daily calorie needs based on age, weight, height, and activity level. Find the calorie target for weight loss, maintenance, or muscle gain. Free, instant.",
  keywords: [
    "calorie calculator for weight loss",
    "daily calorie needs calculator by age",
    "how many calories to lose 1kg per week",
    "calorie deficit calculator",
    "tdee calculator online free",
    "bmr calculator online",
    "calorie intake calculator india",
    "calories to eat per day calculator",
  ],
  alternates: { canonical: "/tools/calorie-calculator" },
  openGraph: {
    title: "Calorie Calculator – Daily Needs for Weight Loss, Maintenance & Gain | ToolMint",
    description:
      "Find your TDEE and daily calorie target for weight loss, maintenance, or muscle gain based on your stats and activity level.",
    url: "/tools/calorie-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Weight loss planning",
    desc: "Find your maintenance calories and subtract 300–500 to create a daily calorie deficit for sustainable weight loss without aggressive restriction.",
  },
  {
    title: "Maintaining current weight",
    desc: "Eat at your TDEE (Total Daily Energy Expenditure) to maintain your current weight while adjusting for activity level changes.",
  },
  {
    title: "Muscle building",
    desc: "Add 200–300 calories above maintenance for a lean bulk — enough surplus to support muscle growth without excessive fat gain.",
  },
];

const steps = [
  { title: "Enter your stats", desc: "Provide age, gender, height, and current weight." },
  { title: "Select activity level", desc: "Choose from sedentary, lightly active, moderately active, or very active." },
  { title: "Choose your goal", desc: "Select weight loss, maintenance, or weight gain." },
  { title: "View calorie target", desc: "See your BMR, TDEE, and recommended daily calories for your goal." },
];

const faqs = [
  {
    q: "How many calories do I need to lose 1 kg per week?",
    a: "1 kg of body fat contains roughly 7,700 calories. To lose 1 kg per week, you need a daily deficit of about 1,100 calories. Most nutrition guidelines recommend a more sustainable deficit of 500–750 calories per day, which yields 0.45–0.7 kg of fat loss per week.",
  },
  {
    q: "What is BMR?",
    a: "BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest — just to maintain basic functions like breathing, circulation, and cell repair. It is calculated from age, gender, height, and weight.",
  },
  {
    q: "What is TDEE?",
    a: "TDEE (Total Daily Energy Expenditure) is your total calorie burn per day, including BMR plus activity. It is calculated by multiplying BMR by an activity factor. TDEE is your calorie maintenance level — eat below it to lose, above it to gain.",
  },
  {
    q: "What calorie formula does this use?",
    a: "The calculator uses the Mifflin-St Jeor equation, which is the most accurate formula for most adults: BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) + 5 (men) or − 161 (women).",
  },
  {
    q: "Should I eat back exercise calories?",
    a: "Activity level in TDEE calculation already accounts for regular exercise. If you use a sedentary or lightly active multiplier and then exercise on top, you can eat back a portion of exercise calories. Aim for 50–75% of estimated exercise burn to account for calculator imprecision.",
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
      <WebAppSchema slug="calorie-calculator" />
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
            { name: "Calorie Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Calorie Calculator – Daily Calorie Needs for Weight Loss, Maintenance & Gain
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Find out how many calories you need per day based on your age, gender, height,
          weight, and activity level. See your BMR, TDEE, and the daily calorie target for
          weight loss, maintenance, or muscle gain.
        </p>

        <div className="mt-8">
          <CalorieCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Setting a Calorie Goal That Matches Your Target
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
            How to Use the Calorie Calculator
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
              How Many Calories to Lose Weight Safely
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Safe, sustainable weight loss requires a calorie deficit — eating fewer
              calories than you burn each day. A deficit of 500 calories per day produces
              approximately 0.45 kg (1 lb) of fat loss per week, which is the standard
              recommendation from most nutrition authorities. A deficit of 750 calories per
              day gives roughly 0.7 kg per week. Going beyond 1,000 calories per day deficit
              is generally not recommended without medical supervision as it increases
              muscle loss, fatigue, and nutrient deficiencies. For most adults, the practical
              minimum daily calorie intake is 1,200 kcal for women and 1,500 kcal for men —
              eating below these levels makes it difficult to get adequate protein, vitamins,
              and minerals. Find your TDEE from this calculator, subtract 500, and ensure
              the result stays above these minimums.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Activity Level Multipliers: How to Choose Yours
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The TDEE calculation multiplies your BMR by an activity factor. Sedentary
              (desk job, no exercise) uses 1.2×. Lightly active (1–3 days/week light
              exercise or walking) uses 1.375×. Moderately active (3–5 days/week moderate
              exercise) uses 1.55×. Very active (6–7 days/week hard exercise or physical
              job) uses 1.725×. Extra active (twice-daily training or very physical work)
              uses 1.9×. Most people in desk jobs who exercise 3–4 times per week fall into
              the moderately active category. If you are just starting out or have a
              sedentary job and walk occasionally, start with lightly active. The activity
              multiplier is the main source of TDEE estimation error — if you are not losing
              weight at the calculated deficit, try reducing by 100–150 calories rather than
              changing the multiplier.
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

        <RelatedTools slug="calorie-calculator" />
      </main>
    </>
  );
}
