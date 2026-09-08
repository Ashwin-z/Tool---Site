export type CategoryHubContent = {
  h1?: string;
  intro: string[];
  highlights: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  workflows?: { title: string; desc: string; links: { label: string; href: string }[] }[];
};

export const categoryHubContent: Record<string, CategoryHubContent> = {
  pdf: {
    h1: "Free PDF Tools Online – No Signup Required",
    intro: [
      "ToolMint offers free PDF tools online for the document tasks you repeat every week: compressing PDFs for email, merging files into one packet, splitting out specific pages, converting between Office formats and PDF, and securing or signing documents before sharing them. Every tool runs in your browser — no account, no watermark, no software to install.",
      "This collection is organized by task rather than by format, because the right starting point is usually the job you need to finish, not the file type you have. Whether you need to prepare a document for a portal upload, extract data from a PDF report, or add a signature to a contract, the tools here cover the full workflow.",
    ],
    workflows: [
      {
        title: "Prepare a file for upload",
        desc: "Start with the document itself, clean up page orientation or margins, then reduce the file size before sending it to a portal or attaching it to an email.",
        links: [
          { label: "Rotate PDF", href: "/tools/rotate-pdf" },
          { label: "Crop PDF", href: "/tools/crop-pdf" },
          { label: "Compress PDF", href: "/tools/compress-pdf" },
        ],
      },
      {
        title: "Assemble a final PDF packet",
        desc: "Turn source files into PDFs, combine them in the right order, then add numbering, watermarks, or signatures before sharing the final version.",
        links: [
          { label: "Image to PDF", href: "/tools/image-to-pdf" },
          { label: "Merge PDF", href: "/tools/merge-pdf" },
          { label: "Sign PDF", href: "/tools/sign-pdf" },
        ],
      },
      {
        title: "Reuse information from an existing PDF",
        desc: "When you need to work with the contents of a PDF again, choose the right output format for editing, analysis, or copying text from scanned pages.",
        links: [
          { label: "Unlock PDF", href: "/tools/unlock-pdf" },
          { label: "PDF to Word", href: "/tools/pdf-to-word" },
          { label: "PDF to Excel", href: "/tools/pdf-to-excel" },
          { label: "PDF to Text", href: "/tools/pdf-to-text" },
        ],
      },
    ],
    highlights: [
      { title: "Document Cleanup", desc: "Compress, crop, rotate, split, and merge PDFs when you need cleaner files for email, applications, printing, or archiving." },
      { title: "Conversion Workflows", desc: "Move between PDF, Word, Excel, PowerPoint, JPG, and text depending on whether you need to edit, share, present, or extract data." },
      { title: "Security Tasks", desc: "Protect sensitive PDFs with passwords, remove passwords from files you are authorized to edit, redact private content, and add signatures." },
      { title: "Practical Editing", desc: "Handle common document fixes such as watermarks, page numbers, annotations, and page layout changes without installing heavy desktop software." },
    ],
    faqs: [
      { q: "Are ToolMint PDF tools browser-based or server-based?", a: "The PDF collection favors local browser processing where possible, especially for editing, rotation, cropping, redaction, and comparison. Some conversion-heavy jobs may use secure server-side processing when the task requires it." },
      { q: "Who are these PDF tools built for?", a: "They are most useful for students, office teams, freelancers, recruiters, accountants, legal staff, and small business owners who need fast document fixes without a full PDF software subscription." },
      { q: "How do I choose the right PDF tool for a task?", a: "Start with the job you are trying to finish, not the file format alone. If you need a smaller upload, use compression. If you need one final packet, merge. If you need editable content, convert the PDF to Word, Excel, or text." },
      { q: "What makes this collection different from a thin tool directory?", a: "Each PDF page is being built as a task-focused landing page with use cases, limitations, related workflows, and clear internal paths so visitors can solve the entire document task in one place." },
    ],
  },
  image: {
    h1: "Free Online Image Tools – Compress, Resize, Crop & Convert",
    intro: [
      "The image tools collection covers the jobs you repeat most: shrinking photos before uploading to a website, resizing product images for listings, converting between formats, cropping screenshots for presentations, and extracting text from pictures. Every tool runs directly in your browser so your files never leave your device.",
      "Whether you are a blogger optimizing post images, a seller preparing product photos, a student extracting notes from a screenshot, or a developer handling image assets, each tool is built around one clear task so you can get in, get the result, and move on.",
    ],
    workflows: [
      {
        title: "Prepare images for a website",
        desc: "Start with compression to reduce file size, then resize to the exact pixel dimensions your template needs, and convert to WebP for modern browsers.",
        links: [
          { label: "Compress Image", href: "/tools/image-compressor" },
          { label: "Resize Image", href: "/tools/image-resizer" },
          { label: "Image Converter", href: "/tools/image-converter" },
        ],
      },
      {
        title: "Clean up a photo or screenshot",
        desc: "Crop to remove unwanted edges, rotate to fix orientation, then compress for sharing by email or messaging.",
        links: [
          { label: "Crop Image", href: "/tools/image-cropper" },
          { label: "Rotate/Flip", href: "/tools/image-rotate-flip" },
          { label: "Compress Image", href: "/tools/image-compressor" },
        ],
      },
      {
        title: "Convert and reuse image content",
        desc: "Change the format to match platform requirements, extract text from a screenshot with OCR, or convert images into a PDF for sharing.",
        links: [
          { label: "Image Converter", href: "/tools/image-converter" },
          { label: "Image to Text (OCR)", href: "/tools/image-to-text" },
          { label: "JPG to PDF", href: "/tools/image-to-pdf" },
        ],
      },
    ],
    highlights: [
      { title: "Compression for Web Use", desc: "Reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss. Essential for fast-loading websites and email attachments." },
      { title: "Format Conversion", desc: "Switch between PNG, JPG, WebP, and other formats based on transparency needs, browser compatibility, or file-size targets." },
      { title: "Quick Visual Edits", desc: "Crop to exact dimensions, resize without distortion, rotate sideways shots, and flip images for mirror or layout needs." },
      { title: "OCR Text Extraction", desc: "Extract typed or printed text from screenshots, photos, scanned notes, and image files without retyping anything manually." },
    ],
    faqs: [
      { q: "Are images processed on the server or in the browser?", a: "Most image tools in this collection run entirely in your browser. Your files are never uploaded to a server, which keeps them private and makes processing instant." },
      { q: "Can these tools help improve website performance?", a: "Yes. Compressing images and converting to WebP format are two of the highest-impact steps for reducing page weight and improving load times." },
      { q: "What image formats are supported?", a: "The tools collectively support JPG, JPEG, PNG, WebP, GIF, BMP, and TIFF. Individual tools list the formats they accept on their own pages." },
      { q: "Is there a file size limit for image uploads?", a: "Most tools handle standard image files without issue. Very large RAW files or extremely high-resolution photographs may take longer to process." },
    ],
  },
  text: {
    h1: "Free Online Text Tools – Word Counter, Case Converter, Grammar Checker & More",
    intro: [
      "Text tools work best when they solve fast, repeatable writing tasks: counting words, cleaning whitespace, comparing edits, converting case, and checking draft quality before publishing or submitting.",
      "Every tool here runs entirely in your browser — no account, no upload, no waiting. Paste your text and get an instant result.",
    ],
    highlights: [
      { title: "Writing Metrics", desc: "Track words, characters, reading time, and structure when writing to a target length." },
      { title: "Cleanup and Formatting", desc: "Normalize casing, remove messy whitespace, and prepare text for publishing or coding workflows." },
      { title: "Revision Support", desc: "Compare two versions of text side by side to spot additions and deletions instantly." },
      { title: "Language Assistance", desc: "Catch spelling mistakes, capitalization errors, and repeated words before publishing." },
    ],
    workflows: [
      {
        title: "Prepare a blog post for publishing",
        desc: "Check your word count is in the 1,200–2,000 word range, run the grammar checker for typos, then normalize whitespace if you pasted from a doc.",
        links: [
          { label: "Word Counter", href: "/tools/word-counter" },
          { label: "Grammar Checker", href: "/tools/grammar-checker" },
          { label: "Whitespace Remover", href: "/tools/whitespace-remover" },
        ],
      },
      {
        title: "Format text for a coding project",
        desc: "Paste a phrase and convert it to the naming convention your project uses — camelCase for JavaScript, snake_case for Python, kebab-case for CSS.",
        links: [
          { label: "Text Case Converter", href: "/tools/text-case-converter" },
          { label: "Whitespace Remover", href: "/tools/whitespace-remover" },
        ],
      },
      {
        title: "Review a document edit",
        desc: "Paste the original and revised text into the compare tool to see exactly what changed, then do a final word count.",
        links: [
          { label: "Text Compare", href: "/tools/text-compare" },
          { label: "Word Counter", href: "/tools/word-counter" },
        ],
      },
    ],
    faqs: [
      { q: "Who gets the most value from these text tools?", a: "Students, bloggers, copywriters, technical writers, recruiters, SEO teams, and anyone who regularly drafts or revises text online." },
      { q: "Do these tools work with non-English text?", a: "Word Counter, Text Case Converter, Text Compare, Text Reverser, and Whitespace Remover all handle Unicode and non-English text. The Grammar Checker is currently optimized for English only." },
      { q: "Is my text sent to any server?", a: "No. Every tool in this category runs entirely in your browser using client-side processing. Your text is never uploaded or stored anywhere." },
    ],
  },
  calculators: {
    h1: "Free Online Calculators – Finance, Health, Math & More",
    intro: [
      "ToolMint's calculators cover the decisions you face regularly: working out EMI on a loan, finding how many calories you need to lose weight, calculating GST on an invoice, converting CGPA to a percentage, or checking if a business idea is worth pursuing. Each calculator is paired with enough context to help you understand the output, not just read a number.",
      "All calculators run instantly in your browser — no account, no signup, no waiting.",
    ],
    highlights: [
      { title: "Finance and Business", desc: "Calculate loan EMI, compound interest, profit margin, ROI, break-even point, and GST — the numbers behind everyday financial decisions." },
      { title: "Health and Fitness", desc: "Find your BMI with healthy weight range, estimate daily calorie needs based on activity level, or use the scientific calculator for any health formula." },
      { title: "Academic and Educational", desc: "Calculate GPA and CGPA on India's 10-point scale, convert marks to percentage, find exact age for exam eligibility, and use the scientific calculator for board exam problems." },
      { title: "Work and Everyday Math", desc: "Track work hours and overtime pay, split restaurant bills with tips, calculate percentages in seconds, and solve any scientific function from the browser." },
    ],
    workflows: [
      {
        title: "Plan a loan or investment decision",
        desc: "Start with the EMI calculator to understand monthly repayment obligations, then check compound interest to compare investment growth, and finally calculate ROI to evaluate if the return justifies the cost.",
        links: [
          { label: "Loan EMI Calculator", href: "/tools/loan-emi-calculator" },
          { label: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
          { label: "ROI Calculator", href: "/tools/roi-calculator" },
        ],
      },
      {
        title: "Check business viability",
        desc: "Calculate GST on your pricing, find your profit margin, then run a break-even analysis to see the minimum sales volume your business needs.",
        links: [
          { label: "GST Calculator", href: "/tools/gst-calculator" },
          { label: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
          { label: "Break-Even Calculator", href: "/tools/breakeven-calculator" },
        ],
      },
      {
        title: "Track academic progress",
        desc: "Calculate your semester GPA, convert your CGPA to percentage using the standard Indian formula, and use the scientific calculator for exam practice.",
        links: [
          { label: "GPA Calculator", href: "/tools/gpa-calculator" },
          { label: "Percentage Calculator", href: "/tools/percentage-calculator" },
          { label: "Scientific Calculator", href: "/tools/scientific-calculator" },
        ],
      },
    ],
    faqs: [
      { q: "Are calculator results a substitute for professional advice?", a: "No. These calculators are estimation and planning tools. For financial, tax, legal, or medical decisions, consult a qualified professional. The results here help you understand your numbers before that conversation." },
      { q: "Why does each calculator page have so much explanatory content?", a: "A number alone is rarely useful without context. The explanations help you understand what the result means, whether the inputs are correct, and what to do next. That is what separates a useful tool from a thin utility page." },
      { q: "What kinds of visitors benefit from this category?", a: "Students preparing for exams, borrowers comparing loan options, small business owners pricing products, freelancers verifying timesheets, and anyone checking a financial or health estimate before acting." },
    ],
  },
  developer: {
    h1: "Free Developer Tools – JSON Formatter, Base64, URL Encoder, Password Generator & More",
    intro: [
      "Developer tools on ToolMint are built for the small, immediate tasks that come up during development, testing, debugging, and support: formatting a JSON payload, encoding a URL parameter, decoding a Base64 string from an API response, generating a secure password for a new service, or testing a front-end snippet without spinning up a project. Each tool runs entirely in the browser — nothing is sent to any server.",
      "The tools here are useful not just for engineers but for QA analysts, support agents, SEO specialists, and students who need a quick technical utility without installing anything.",
    ],
    highlights: [
      { title: "JSON Workspace", desc: "Beautify, validate, minify, and convert JSON to XML, CSV, or YAML — with exact line-number error location on parse failure." },
      { title: "Encoding Utilities", desc: "Handle Base64 encoding/decoding for text and files, and URL percent-encoding with the correct method for query params vs full URLs." },
      { title: "Code Playgrounds", desc: "Live HTML/CSS/JS preview with sandboxed iframe isolation, and a full Python environment powered by Pyodide WebAssembly — no install needed." },
      { title: "Security Tools", desc: "Generate cryptographically secure passwords and passphrases using the Web Crypto API with entropy scoring in bits." },
    ],
    workflows: [
      {
        title: "Debug an API response",
        desc: "Paste the raw JSON to format and validate it. If the response contains Base64-encoded fields, decode them. If query parameters look wrong, use the URL parser to inspect them.",
        links: [
          { label: "JSON Formatter", href: "/tools/json-formatter" },
          { label: "Base64 Decoder", href: "/tools/base64-encoder-decoder" },
          { label: "URL Encoder/Decoder", href: "/tools/url-encoder-decoder" },
        ],
      },
      {
        title: "Set up a new project or account",
        desc: "Generate a strong password for the new service, then use the JSON formatter to clean up any config files you copy in.",
        links: [
          { label: "Password Generator", href: "/tools/password-generator" },
          { label: "JSON Formatter", href: "/tools/json-formatter" },
        ],
      },
      {
        title: "Learn or prototype without setup",
        desc: "Write and run Python directly in the browser for quick experiments, or use the HTML/CSS/JS playground to prototype a UI component without creating a project.",
        links: [
          { label: "Python Code Editor", href: "/tools/python-code-editor" },
          { label: "Code Snippet Playground", href: "/tools/code-snippet" },
        ],
      },
    ],
    faqs: [
      { q: "Why use browser-based developer tools instead of local scripts?", a: "For small immediate tasks — formatting one JSON response, decoding one Base64 string — opening a browser tab is faster than switching to a terminal, writing a script, and running it. These tools are optimized for that use case: paste input, get output, move on." },
      { q: "Are these tools safe to use with sensitive data?", a: "Yes. All processing runs in your browser. No JSON, Base64, URL, or password data is ever sent to any server. Your data stays on your device." },
      { q: "Who else besides developers uses these tools?", a: "QA testers debugging API responses, support engineers reading encoded tokens, SEO specialists parsing URLs, students learning to code, and anyone who needs a quick encoding or formatting task done without installing a tool." },
    ],
  },
  seo: {
    h1: "Free SEO Tools – Meta Tags, Sitemap Generator, Robots.txt & More",
    intro: [
      "The SEO tools collection covers the technical publishing tasks that every site owner faces when launching or maintaining a website: generating correct meta tags, creating an XML sitemap for Google, writing a robots.txt file, checking snippet lengths, and auditing keyword usage in content. Each tool produces a ready-to-use output — copy-paste HTML, a downloadable file, or a live preview — so you can complete the task and move on.",
      "These tools are especially useful for new sites and solo founders who need to get the SEO fundamentals right without a paid platform subscription.",
    ],
    highlights: [
      { title: "Metadata and Social Tags", desc: "Generate SEO title tags, meta descriptions, Open Graph tags, and Twitter Card tags in one place — with a live SERP and social preview." },
      { title: "Crawl and Discovery", desc: "Create an XML sitemap with auto-crawl and generate a robots.txt file with platform-specific rules to help Google discover and understand your site." },
      { title: "On-Page Content Audit", desc: "Check keyword density and n-gram frequency to catch over-optimization and ensure your primary topics appear naturally before publishing." },
      { title: "Zero-Cost Technical SEO", desc: "Handle the core technical SEO tasks — indexability, social sharing, meta tags — without a paid tool subscription." },
    ],
    workflows: [
      {
        title: "Set up a new website for search",
        desc: "Generate your sitemap and submit it to Google Search Console, create a robots.txt to block non-public paths, then write and check your homepage meta tags.",
        links: [
          { label: "Sitemap Generator", href: "/tools/sitemap-generator" },
          { label: "Robots.txt Generator", href: "/tools/robots-txt-generator" },
          { label: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
        ],
      },
      {
        title: "Optimize a page before publishing",
        desc: "Check that your title and description are the right length and contain your target keyword, verify the social share preview looks correct, then check keyword density in the body content.",
        links: [
          { label: "Meta Title & Description Checker", href: "/tools/meta-title-description-checker" },
          { label: "OG Tag Generator", href: "/tools/og-tag-generator" },
          { label: "Keyword Density Checker", href: "/tools/keyword-density" },
        ],
      },
    ],
    faqs: [
      { q: "Who are these SEO tools for?", a: "Bloggers, founders, content marketers, freelancers, and developers who need to handle the core technical SEO tasks for their own sites without subscribing to an enterprise platform like Ahrefs or Semrush." },
      { q: "Do these tools help a new site rank on Google?", a: "They handle the technical foundations — correct meta tags, a valid sitemap, a proper robots.txt — which are prerequisites for indexing. Ranking still depends on content quality, keyword targeting, and over time, backlinks. These tools remove the technical barriers so the content can do its job." },
      { q: "Are the generated files (sitemap.xml, robots.txt) ready to use?", a: "Yes. Both files are generated in the correct format and can be downloaded and uploaded to your site root immediately. After uploading sitemap.xml, submit it via Google Search Console → Sitemaps to trigger indexing." },
    ],
  },
  converters: {
    h1: "Free Online Unit Converters – Length, Weight, Temperature, File Size & Color",
    intro: [
      "Unit converters handle one of the most common micro-tasks in daily life: translating a number from one system to another. Whether you need km to miles for a road trip, Celsius to Fahrenheit for a recipe, kg to lbs for a fitness app, or HEX to RGB for a CSS file — each converter here gives you an instant answer with no ads, no signup, and no friction.",
      "Every converter includes an all-units comparison table so you can see your value in every supported unit at once, not just the pair you selected. This makes it easier to understand scale and choose the right unit for your purpose — especially useful when working across metric and imperial systems or between SI decimal and IEC binary file sizes.",
    ],
    highlights: [
      { title: "Length & Distance", desc: "Convert km to miles, meters to feet, cm to inches, and more across 12 units including nautical miles and light years." },
      { title: "Weight & Mass", desc: "Switch between kg, lbs, stone, grams, ounces, carats, and three types of tons — with full cross-unit comparison." },
      { title: "File Size (SI & IEC)", desc: "Understand the MB vs MiB difference and convert between 12 file size units in both decimal and binary standards." },
      { title: "Color Formats", desc: "Convert HEX, RGB, and HSL with a visual color picker and one-click CSS copy — built for designers and developers." },
    ],
    workflows: [
      {
        title: "Travel & Cooking",
        desc: "Convert measurements for road trips, recipes, and international travel.",
        links: [
          { label: "km to miles", href: "/tools/length-converter" },
          { label: "Celsius to Fahrenheit", href: "/tools/temperature-converter" },
          { label: "grams to ounces", href: "/tools/weight-converter" },
        ],
      },
      {
        title: "Design & Development",
        desc: "Convert color codes and file sizes for CSS, assets, and storage planning.",
        links: [
          { label: "HEX to RGB", href: "/tools/color-converter" },
          { label: "MB to GB", href: "/tools/file-size-converter" },
          { label: "random number", href: "/tools/random-number-generator" },
        ],
      },
    ],
    faqs: [
      { q: "What is the difference between MB and MiB?", a: "MB (megabyte) uses powers of 1,000 — 1 MB = 1,000,000 bytes — the SI standard used by hard drives and cloud storage. MiB (mebibyte) uses powers of 1,024 — 1 MiB = 1,048,576 bytes — the IEC binary standard used by RAM and operating systems. Windows reports file sizes in MiB but labels them MB, causing the common confusion where a 1 TB drive shows as ~931 GB." },
      { q: "How do I convert Celsius to Fahrenheit without a calculator?", a: "The exact formula is °F = (°C × 9/5) + 32. A quick mental approximation: double the Celsius value and add 30 (e.g., 20°C → 70°F — actual is 68°F). For exact results, use the temperature converter above." },
      { q: "What color format should I use in CSS — HEX, RGB, or HSL?", a: "All three work in modern CSS. HEX is most compact and what design tools export. RGB is easiest to manipulate programmatically. HSL is the most intuitive for building color palettes since you can adjust lightness without changing the hue. The color converter supports all three." },
    ],
  },
};
