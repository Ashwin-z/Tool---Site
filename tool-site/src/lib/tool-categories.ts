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
      { name: "PDF Compressor", slug: "pdf-compressor", desc: "Reduce PDF file size for email attachments, portal uploads, and faster sharing." },
      { name: "PDF Merger", slug: "pdf-merger", desc: "Combine multiple PDF files into one organized document in the right order." },
      { name: "PDF Splitter", slug: "pdf-splitter", desc: "Split a PDF by page range, custom sections, or individual pages." },
      { name: "Rotate PDF", slug: "rotate-pdf", desc: "Fix sideways or upside-down PDF pages without hurting quality." },
      { name: "Edit PDF", slug: "edit-pdf", desc: "Add text, drawings, highlights, shapes, and image stamps to a PDF." },
      { name: "Crop PDF", slug: "crop-pdf", desc: "Trim PDF margins and adjust the visible page area for cleaner pages." },
      { name: "Add Page Numbers", slug: "add-page-numbers", desc: "Insert page numbers into reports, handbooks, and print-ready PDFs." },
      { name: "Add Watermark", slug: "add-watermark", desc: "Add text or image watermarks to branded, draft, or confidential PDFs." },
      { name: "Protect PDF", slug: "protect-pdf", desc: "Password protect a PDF and control who can open or print it." },
      { name: "Unlock PDF", slug: "unlock-pdf", desc: "Remove a PDF password when you know the correct password or own the file." },
      { name: "Sign PDF", slug: "sign-pdf", desc: "Add signatures, initials, dates, and stamps to PDF documents." },
      { name: "Redact PDF", slug: "redact-pdf", desc: "Permanently black out sensitive text, names, numbers, and page areas." },
      { name: "Compare PDF", slug: "compare-pdf", desc: "Compare two PDFs for text edits and visual page differences." },
      { name: "Image to PDF", slug: "image-to-pdf", desc: "Convert JPG, PNG, and scanned images into a single PDF file." },
      { name: "Word to PDF", slug: "word-to-pdf", desc: "Convert DOCX documents into clean, shareable PDF files." },
      { name: "PowerPoint to PDF", slug: "powerpoint-to-pdf", desc: "Turn PPTX slide decks into PDF handouts and shareable documents." },
      { name: "Excel to PDF", slug: "excel-to-pdf", desc: "Convert Excel sheets, tables, and CSV files into polished PDFs." },
      { name: "HTML to PDF", slug: "html-to-pdf", desc: "Save web pages and HTML content as PDF documents." },
      { name: "PDF to JPG", slug: "pdf-to-jpg", desc: "Convert PDF pages into JPG images for sharing, previewing, or reuse." },
      { name: "PDF to Word", slug: "pdf-to-word", desc: "Turn a PDF into an editable Word document for rewriting or reuse." },
      { name: "PDF to PowerPoint", slug: "pdf-to-powerpoint", desc: "Convert PDF pages into PowerPoint slides for presentation workflows." },
      { name: "PDF to Excel", slug: "pdf-to-excel", desc: "Extract PDF tables into editable Excel spreadsheets and worksheets." },
      { name: "PDF to PDF/A", slug: "pdf-to-pdfa", desc: "Convert PDF files into PDF/A for compliant long-term archiving." },
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
      { name: "Image Compressor", slug: "image-compressor", desc: "Shrink images without quality loss." },
      { name: "Image Resizer", slug: "image-resizer", desc: "Resize images to exact dimensions." },
      { name: "Image Cropper", slug: "image-cropper", desc: "Crop images to any area." },
      { name: "JPG to PDF", slug: "image-to-pdf", desc: "Convert JPG images into PDF files." },
      { name: "PNG to JPG", slug: "png-to-jpg", desc: "Convert PNG to JPG format." },
      { name: "JPG to PNG", slug: "jpg-to-png", desc: "Convert JPG to lossless PNG." },
      { name: "Image Converter", slug: "image-converter", desc: "Convert between image formats." },
      { name: "Image Rotate/Flip", slug: "image-rotate-flip", desc: "Rotate or flip images." },
      { name: "Image to Text (OCR)", slug: "image-to-text", desc: "Extract text from images." },
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
      { name: "Word Counter", slug: "word-counter", desc: "Count words, characters, and reading time." },
      { name: "Text Case Converter", slug: "text-case-converter", desc: "Change text to upper, lower, or title case." },
      { name: "Text Compare", slug: "text-compare", desc: "Find differences between two texts." },
      { name: "Text Reverser", slug: "text-reverser", desc: "Reverse text or characters." },
      { name: "Whitespace Remover", slug: "whitespace-remover", desc: "Strip extra spaces and blank lines." },
      { name: "Number to Words", slug: "number-to-words", desc: "Convert numbers to written words." },
      { name: "Grammar Checker", slug: "grammar-checker", desc: "Check spelling and grammar." },
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
      { name: "Scientific Calculator", slug: "scientific-calculator", desc: "Advanced math and trig functions." },
      { name: "Percentage Calculator", slug: "percentage-calculator", desc: "Calculate percentages easily." },
      { name: "Age Calculator", slug: "age-calculator", desc: "Calculate exact age from birthdate." },
      { name: "BMI Calculator", slug: "bmi-calculator", desc: "Calculate body mass index." },
      { name: "Loan EMI Calculator", slug: "loan-emi-calculator", desc: "Monthly installments and interest." },
      { name: "Compound Interest Calculator", slug: "compound-interest-calculator", desc: "Calculate compound interest growth." },
      { name: "Profit Margin Calculator", slug: "profit-margin-calculator", desc: "Compute profit margins." },
      { name: "ROI Calculator", slug: "roi-calculator", desc: "Calculate return on investment." },
      { name: "GST Calculator", slug: "gst-calculator", desc: "Calculate GST and sales tax." },
      { name: "Break-even Calculator", slug: "breakeven-calculator", desc: "Find your break-even point." },
      { name: "GPA Calculator", slug: "gpa-calculator", desc: "Calculate grade point average." },
      { name: "Work Hours Calculator", slug: "work-hours-calculator", desc: "Track work hours and overtime." },
      { name: "Calorie Calculator", slug: "calorie-calculator", desc: "Estimate daily calorie needs." },
      { name: "Tip Calculator", slug: "tip-calculator", desc: "Calculate tips and split bills." },
      { name: "Palworld Breeding Calculator", slug: "palworld-breeding-calculator", desc: "Find Pal breeding outcomes and parent combinations." },
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
      { name: "JSON Formatter", slug: "json-formatter", desc: "Beautify, validate, and minify JSON." },
      { name: "Code Snippet Playground", slug: "code-snippet", desc: "Write and share code snippets." },
      { name: "Python Code Editor", slug: "python-code-editor", desc: "Run Python code in browser." },
      { name: "Base64 Encoder/Decoder", slug: "base64-encoder-decoder", desc: "Encode or decode Base64." },
      { name: "URL Encoder/Decoder", slug: "url-encoder-decoder", desc: "Encode or decode URLs." },
      { name: "Password Generator", slug: "password-generator", desc: "Generate strong random passwords." },
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
      { name: "Meta Tag Generator", slug: "meta-tag-generator", desc: "Generate HTML meta tags." },
      { name: "Meta Title & Description Checker", slug: "meta-title-description-checker", desc: "Preview search result snippets." },
      { name: "Sitemap Generator", slug: "sitemap-generator", desc: "Create XML sitemaps." },
      { name: "Robots.txt Generator", slug: "robots-txt-generator", desc: "Generate robots.txt files." },
      { name: "Keyword Density", slug: "keyword-density", desc: "Analyze keyword frequency." },
      { name: "OG Tag Generator", slug: "og-tag-generator", desc: "Generate Open Graph tags." },
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
      { name: "Length Converter", slug: "length-converter", desc: "Convert length and distance units." },
      { name: "Weight Converter", slug: "weight-converter", desc: "Convert weight and mass units." },
      { name: "Temperature Converter", slug: "temperature-converter", desc: "Convert C, F, and Kelvin." },
      { name: "File Size Converter", slug: "file-size-converter", desc: "Convert bytes, KB, MB, and GB." },
      { name: "Color Converter", slug: "color-converter", desc: "Convert HEX, RGB, and HSL colors." },
      { name: "Random Number Generator", slug: "random-number-generator", desc: "Generate random numbers." },
    ],
  },
  {
    id: "more",
    title: "More Tools",
    icon: "\u{2728}",
    description:
      "Extra utility pages for timers, QR codes, file helpers, and small daily tasks.",
    tools: [
      { name: "Stopwatch", slug: "stopwatch", desc: "Online stopwatch and timer." },
      { name: "Date Difference", slug: "date-difference", desc: "Calculate days between dates." },
      { name: "Random Name Picker", slug: "random-name-picker", desc: "Pick random names from a list." },
      { name: "WiFi Speed Checker", slug: "wifi-speed-checker", desc: "Test your internet speed." },
      { name: "YouTube Thumbnail Downloader", slug: "youtube-thumbnail-downloader", desc: "Download YouTube thumbnails." },
      { name: "QR Code Scanner", slug: "qr-code-scanner", desc: "Scan QR codes with your camera." },
      { name: "QR Code Generator", slug: "qr-code-generator", desc: "Create custom QR codes." },
      { name: "Tic Tac Toe", slug: "tic-tac-toe", desc: "Play tic-tac-toe online." },
      { name: "Rock Paper Scissors", slug: "rock-paper-scissors", desc: "Play RPS against the computer." },
    ],
  },
];

export function getCategoryForSlug(slug: string): ToolCategory | undefined {
  return toolCategories.find((category) => category.tools.some((tool) => tool.slug === slug));
}

export function getRelatedTools(slug: string, limit = 5): ToolInfo[] {
  const category = getCategoryForSlug(slug);
  if (!category) return [];
  return category.tools.filter((tool) => tool.slug !== slug).slice(0, limit);
}
