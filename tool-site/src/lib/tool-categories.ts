export type ToolInfo = { name: string; slug: string; desc: string };

export type ToolCategory = {
  id: string;
  title: string;
  icon: string;
  path: string;
  description: string;
  tools: ToolInfo[];
};

export const toolCategories: ToolCategory[] = [
  {
    id: "pdf",
    title: "PDF Tools",
    icon: "📄",
    path: "/tools/pdf-tools",
    description:
      "Compress, merge, split, convert and edit PDF files online for free. All processing runs in your browser — no uploads, no signup.",
    tools: [
      { name: "PDF Compressor", slug: "pdf-compressor", desc: "Reduce PDF file size by up to 90%." },
      { name: "PDF Merger", slug: "pdf-merger", desc: "Combine multiple PDFs into one." },
      { name: "PDF Splitter", slug: "pdf-splitter", desc: "Split a PDF into separate files." },
      { name: "Rotate PDF", slug: "rotate-pdf", desc: "Rotate PDF pages 90°, 180° or 270°." },
      { name: "Edit PDF", slug: "edit-pdf", desc: "Add text, images and annotations." },
      { name: "Crop PDF", slug: "crop-pdf", desc: "Trim PDF page margins." },
      { name: "Add Page Numbers", slug: "add-page-numbers", desc: "Number your PDF pages." },
      { name: "Add Watermark", slug: "add-watermark", desc: "Stamp text or image watermarks." },
      { name: "Protect PDF", slug: "protect-pdf", desc: "Password-protect PDF files." },
      { name: "Unlock PDF", slug: "unlock-pdf", desc: "Remove PDF password protection." },
      { name: "Sign PDF", slug: "sign-pdf", desc: "Add signatures to PDF documents." },
      { name: "Redact PDF", slug: "redact-pdf", desc: "Black out sensitive PDF content." },
      { name: "Compare PDF", slug: "compare-pdf", desc: "Highlight differences between PDFs." },
      { name: "Image to PDF", slug: "image-to-pdf", desc: "Convert images to PDF." },
      { name: "Word to PDF", slug: "word-to-pdf", desc: "Convert Word documents to PDF." },
      { name: "PowerPoint to PDF", slug: "powerpoint-to-pdf", desc: "Convert PPTX slides to PDF." },
      { name: "Excel to PDF", slug: "excel-to-pdf", desc: "Convert Excel spreadsheets to PDF." },
      { name: "HTML to PDF", slug: "html-to-pdf", desc: "Convert web pages to PDF." },
      { name: "PDF to JPG", slug: "pdf-to-jpg", desc: "Convert PDF pages to images." },
      { name: "PDF to Word", slug: "pdf-to-word", desc: "Convert PDF to editable Word." },
      { name: "PDF to PowerPoint", slug: "pdf-to-powerpoint", desc: "Convert PDF to PPTX slides." },
      { name: "PDF to Excel", slug: "pdf-to-excel", desc: "Extract tables from PDF to Excel." },
      { name: "PDF to PDF/A", slug: "pdf-to-pdfa", desc: "Convert PDF to archival format." },
      { name: "PDF to Text", slug: "pdf-to-text", desc: "Extract text from PDF with OCR." },
    ],
  },
  {
    id: "image",
    title: "Image Tools",
    icon: "🖼️",
    path: "/tools/image-tools",
    description:
      "Compress, resize, crop, convert and edit images online for free. Supports JPG, PNG, WebP and more.",
    tools: [
      { name: "Image Compressor", slug: "image-compressor", desc: "Shrink images without quality loss." },
      { name: "Image Resizer", slug: "image-resizer", desc: "Resize images to exact dimensions." },
      { name: "Image Cropper", slug: "image-cropper", desc: "Crop images to any area." },
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
    icon: "📝",
    path: "/tools/text-tools",
    description:
      "Count words, compare text, change case and clean up text online for free.",
    tools: [
      { name: "Word Counter", slug: "word-counter", desc: "Count words, characters & reading time." },
      { name: "Text Case Converter", slug: "text-case-converter", desc: "Change text to upper, lower, title case." },
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
    icon: "🔢",
    path: "/tools/calculators",
    description:
      "Free online calculators for math, finance, health and everyday calculations.",
    tools: [
      { name: "Scientific Calculator", slug: "scientific-calculator", desc: "Advanced math and trig functions." },
      { name: "Percentage Calculator", slug: "percentage-calculator", desc: "Calculate percentages easily." },
      { name: "Age Calculator", slug: "age-calculator", desc: "Calculate exact age from birthdate." },
      { name: "BMI Calculator", slug: "bmi-calculator", desc: "Calculate body mass index." },
      { name: "Loan EMI Calculator", slug: "loan-emi-calculator", desc: "Monthly installments & interest." },
      { name: "Compound Interest Calculator", slug: "compound-interest-calculator", desc: "Calculate compound interest growth." },
      { name: "Profit Margin Calculator", slug: "profit-margin-calculator", desc: "Compute profit margins." },
      { name: "ROI Calculator", slug: "roi-calculator", desc: "Calculate return on investment." },
      { name: "GST Calculator", slug: "gst-calculator", desc: "Calculate GST and sales tax." },
      { name: "Break-even Calculator", slug: "breakeven-calculator", desc: "Find your break-even point." },
      { name: "GPA Calculator", slug: "gpa-calculator", desc: "Calculate grade point average." },
      { name: "Work Hours Calculator", slug: "work-hours-calculator", desc: "Track work hours and overtime." },
      { name: "Calorie Calculator", slug: "calorie-calculator", desc: "Estimate daily calorie needs." },
      { name: "Tip Calculator", slug: "tip-calculator", desc: "Calculate tips and split bills." },
    ],
  },
  {
    id: "developer",
    title: "Developer Tools",
    icon: "💻",
    path: "/tools/developer-tools",
    description:
      "Format code, encode data, generate passwords and build developer utilities online.",
    tools: [
      { name: "JSON Formatter", slug: "json-formatter", desc: "Beautify, validate & minify JSON." },
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
    icon: "📊",
    path: "/tools/seo-tools",
    description:
      "Generate meta tags, check SEO, create sitemaps and optimize for search engines.",
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
    icon: "🔄",
    path: "/tools/converters",
    description:
      "Convert units of length, weight, temperature, file size and more online for free.",
    tools: [
      { name: "Length Converter", slug: "length-converter", desc: "Convert length and distance units." },
      { name: "Weight Converter", slug: "weight-converter", desc: "Convert weight and mass units." },
      { name: "Temperature Converter", slug: "temperature-converter", desc: "Convert °C, °F and Kelvin." },
      { name: "File Size Converter", slug: "file-size-converter", desc: "Convert bytes, KB, MB, GB." },
      { name: "Color Converter", slug: "color-converter", desc: "Convert HEX, RGB, HSL colors." },
      { name: "Random Number Generator", slug: "random-number-generator", desc: "Generate random numbers." },
    ],
  },
  {
    id: "more",
    title: "More Tools",
    icon: "✨",
    path: "/tools/more-tools",
    description:
      "Stopwatch, date calculator, QR codes, name picker and fun games — all free & online.",
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

/** Look up the category a tool belongs to */
export function getCategoryForSlug(slug: string): ToolCategory | undefined {
  return toolCategories.find((cat) => cat.tools.some((t) => t.slug === slug));
}

/** Get related tools from the same category (excludes current tool) */
export function getRelatedTools(slug: string, limit = 5): ToolInfo[] {
  const category = getCategoryForSlug(slug);
  if (!category) return [];
  return category.tools.filter((t) => t.slug !== slug).slice(0, limit);
}
