const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const gs = path.join(process.cwd(), 'bin', 'ghostscript', 'gs', 'bin', 'gswin64c.exe');
const input = 'C:/Users/Ashwin/Downloads/file-example_PDF_1MB.pdf';
const originalSize = fs.statSync(input).size;

const profiles = [
  {
    name: 'p1-no-downsample-q100',
    args: [
      '-dPDFSETTINGS=/default',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dDownsampleColorImages=false',
      '-dDownsampleGrayImages=false',
      '-dDownsampleMonoImages=false',
      '-dJPEGQ=100',
      '-dColorImageResolution=600',
      '-dGrayImageResolution=600',
      '-dMonoImageResolution=1200',
    ],
  },
  {
    name: 'p2-no-downsample-q99',
    args: [
      '-dPDFSETTINGS=/default',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dDownsampleColorImages=false',
      '-dDownsampleGrayImages=false',
      '-dDownsampleMonoImages=false',
      '-dJPEGQ=99',
      '-dColorImageResolution=600',
      '-dGrayImageResolution=600',
      '-dMonoImageResolution=1200',
    ],
  },
  {
    name: 'p3-prepress-450-q99',
    args: [
      '-dPDFSETTINGS=/prepress',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dDownsampleMonoImages=true',
      '-dJPEGQ=99',
      '-dColorImageResolution=450',
      '-dGrayImageResolution=450',
      '-dMonoImageResolution=900',
    ],
  },
  {
    name: 'p4-default-350-q98',
    args: [
      '-dPDFSETTINGS=/default',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dDownsampleMonoImages=true',
      '-dJPEGQ=98',
      '-dColorImageResolution=350',
      '-dGrayImageResolution=350',
      '-dMonoImageResolution=700',
    ],
  },
  {
    name: 'p5-printer-280-q96',
    args: [
      '-dPDFSETTINGS=/printer',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dDownsampleMonoImages=true',
      '-dJPEGQ=96',
      '-dColorImageResolution=280',
      '-dGrayImageResolution=280',
      '-dMonoImageResolution=560',
    ],
  },
  {
    name: 'p6-default-999-no-downsample-mono-true',
    args: [
      '-dPDFSETTINGS=/default',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dDownsampleColorImages=false',
      '-dDownsampleGrayImages=false',
      '-dDownsampleMonoImages=true',
      '-dJPEGQ=100',
      '-dColorImageResolution=999',
      '-dGrayImageResolution=999',
      '-dMonoImageResolution=1200',
    ],
  },
];

const baseArgs = [
  '-sDEVICE=pdfwrite',
  '-dCompatibilityLevel=1.4',
  '-dNOPAUSE',
  '-dBATCH',
  '-dQUIET',
  '-dSAFER',
  '-dDetectDuplicateImages=true',
  '-dCompressFonts=true',
  '-dSubsetFonts=true',
  '-dEmbedAllFonts=true',
  '-dAutoRotatePages=/None',
  '-dAutoFilterColorImages=false',
  '-dAutoFilterGrayImages=false',
  '-dColorImageDownsampleType=/Bicubic',
  '-dGrayImageDownsampleType=/Bicubic',
  '-dMonoImageDownsampleType=/Subsample',
];

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gs-less-bench-'));

const results = profiles.map((profile) => {
  const outputPath = path.join(tempDir, `${profile.name}.pdf`);
  const result = spawnSync(gs, [...baseArgs, ...profile.args, `-sOutputFile=${outputPath}`, input], {
    encoding: 'utf8',
  });

  const outputExists = fs.existsSync(outputPath);
  const compressedSize = outputExists ? fs.statSync(outputPath).size : 0;
  const savedPct = compressedSize > 0 && compressedSize < originalSize
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return {
    name: profile.name,
    exitCode: result.status,
    compressedSize,
    savedPct,
    stderr: (result.stderr || '').trim().slice(0, 200),
  };
});

console.log(JSON.stringify({ originalSize, results }, null, 2));
fs.rmSync(tempDir, { recursive: true, force: true });
