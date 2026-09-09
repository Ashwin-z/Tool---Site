export type ToolInfo = { name: string; slug: string; desc: string };

export type ToolCategory = {
  id: string;
  title: string;
  icon: string;
  path?: string;
  description: string;
  tools: ToolInfo[];
};

export const toolCategories: ToolCategory[] = [
  {
    id: "pdf",
    title: "PDF Tools",
    icon: "\u{1F4C4}",
    path: "/tools/pdf-tools",
    description:
      "Use practical PDF tools for compressing files, merging pages, splitting documents, converting office formats, and securing paperwork. Built for everyday upload, editing, and sharing tasks.",
    tools: [
      { name: "Compress PDF", slug: "compress-pdf", desc: "Reduce PDF file size for email attachments, portal uploads, and faster sharing." },
      { name: "Merge PDF", slug: "merge-pdf", desc: "Combine multiple PDF files into one organized document in the right order." },
      { name: "Split PDF", slug: "split-pdf", desc: "Split a PDF by page range, custom sections, or individual pages." },
      { name: "Rotate PDF", slug: "rotate-pdf", desc: "Fix sideways or upside-down PDF pages without hurting quality." },
      { name: "Edit PDF", slug: "edit-pdf", desc: "Add text, drawings, highlights, shapes, and image stamps to a PDF." },
      { name: "Crop PDF", slug: "crop-pdf", desc: "Trim PDF margins and adjust the visible page area for cleaner pages." },
      { name: "Add Page Numbers", slug: "add-page-numbers-to-pdf", desc: "Insert page numbers into reports, handbooks, and print-ready PDFs." },
      { name: "Add Watermark", slug: "add-watermark-to-pdf", desc: "Add text or image watermarks to branded, draft, or confidential PDFs." },
      { name: "Protect PDF", slug: "protect-pdf", desc: "Password protect a PDF and control who can open or print it." },
      { name: "Unlock PDF", slug: "unlock-pdf", desc: "Remove a PDF password when you know the correct password or own the file." },
      { name: "Sign PDF", slug: "sign-pdf", desc: "Add signatures, initials, dates, and stamps to PDF documents." },
      { name: "Redact PDF", slug: "redact-pdf", desc: "Permanently black out sensitive text, names, numbers, and page areas." },
      { name: "PDF Redaction Checker", slug: "pdf-redaction-checker", desc: "Check whether a PDF's redactions removed the text, or only covered it up." },
      { name: "Compare PDF", slug: "compare-pdf", desc: "Compare two PDFs for text edits and visual page differences." },
      { name: "Image to PDF", slug: "image-to-pdf", desc: "Convert JPG, PNG, and scanned images into a single PDF file." },
      { name: "HTML to PDF", slug: "html-to-pdf", desc: "Save web pages and HTML content as PDF documents." },
      { name: "PDF to JPG", slug: "pdf-to-jpg", desc: "Convert PDF pages into JPG images for sharing, previewing, or reuse." },
      { name: "PDF to Word", slug: "pdf-to-word", desc: "Turn a PDF into an editable Word document for rewriting or reuse." },
      { name: "PDF to PowerPoint", slug: "pdf-to-powerpoint", desc: "Convert PDF pages into PowerPoint slides for presentation workflows." },
      { name: "PDF to Excel", slug: "pdf-to-excel", desc: "Extract PDF tables into editable Excel spreadsheets and worksheets." },
      { name: "PDF to Text", slug: "pdf-to-text", desc: "Extract text from digital or scanned PDF pages with OCR support." },
    ],
  },
  {
    id: "image",
    title: "Image Tools",
    icon: "\u{1F5BC}\u{FE0F}",
    path: "/tools/image-tools",
    description:
      "Compress, resize, crop, convert, and edit images online for free. Supports JPG, PNG, WebP, and more without forcing account creation.",
    tools: [
      { name: "Image Compressor", slug: "image-compressor", desc: "Reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss." },
      { name: "Image Resizer", slug: "image-resizer", desc: "Resize images to any exact pixel dimension or percentage without distortion." },
      { name: "Image Cropper", slug: "image-cropper", desc: "Crop any image to a precise area, aspect ratio, or custom pixel size." },
      { name: "JPG to PDF", slug: "image-to-pdf", desc: "Combine one or more JPG or PNG images into a single PDF document." },
      { name: "PNG to JPG", slug: "png-to-jpg", desc: "Convert PNG files to JPG to reduce file size for web and email use." },
      { name: "JPG to PNG", slug: "jpg-to-png", desc: "Convert JPG to PNG for transparency support and lossless quality." },
      { name: "Image Converter", slug: "image-converter", desc: "Convert between JPG, PNG, WebP, and other formats instantly." },
      { name: "Image Rotate/Flip", slug: "image-rotate-flip", desc: "Rotate images 90 or 180 degrees and flip horizontally or vertically." },
      { name: "Image to Text (OCR)", slug: "image-to-text", desc: "Extract typed or printed text from any image using OCR technology." },
    ],
  },
  {
    id: "text",
    title: "Text Tools",
    icon: "\u{1F4DD}",
    path: "/tools/text-tools",
    description:
      "Count words, compare drafts, change case, and clean up text online for free. Built for quick writing and editing tasks.",
    tools: [
      { name: "Word Counter", slug: "word-counter", desc: "Count words, characters, sentences, and reading time in real time." },
      { name: "Text Case Converter", slug: "text-case-converter", desc: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more." },
      { name: "Text Compare", slug: "text-compare", desc: "Find differences between two texts with side-by-side color-coded highlighting." },
      { name: "Text Reverser", slug: "text-reverser", desc: "Reverse entire text, flip word order, or reverse characters in each word." },
      { name: "Whitespace Remover", slug: "whitespace-remover", desc: "Strip extra spaces, blank lines, and tabs from text in one click." },
      { name: "Number to Words", slug: "number-to-words", desc: "Convert numbers to English words with Western, Indian, ordinal, and currency formats." },
      { name: "Grammar Checker", slug: "grammar-checker", desc: "Check spelling, capitalization, and grammar errors with fast browser-based proofreading." },
    ],
  },
  {
    id: "calculators",
    title: "Calculators",
    icon: "\u{1F522}",
    path: "/tools/calculators",
    description:
      "Free online calculators for math, finance, health, education, and everyday decisions.",
    tools: [
      { name: "Scientific Calculator", slug: "scientific-calculator", desc: "Full scientific calculator with sin, cos, tan, log, ln, square roots, and exponents — works in degrees and radians." },
      { name: "Percentage Calculator", slug: "percentage-calculator", desc: "Find X% of Y, calculate percentage increase or decrease, and convert marks to percentage." },
      { name: "Age Calculator", slug: "age-calculator", desc: "Calculate exact age in years, months, and days from any date of birth — useful for exam eligibility and government schemes." },
      { name: "BMI Calculator", slug: "bmi-calculator", desc: "Calculate Body Mass Index and see your healthy weight range based on height and weight." },
      { name: "Loan EMI Calculator", slug: "loan-emi-calculator", desc: "Calculate monthly EMI, total interest, and full amortization schedule for any home, car, or personal loan." },
      { name: "Compound Interest Calculator", slug: "compound-interest-calculator", desc: "See how money grows with compound interest over time — compare FD, PPF, and investment returns." },
      { name: "Profit Margin Calculator", slug: "profit-margin-calculator", desc: "Calculate gross margin, net margin, and selling price from cost — with markup vs margin explained." },
      { name: "ROI Calculator", slug: "roi-calculator", desc: "Calculate return on investment percentage, net profit, annualized return, and payback period." },
      { name: "GST Calculator", slug: "gst-calculator", desc: "Add GST to a price or remove GST from an inclusive amount. Covers all Indian GST slabs (5%, 12%, 18%, 28%)." },
      { name: "Break-even Calculator", slug: "breakeven-calculator", desc: "Find how many units to sell or how much revenue to generate to cover all costs and break even." },
      { name: "GPA Calculator", slug: "gpa-calculator", desc: "Calculate semester GPA, cumulative CGPA, and convert CGPA to percentage on India's 10-point scale." },
      { name: "Work Hours Calculator", slug: "work-hours-calculator", desc: "Calculate total work hours across shifts, deduct break times, compute overtime, and estimate total pay." },
      { name: "Calorie Calculator", slug: "calorie-calculator", desc: "Find your daily calorie needs (BMR and TDEE) based on age, weight, height, and activity level for weight loss or gain." },
      { name: "Tip Calculator", slug: "tip-calculator", desc: "Calculate tip amount and split the total bill equally between any number of people." },
      { name: "Palworld Breeding Calculator", slug: "palworld-breeding-calculator", desc: "Select any two parent Pals to instantly find the child Pal — covers all breeding combinations including rare and legendary Pals." },
    ],
  },
  {
    id: "developer",
    title: "Developer Tools",
    icon: "\u{1F4BB}",
    path: "/tools/developer-tools",
    description:
      "Format code, encode data, generate passwords, and solve small developer tasks from the browser.",
    tools: [
      { name: "JSON Formatter", slug: "json-formatter", desc: "Beautify, validate, minify, and convert JSON to XML, CSV, or YAML — with inline error location on parse failure." },
      { name: "Code Snippet Playground", slug: "code-snippet", desc: "Write HTML, CSS, and JavaScript in split editors with a sandboxed live preview that updates as you type." },
      { name: "Python Code Editor", slug: "python-code-editor", desc: "Run Python code directly in your browser using Pyodide (WebAssembly CPython) — no install, stdin simulation included." },
      { name: "Base64 Encoder/Decoder", slug: "base64-encoder-decoder", desc: "Encode text or files (images, PDFs, binary) to Base64 and decode Base64 strings back to plain text — UTF-8 safe." },
      { name: "URL Encoder/Decoder", slug: "url-encoder-decoder", desc: "Encode URLs with 4 percent-encoding methods, decode with 3 methods, and parse any URL into its components." },
      { name: "Password Generator", slug: "password-generator", desc: "Generate cryptographically secure passwords (up to 128 chars) or passphrases with entropy score using Web Crypto API." },
    ],
  },
  {
    id: "seo",
    title: "SEO Tools",
    icon: "\u{1F4CA}",
    path: "/tools/seo-tools",
    description:
      "Generate metadata, check snippets, create sitemaps, and handle small SEO publishing tasks online.",
    tools: [
      { name: "Meta Tag Generator", slug: "meta-tag-generator", desc: "Generate SEO title, meta description, Open Graph, and Twitter Card tags in one place — or import existing tags from any URL." },
      { name: "Meta Title & Description Checker", slug: "meta-title-description-checker", desc: "Check title and description character count, pixel width, and keyword presence with a live Google SERP snippet preview." },
      { name: "Sitemap Generator", slug: "sitemap-generator", desc: "Auto-crawl up to 1000 pages or paste URLs manually to generate a valid sitemap.xml for Google Search Console submission." },
      { name: "Robots.txt Generator", slug: "robots-txt-generator", desc: "Generate a robots.txt file with auto-detection for WordPress, Shopify, and OpenCart — blocks sensitive paths and adds sitemap reference." },
      { name: "Keyword Density Checker", slug: "keyword-density", desc: "Analyze keyword frequency and density % for single words, bigrams, and trigrams — detect over-optimization before publishing." },
      { name: "OG Tag Generator", slug: "og-tag-generator", desc: "Generate Open Graph and Twitter Card meta tags with a live social preview card for Facebook, LinkedIn, and Twitter." },
    ],
  },
  {
    id: "converters",
    title: "Converters",
    icon: "\u{1F504}",
    path: "/tools/converters",
    description:
      "Convert units of length, weight, temperature, file size, and colors online for free.",
    tools: [
      { name: "Length Converter", slug: "length-converter", desc: "Convert between 12 length units — km to miles, meters to feet, cm to inches — with an all-units comparison table." },
      { name: "Weight Converter", slug: "weight-converter", desc: "Convert between 11 weight units — kg to lbs, stone to kg, grams to ounces, and carats — with instant results." },
      { name: "Temperature Converter", slug: "temperature-converter", desc: "Convert between 8 temperature scales including Celsius, Fahrenheit, Kelvin, and Rankine with a reference points table." },
      { name: "File Size Converter", slug: "file-size-converter", desc: "Convert between 12 file size units including SI decimal (KB/MB/GB) and IEC binary (KiB/MiB/GiB) side by side." },
      { name: "Color Converter", slug: "color-converter", desc: "Convert between HEX, RGB, and HSL color formats with a visual 2D color picker and one-click CSS copy." },
      { name: "Random Number Generator", slug: "random-number-generator", desc: "Generate cryptographically secure random numbers, roll dice, flip coins, or pick items from a custom list." },
    ],
  },
  {
    id: "more",
    title: "More Tools",
    icon: "\u{2728}",
    description:
      "Extra utility pages for timers, QR codes, file helpers, and small daily tasks.",
    tools: [
      { name: "Stopwatch", slug: "stopwatch", desc: "Online stopwatch and countdown timer with lap splits and centisecond precision — runs entirely in your browser." },
      { name: "Date Difference", slug: "date-difference", desc: "Calculate the exact number of days, hours, minutes, and weeks between any two dates." },
      { name: "Random Name Picker", slug: "random-name-picker", desc: "Randomly pick one or more names from a list for raffles, giveaways, classrooms, and team selection." },
      { name: "WiFi Speed Checker", slug: "wifi-speed-checker", desc: "Test download speed, upload speed, ping, and jitter from your browser using Cloudflare endpoints." },
      { name: "YouTube Thumbnail Downloader", slug: "youtube-thumbnail-downloader", desc: "Download YouTube thumbnails in all available sizes — HD, HQ, and more — by pasting any video URL." },
      { name: "QR Code Scanner", slug: "qr-code-scanner", desc: "Scan QR codes using your camera or by uploading an image — private, browser-based, no server upload." },
      { name: "QR Code Generator", slug: "qr-code-generator", desc: "Generate QR codes from text or URLs with custom colors and download as PNG or SVG. No signup." },
      { name: "Tic Tac Toe", slug: "tic-tac-toe", desc: "Play Tic Tac Toe online against an unbeatable minimax AI or challenge a friend in 2-player mode." },
      { name: "Rock Paper Scissors", slug: "rock-paper-scissors", desc: "Play Rock Paper Scissors against the computer with score tracking and game history." },
    ],
  },
];

export function getCategoryForSlug(slug: string): ToolCategory | undefined {
  return toolCategories.find((category) => category.tools.some((tool) => tool.slug === slug));
}

export function getToolBySlug(slug: string): ToolInfo | undefined {
  for (const category of toolCategories) {
    const tool = category.tools.find((t) => t.slug === slug);
    if (tool) return tool;
  }
  return undefined;
}

/** Custom related tools map — 4 curated links per tool for optimal internal linking */
export const toolRelatedMap: Record<string, string[]> = {
  "compress-pdf": ["merge-pdf", "split-pdf", "pdf-to-jpg", "edit-pdf"],
  "merge-pdf": ["compress-pdf", "split-pdf", "image-to-pdf", "pdf-to-word"],
  "split-pdf": ["merge-pdf", "compress-pdf", "pdf-to-text", "rotate-pdf"],
  "image-to-pdf": ["merge-pdf", "compress-pdf", "pdf-to-jpg"],
  "html-to-pdf": ["image-to-pdf", "compress-pdf", "pdf-to-text"],
  "pdf-to-jpg": ["pdf-to-word", "pdf-to-text", "image-to-pdf", "compress-pdf"],
  "pdf-to-word": ["pdf-to-excel", "pdf-to-powerpoint", "pdf-to-text"],
  "pdf-to-powerpoint": ["pdf-to-word", "pdf-to-excel", "compress-pdf"],
  "pdf-to-excel": ["pdf-to-word", "pdf-to-text", "compress-pdf"],
  "pdf-to-text": ["pdf-to-word", "pdf-to-excel", "pdf-redaction-checker", "split-pdf"],
  "rotate-pdf": ["crop-pdf", "add-page-numbers-to-pdf", "edit-pdf", "compress-pdf"],
  "add-page-numbers-to-pdf": ["rotate-pdf", "add-watermark-to-pdf", "edit-pdf", "protect-pdf"],
  "add-watermark-to-pdf": ["protect-pdf", "redact-pdf", "add-page-numbers-to-pdf", "edit-pdf"],
  "crop-pdf": ["rotate-pdf", "edit-pdf", "compress-pdf", "pdf-to-jpg"],
  "edit-pdf": ["compress-pdf", "add-watermark-to-pdf", "sign-pdf", "protect-pdf"],
  "protect-pdf": ["unlock-pdf", "redact-pdf", "pdf-redaction-checker", "sign-pdf"],
  "unlock-pdf": ["protect-pdf", "edit-pdf", "compress-pdf", "pdf-to-word"],
  "sign-pdf": ["protect-pdf", "redact-pdf", "edit-pdf", "add-watermark-to-pdf"],
  "redact-pdf": ["pdf-redaction-checker", "protect-pdf", "sign-pdf", "pdf-to-text"],
  "pdf-redaction-checker": ["redact-pdf", "protect-pdf", "pdf-to-text", "unlock-pdf"],
  "compare-pdf": ["edit-pdf", "pdf-to-word", "redact-pdf", "pdf-redaction-checker"],
  "image-compressor": ["image-resizer", "image-cropper", "png-to-jpg", "image-converter"],
  "image-resizer": ["image-compressor", "image-cropper", "image-rotate-flip", "image-converter"],
  "image-cropper": ["image-resizer", "image-compressor", "image-rotate-flip", "png-to-jpg"],
  "png-to-jpg": ["jpg-to-png", "image-compressor", "image-converter", "image-to-pdf"],
  "jpg-to-png": ["png-to-jpg", "image-compressor", "image-converter", "image-cropper"],
  "image-converter": ["image-compressor", "png-to-jpg", "jpg-to-png", "image-resizer"],
  "image-rotate-flip": ["image-cropper", "image-resizer", "image-compressor", "image-converter"],
  "image-to-text": ["pdf-to-text", "image-compressor", "image-resizer", "image-to-pdf"],
  "word-counter": ["text-case-converter", "grammar-checker", "whitespace-remover", "text-compare"],
  "text-case-converter": ["word-counter", "whitespace-remover", "grammar-checker", "text-reverser"],
  "text-compare": ["word-counter", "whitespace-remover", "grammar-checker", "text-case-converter"],
  "text-reverser": ["word-counter", "text-case-converter", "whitespace-remover", "number-to-words"],
  "whitespace-remover": ["word-counter", "text-case-converter", "text-compare", "grammar-checker"],
  "number-to-words": ["word-counter", "text-case-converter", "text-reverser", "whitespace-remover"],
  "grammar-checker": ["word-counter", "text-case-converter", "whitespace-remover", "text-compare"],
  "scientific-calculator": ["percentage-calculator", "bmi-calculator", "age-calculator", "gpa-calculator"],
  "percentage-calculator": ["gpa-calculator", "bmi-calculator", "scientific-calculator", "age-calculator"],
  "age-calculator": ["bmi-calculator", "calorie-calculator", "percentage-calculator", "gpa-calculator"],
  "bmi-calculator": ["calorie-calculator", "age-calculator", "percentage-calculator", "work-hours-calculator"],
  "loan-emi-calculator": ["compound-interest-calculator", "roi-calculator", "breakeven-calculator", "profit-margin-calculator"],
  "compound-interest-calculator": ["loan-emi-calculator", "roi-calculator", "profit-margin-calculator", "breakeven-calculator"],
  "profit-margin-calculator": ["roi-calculator", "breakeven-calculator", "compound-interest-calculator", "gst-calculator"],
  "roi-calculator": ["profit-margin-calculator", "breakeven-calculator", "compound-interest-calculator", "loan-emi-calculator"],
  "gst-calculator": ["profit-margin-calculator", "breakeven-calculator", "percentage-calculator", "roi-calculator"],
  "breakeven-calculator": ["profit-margin-calculator", "roi-calculator", "gst-calculator", "compound-interest-calculator"],
  "gpa-calculator": ["percentage-calculator", "scientific-calculator", "age-calculator", "calorie-calculator"],
  "work-hours-calculator": ["tip-calculator", "profit-margin-calculator", "roi-calculator", "breakeven-calculator"],
  "calorie-calculator": ["bmi-calculator", "age-calculator", "work-hours-calculator", "tip-calculator"],
  "tip-calculator": ["percentage-calculator", "work-hours-calculator", "calorie-calculator", "gst-calculator"],
  "palworld-breeding-calculator": ["scientific-calculator", "percentage-calculator", "gpa-calculator", "age-calculator"],
  "meta-tag-generator": ["meta-title-description-checker", "og-tag-generator", "sitemap-generator", "robots-txt-generator"],
  "meta-title-description-checker": ["meta-tag-generator", "og-tag-generator", "keyword-density", "sitemap-generator"],
  "sitemap-generator": ["robots-txt-generator", "meta-tag-generator", "meta-title-description-checker", "og-tag-generator"],
  "robots-txt-generator": ["sitemap-generator", "meta-tag-generator", "meta-title-description-checker", "keyword-density"],
  "keyword-density": ["meta-title-description-checker", "meta-tag-generator", "og-tag-generator", "robots-txt-generator"],
  "og-tag-generator": ["meta-tag-generator", "meta-title-description-checker", "sitemap-generator", "keyword-density"],
  "json-formatter": ["base64-encoder-decoder", "url-encoder-decoder", "code-snippet", "password-generator"],
  "base64-encoder-decoder": ["json-formatter", "url-encoder-decoder", "password-generator", "code-snippet"],
  "url-encoder-decoder": ["json-formatter", "base64-encoder-decoder", "password-generator", "code-snippet"],
  "password-generator": ["json-formatter", "base64-encoder-decoder", "url-encoder-decoder", "code-snippet"],
  "code-snippet": ["python-code-editor", "json-formatter", "base64-encoder-decoder", "url-encoder-decoder"],
  "python-code-editor": ["code-snippet", "json-formatter", "base64-encoder-decoder", "url-encoder-decoder"],
  "length-converter": ["weight-converter", "temperature-converter", "file-size-converter", "color-converter"],
  "weight-converter": ["length-converter", "temperature-converter", "bmi-calculator", "calorie-calculator"],
  "temperature-converter": ["length-converter", "weight-converter", "file-size-converter", "scientific-calculator"],
  "file-size-converter": ["length-converter", "weight-converter", "color-converter", "random-number-generator"],
  "color-converter": ["file-size-converter", "length-converter", "meta-tag-generator", "og-tag-generator"],
  "random-number-generator": ["file-size-converter", "length-converter", "password-generator", "percentage-calculator"],
  "stopwatch": ["date-difference", "random-name-picker", "random-number-generator", "age-calculator"],
  "date-difference": ["stopwatch", "age-calculator", "work-hours-calculator", "loan-emi-calculator"],
  "random-name-picker": ["random-number-generator", "stopwatch", "date-difference", "password-generator"],
  "wifi-speed-checker": ["qr-code-generator", "qr-code-scanner", "youtube-thumbnail-downloader", "stopwatch"],
  "youtube-thumbnail-downloader": ["qr-code-generator", "wifi-speed-checker", "image-compressor", "image-resizer"],
  "qr-code-scanner": ["qr-code-generator", "wifi-speed-checker", "youtube-thumbnail-downloader", "url-encoder-decoder"],
  "qr-code-generator": ["qr-code-scanner", "color-converter", "image-compressor", "wifi-speed-checker"],
  "tic-tac-toe": ["rock-paper-scissors", "random-number-generator", "random-name-picker", "stopwatch"],
  "rock-paper-scissors": ["tic-tac-toe", "random-number-generator", "random-name-picker", "stopwatch"],
};

export function getRelatedTools(slug: string, limit = 5): ToolInfo[] {
  const customRelated = toolRelatedMap[slug];
  if (customRelated) {
    return customRelated
      .map((s) => getToolBySlug(s))
      .filter((t): t is ToolInfo => t !== undefined)
      .slice(0, limit);
  }
  const category = getCategoryForSlug(slug);
  if (!category) return [];
  return category.tools.filter((tool) => tool.slug !== slug).slice(0, limit);
}
