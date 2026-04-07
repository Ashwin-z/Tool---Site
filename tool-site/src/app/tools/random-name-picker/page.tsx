import type { Metadata } from "next";
import Link from "next/link";
import RandomNamePickerTool from "@/components/random-name-picker-tool";

export const metadata: Metadata = {
  title: "Random Name Picker — Raffle Winner Picker & Random Selector | ToolMint",
  description:
    "Pick one or more random names from a list for raffles, giveaways, classrooms, and team selection. ToolMint's Random Name Picker supports duplicate mode, history, and animated winner selection.",
  keywords: [
    "random name picker",
    "raffle winner picker",
    "random winner generator",
    "name picker online",
    "random selector",
    "giveaway winner picker",
    "classroom name picker",
    "team picker",
    "random draw tool",
    "random list picker",
    "fisher yates name picker",
    "toolmint random name picker",
  ],
  alternates: { canonical: "/tools/random-name-picker" },
  openGraph: {
    title: "Random Name Picker — Raffle Winner Picker & Random Selector | ToolMint",
    description:
      "Enter a list of names, choose how many winners to pick, allow duplicates if needed, and track recent picks in your browser.",
    url: "/tools/random-name-picker",
  },
};

const includedTools = [
  {
    title: "Name List Input",
    desc: "Paste or type one name per line into the textarea and the tool automatically counts how many valid names are loaded.",
  },
  {
    title: "Pick Count Selector",
    desc: "Choose exactly how many names to draw so you can use the same tool for a single winner, multiple winners, or group assignments.",
  },
  {
    title: "Duplicate Mode",
    desc: "Allow duplicates when you want names to be eligible for reselection, or turn duplicates off for fair one-time winner draws.",
  },
  {
    title: "Animated Results & History",
    desc: "Watch a short spinning animation during each draw, then review the selected names and the recent pick history for up to 20 rounds.",
  },
];

const steps = [
  { title: "Enter names", desc: "Add one name per line in the input box. The counter updates automatically as you add or remove entries." },
  { title: "Choose how many to pick", desc: "Set the number of winners or selected names you want the tool to draw from the list." },
  { title: "Set duplicate mode", desc: "Turn Allow duplicates on if names can be selected more than once, or leave it off for a non-repeating draw." },
  { title: "Run the picker", desc: "Start the draw to see the animated selection, then view the chosen names and recent history below." },
];

const faqs = [
  {
    q: "Can this random name picker choose more than one winner?",
    a: "Yes. ToolMint's Random Name Picker lets you choose how many names to draw, so you can pick one winner or multiple winners from the same list.",
  },
  {
    q: "What happens when Allow duplicates is turned off?",
    a: "When duplicates are disabled, the tool uses a shuffle-based selection so the same name is not picked twice in the same draw. That makes it suitable for fair raffles, classroom selection, and team assignment.",
  },
  {
    q: "Does the picker keep a history of previous draws?",
    a: "Yes. The tool stores a recent history of past rounds so you can review prior selections. It keeps up to 20 rounds of pick history in the interface.",
  },
  {
    q: "Is the selection random?",
    a: "Yes. For non-duplicate draws, the tool uses Fisher-Yates style shuffling to randomize the list before selecting results. In duplicate mode, it chooses names randomly from the available entries.",
  },
  {
    q: "What can I use this random picker for?",
    a: "It works well for raffle winners, giveaway draws, classroom participation, secret selections, meeting facilitators, team assignments, and any situation where you need a fast random choice from a list of names.",
  },
];

export default function RandomNamePickerPage() {
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
          Random Name Picker — Pick Winners, Teams &amp; Classroom Names
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Enter a list of names and randomly pick one or more winners instantly. ToolMint's picker is
          built for raffles, giveaways, classroom picks, and team selection, with duplicate mode,
          animated draws, and recent pick history built in.
        </p>

        <div className="mt-8">
          <RandomNamePickerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Random Picker Tools
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
            How to Use the Random Name Picker
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
