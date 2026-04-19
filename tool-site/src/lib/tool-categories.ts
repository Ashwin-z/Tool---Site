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
    icon: "ðŸ“„",
    path: "/tools/pdf-tools",
    description:
      "Compress, merge, split, convert, and edit PDF files online for free. Most tasks are designed to stay fast and straightforward, with no signup required.",
    tools: [
      { name: "PDF Compressor", slug: "pdf-compressor", desc: "Reduce PDF file size by up to 90%." },
      { name: "PDF Merger", slug: "pdf-merger", desc: "Combine multiple PDFs into one." },
      { name: "PDF Splitter", slug: "pdf-splitter", desc: "Split a PDF into separate files." },
      { name: "Rotate PDF", slug: "rotate-pdf", desc: "Rotate PDF pages 90Â°, 180Â° or 270Â°." },
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
    icon: "ðŸ–¼ï¸",
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
    icon: "ðŸ“",
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
    icon: "ðŸ”¢",
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
    ],
  },
  {
    id: "developer",
    title: "Developer Tools",
    icon: "ðŸ’»",
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
    icon: "ðŸ“Š",
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
    icon: "ðŸ”„",
    path: "/tools/converters",
    description:
      "Convert units of length, weight, temperature, file size, and colors online for free.",
    tools: [
      { name: "Length Converter", slug: "length-converter", desc: "Convert length and distance units." },
      { name: "Weight Converter", slug: "weight-converter", desc: "Convert weight and mass units." },
      { name: "Temperature Converter", slug: "temperature-converter", desc: "Convert Â°C, Â°F and Kelvin." },
      { name: "File Size Converter", slug: "file-size-converter", desc: "Convert bytes, KB, MB, and GB." },
      { name: "Color Converter", slug: "color-converter", desc: "Convert HEX, RGB, and HSL colors." },
      { name: "Random Number Generator", slug: "random-number-generator", desc: "Generate random numbers." },
    ],
  },
  {
    id: "more",
    title: "More Tools",
    icon: "âœ¨",
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
