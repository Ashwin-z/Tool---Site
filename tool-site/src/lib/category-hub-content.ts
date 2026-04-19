export type CategoryHubContent = {
  intro: string[];
  highlights: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
};

export const categoryHubContent: Record<string, CategoryHubContent> = {
  pdf: {
    intro: [
      "ToolMint's PDF collection focuses on practical document work: reducing file size, combining pages, protecting sensitive files, and converting documents into formats people actually need at work or school.",
      "Instead of sending visitors through multiple sites, the goal is to keep everyday PDF tasks in one place with clear steps, lightweight interfaces, and outputs that are ready to download immediately.",
    ],
    highlights: [
      { title: "Document Cleanup", desc: "Compress, crop, rotate, split, and merge files before you share or archive them." },
      { title: "Conversion Workflows", desc: "Move between PDF, Word, Excel, PowerPoint, JPG, and text depending on the next task in your workflow." },
      { title: "Security Tasks", desc: "Protect files with passwords, remove passwords from files you own, redact sensitive text, and add signatures." },
      { title: "Practical Editing", desc: "Add watermarks, page numbers, and layout adjustments without installing heavyweight desktop software." },
    ],
    faqs: [
      { q: "Are ToolMint PDF tools browser-based or server-based?", a: "Most PDF utilities are designed to stay simple and privacy-conscious. Some operations run locally in your browser, while heavier PDF conversions may use secure server-side processing when needed." },
      { q: "Who are these PDF tools built for?", a: "They are useful for students, office teams, freelancers, recruiters, accountants, and anyone who needs fast document fixes without buying a dedicated PDF suite." },
      { q: "What makes this collection different from a simple link directory?", a: "Each tool is paired with task-specific guidance, clear naming, related-tool pathways, and focused page copy so visitors can solve a job instead of hunting through a generic list." },
    ],
  },
  image: {
    intro: [
      "The image category is built around common jobs people repeat every week: shrinking photos for websites, resizing product images, converting formats, cropping screenshots, and extracting text from pictures.",
      "These pages prioritize speed and privacy, which is why most image processing runs directly in the browser. That makes the tools useful for marketers, students, designers, store owners, and support teams alike.",
    ],
    highlights: [
      { title: "Compression for Web Use", desc: "Reduce upload sizes for blogs, landing pages, listings, and email attachments." },
      { title: "Format Conversion", desc: "Switch between PNG, JPG, and WebP depending on transparency, compatibility, or file-size needs." },
      { title: "Quick Visual Edits", desc: "Crop, resize, rotate, and flip images when you need a clean asset fast." },
      { title: "OCR Utilities", desc: "Extract text from screenshots, photos, notes, and scanned image files." },
    ],
    faqs: [
      { q: "Will my images be uploaded to a server?", a: "For this category, the primary design choice is local browser-based processing wherever possible so files remain on your device." },
      { q: "Can these tools help with website performance?", a: "Yes. Compression and resizing are especially useful for reducing page weight and improving load times without sacrificing acceptable visual quality." },
      { q: "Why keep separate image tools instead of one giant editor?", a: "Focused tools are faster to understand and better for intent-based visits. Someone searching for image compression, for example, should land on a page built specifically for that job." },
    ],
  },
  text: {
    intro: [
      "Text tools work best when they solve fast, repeatable writing tasks: counting words, cleaning whitespace, comparing edits, converting case, and checking draft quality before publishing or submitting.",
      "This category is intentionally useful for writers, students, editors, marketers, and support teams who need immediate text feedback without accounts, installations, or unnecessary clutter.",
    ],
    highlights: [
      { title: "Writing Metrics", desc: "Track words, characters, reading time, and structure when you're writing to a target length." },
      { title: "Cleanup and Formatting", desc: "Normalize casing, remove messy whitespace, and prepare text for publishing or coding workflows." },
      { title: "Revision Support", desc: "Compare two versions of text to spot changes before sending edits onward." },
      { title: "Language Assistance", desc: "Use lightweight grammar and spelling help for quick proofreading passes." },
    ],
    faqs: [
      { q: "Who gets the most value from these text tools?", a: "Students, bloggers, copywriters, technical writers, recruiters, SEO teams, and anyone who regularly drafts or revises text online." },
      { q: "Are these pages only tools, or do they provide context too?", a: "Each text page includes task-specific explanations, workflow guidance, and FAQ content so the page offers more than a plain input box." },
      { q: "Why hide unfinished text tools during the AdSense cleanup?", a: "Google's guidance emphasizes unique content and a good user experience. Hiding unfinished pages helps keep the live site focused on tools that genuinely work today." },
    ],
  },
  calculators: {
    intro: [
      "ToolMint's calculators are aimed at everyday decision-making: finances, health estimates, academic planning, tax math, and percentage-based checks that people often need in a hurry.",
      "Instead of acting like a thin calculator directory, the goal is to explain what each calculator is for, what inputs matter, and how to interpret the result before making a decision.",
    ],
    highlights: [
      { title: "Finance and Budgeting", desc: "Estimate EMI, ROI, break-even points, margins, tips, and tax amounts before committing money." },
      { title: "Academic and Work Planning", desc: "Use GPA and work-hours tools to plan study goals, schedules, and payroll checks." },
      { title: "Health and Lifestyle Estimates", desc: "Run BMI and calorie calculations as quick reference tools before deeper professional advice." },
      { title: "Core Math Utilities", desc: "Handle percentages, scientific functions, age differences, and common daily calculations from one library." },
    ],
    faqs: [
      { q: "Are calculator results a substitute for professional advice?", a: "No. They are designed as planning and estimation tools, and the site clearly states that legal, financial, tax, or medical decisions should still be reviewed with qualified professionals." },
      { q: "Why include explanations around simple calculators?", a: "Good calculator pages should help users understand the output, not just display a number. Context makes the tool more trustworthy and more useful." },
      { q: "What kinds of visitors benefit from this category?", a: "Borrowers, small-business owners, students, freelancers, job seekers, and people checking quick what-if scenarios before acting." },
    ],
  },
  developer: {
    intro: [
      "Developer tools on ToolMint focus on quick browser-side utility work: formatting JSON, testing encoding, generating passwords, and working with snippets without opening a full IDE for every small task.",
      "The category is intentionally lightweight so it helps engineers, QA teams, support staff, students, and technical marketers solve a small problem and move on quickly.",
    ],
    highlights: [
      { title: "Data Formatting", desc: "Beautify, validate, and inspect JSON when debugging APIs or payloads." },
      { title: "Encoding Utilities", desc: "Handle Base64 and URL encoding tasks that come up during development, testing, and support work." },
      { title: "Sandboxed Experiments", desc: "Use the snippet and Python pages for lightweight browser-based experimentation." },
      { title: "Security Helpers", desc: "Generate stronger passwords quickly with configurable rules instead of relying on guesswork." },
    ],
    faqs: [
      { q: "Why would developers use browser tools instead of local scripts?", a: "Because many jobs are tiny and immediate. Opening a page and solving one JSON or encoding task can be faster than switching context into a terminal or project repo." },
      { q: "Are these tools useful for non-developers too?", a: "Yes. QA analysts, support agents, SEO specialists, and content teams often need quick technical utilities without writing code." },
      { q: "How does this category add value beyond common utility pages?", a: "By combining usable interfaces, focused copy, practical defaults, and related-tool paths that help visitors complete adjacent tasks from one trusted place." },
    ],
  },
  seo: {
    intro: [
      "The SEO collection is built for site owners, content teams, and freelancers who need quick help with metadata, previews, crawl files, and on-page checks without subscribing to a full SEO suite.",
      "These tools are most useful when paired with explanations, because a sitemap, robots.txt file, or meta tag generator is only valuable if the visitor also understands what to do with the output.",
    ],
    highlights: [
      { title: "Metadata Drafting", desc: "Generate title, description, Open Graph, and social-sharing tags for new pages." },
      { title: "Preview and QA", desc: "Check search-snippet lengths and keyword usage before publishing or updating content." },
      { title: "Crawl Control", desc: "Create sitemap and robots.txt files to help search engines discover and understand your site." },
      { title: "Small-Site SEO Support", desc: "Give solo founders and small teams practical tools without the cost or complexity of enterprise platforms." },
    ],
    faqs: [
      { q: "Who is this category for?", a: "Founders, bloggers, agencies, content marketers, affiliate publishers, and developers doing lightweight SEO work for their own sites." },
      { q: "Why are SEO tools a strong fit for ToolMint?", a: "They solve specific publishing tasks, produce copyable outputs, and pair well with concise educational content that helps visitors avoid common mistakes." },
      { q: "What makes these pages more than thin utility pages?", a: "Each page combines the generator itself with instructions, examples, and clarification about how the output fits into a real publishing workflow." },
    ],
  },
  converters: {
    intro: [
      "Converters are some of the most frequently reused utilities on a site like this because they solve quick factual tasks: file sizes, temperature, weights, lengths, colors, and numbers expressed in words.",
      "To keep the category useful, each page aims to be immediate, readable, and practical for day-to-day work rather than burying a simple conversion inside an ad-heavy or distracting interface.",
    ],
    highlights: [
      { title: "Unit Conversion", desc: "Switch between metric and imperial values for work, study, travel, and logistics." },
      { title: "Digital Measurements", desc: "Convert bytes and file sizes when planning uploads, hosting, or storage." },
      { title: "Color Utilities", desc: "Move between HEX, RGB, and HSL during design and front-end work." },
      { title: "Everyday Helpers", desc: "Use number and randomization utilities for drafting, testing, and quick calculations." },
    ],
    faqs: [
      { q: "Why include converters on a broader tools site?", a: "Because they are high-intent utilities that people need repeatedly, and they complement adjacent categories like design, development, and office workflows." },
      { q: "How do you keep conversion pages from feeling low-value?", a: "By pairing the calculator with clear labels, relevant examples, and supporting context so visitors immediately understand both the input and the output." },
      { q: "What type of users rely on this category?", a: "Students, designers, developers, office teams, and anyone who needs a dependable answer without jumping between multiple niche sites." },
    ],
  },
};
