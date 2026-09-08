import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Missing PDF path argument.");
  process.exit(1);
}

const documentRef = await pdfjs.getDocument(filePath).promise;
let total = 0;
const sample = [];

for (let pageNumber = 1; pageNumber <= documentRef.numPages; pageNumber += 1) {
  const page = await documentRef.getPage(pageNumber);
  const textContent = await page.getTextContent();
  for (const item of textContent.items) {
    if ("str" in item && item.str && item.str.trim()) {
      total += 1;
      if (sample.length < 80) {
        sample.push({ pageNumber, text: item.str });
      }
    }
  }
}

console.log(JSON.stringify({ pages: documentRef.numPages, total, sample }, null, 2));
