import React from 'react';
import { ChevronRight, Star, ArrowLeft, Shield, Lightbulb } from 'lucide-react';
import { ToolDefinition, PdfActionTab } from '../types';
import { CATEGORIES } from '../data/tools';
import { IconRenderer } from '../components/common/IconRenderer';

// Tool components
import { PdfStudio } from '../components/tools/PdfStudio';
import { JsonFormatter } from '../components/tools/JsonFormatter';
import { QrGenerator } from '../components/tools/QrGenerator';
import { ColorPaletteGenerator } from '../components/tools/ColorPaletteGenerator';
import { CssGradientGenerator } from '../components/tools/CssGradientGenerator';
import { CaseConverter } from '../components/tools/CaseConverter';
import { WordCounter } from '../components/tools/WordCounter';
import { Base64Codec } from '../components/tools/Base64Codec';
import { UrlCodec } from '../components/tools/UrlCodec';
import { UuidGenerator } from '../components/tools/UuidGenerator';
import { ImageCompressor } from '../components/tools/ImageCompressor';

interface ToolViewPageProps {
  tool: ToolDefinition;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
  initialPdfTab?: PdfActionTab;
}

const TOOL_DOCUMENTATION: Record<string, { summary: string; tips: string[] }> = {
  'pdf-studio': {
    summary: 'Full-featured client-side PDF suite executing ISO 32000-1 document compilation, page merging, image binding, and stream optimization.',
    tips: [
      'Text to PDF calculates page boundaries and wraps text margins automatically with A4 pagination.',
      'Images to PDF compiles multiple JPEG/PNG/WebP pictures into a unified multi-page presentation with customizable order.',
      'Merge PDFs loads source document byte arrays and stitches page trees together without uploading files to any server.',
      'Compress PDF restructures internal cross-reference tables and applies stream compression to binary page objects.',
    ],
  },
  'json-formatter': {
    summary: 'Standard JSON validator and beautifier following RFC 8259 syntax specifications.',
    tips: [
      'Line numbers and error column indications show exactly where a syntax parse failed.',
      'Auto-Fix resolves single-quote identifiers and stray trailing commas common in JavaScript object notation.',
      'Minification strips indentation whitespace, lowering network payload overhead before deployment.',
    ],
  },
  'qr-generator': {
    summary: 'ISO/IEC 18004 compliant QR matrix generator rendering directly onto HTML5 Canvas.',
    tips: [
      'Medium (M) error correction is ideal for digital screens; High (H) allows scanning even with up to 30% visual obstruction.',
      'Export vector SVG for crisp print scaling onto posters, conference badges, and product packaging.',
      'Wi-Fi payload adheres to the universal standard accepted automatically by iOS and Android camera apps.',
    ],
  },
  'color-palette': {
    summary: 'Harmonious color palette generator computing mathematical hue relationships and WCAG 2.1 contrast ratios.',
    tips: [
      'Press the Spacebar to instantly reroll unfrozen swatches.',
      'Lock individual swatches using the lock button to preserve favorite colors while exploring harmonies.',
      'Contrast badges confirm AA standards (4.5:1 ratio) ensuring accessible readability for text on backgrounds.',
    ],
  },
  'css-gradient': {
    summary: 'Production-ready CSS gradient builder supporting linear, radial, and conic color distributions.',
    tips: [
      'Linear gradients adjust angle in degrees; 90deg flows left-to-right, 180deg flows top-to-bottom.',
      'Conic gradients are perfect for circular color wheels, pie chart accents, and radar sweeps.',
      'Output includes a fallback solid background color for maximum browser backward-compatibility.',
    ],
  },
  'case-converter': {
    summary: 'String transformer for programming conventions, documentation formatting, and title typography.',
    tips: [
      'CamelCase and PascalCase automatically strip hyphen and underscore delimiters.',
      'Sentence case accurately capitalizes words following sentence-ending punctuation marks (. ! ?).',
      'Click the Copy button on any variant card to quickly use the specific formatted output in your code.',
    ],
  },
  'word-counter': {
    summary: 'Document analysis tool calculating lexical density, word counts, and estimated reading speeds.',
    tips: [
      'Reading time uses the standard 200 words-per-minute adult comprehension baseline.',
      'Speaking time models average presentation cadence (~130 WPM) for rehearsing lightning talks and keynote speeches.',
      'Keyword frequency excludes common English stop words (the, and, of) to emphasize actual semantic themes.',
    ],
  },
  'base64-codec': {
    summary: 'RFC 4648 Base64 codec supporting UTF-8 multi-byte encoding and local binary Data URLs.',
    tips: [
      'Safe UTF-8 encoding ensures accented characters and emoji glyphs encode without throwing btoa errors.',
      'Convert local PNG/JPEG icons into Data URIs to inline assets directly into HTML, SVG, or CSS stylesheets.',
      'Decode Base64 images directly into browser memory for instant visual verification.',
    ],
  },
  'url-codec': {
    summary: 'RFC 3986 percent-encoding tool with interactive query string breakdown and editor.',
    tips: [
      'Use encodeURIComponent to safely escape individual parameter keys and values containing symbols (&, =, ?).',
      'Use encodeURI if you wish to preserve the structure of a complete URL protocol and pathname.',
      'Edit the query parameter table directly to modify search queries without manually reconstructing string syntax.',
    ],
  },
  'uuid-generator': {
    summary: 'RFC 4122 Version 4 UUID generator backed by cryptographically strong pseudorandom numbers.',
    tips: [
      'Leverages native crypto.randomUUID() ensuring collision-resistant 128-bit identifiers.',
      'Toggle hyphens and braces to format GUIDs for Microsoft SQL Server, C#, or Java UUID parsers.',
      'Bulk export up to 100 identifiers simultaneously as plain text lines or a valid JSON string array.',
    ],
  },
  'image-compressor': {
    summary: 'Client-side image optimizer reducing file weight via HTML5 Canvas compression algorithms.',
    tips: [
      'Zero server uploads: your sensitive photos, diagrams, and mockups never leave your local machine.',
      'Converting to WebP typically saves 30-50% file size compared to JPEG at equivalent perceived quality.',
      'Use the max width constraint to resize high-megapixel smartphone photos into web-optimized dimensions.',
    ],
  },
};

export const ToolViewPage: React.FC<ToolViewPageProps> = ({
  tool,
  onBack,
  isFavorite,
  onToggleFavorite,
  notify,
  initialPdfTab,
}) => {
  const categoryObj = CATEGORIES.find((c) => c.id === tool.category);
  const doc = TOOL_DOCUMENTATION[tool.id] || {
    summary: tool.description,
    tips: ['Processes data strictly in local browser memory.'],
  };

  const renderToolComponent = () => {
    switch (tool.id) {
      case 'pdf-studio':
        return <PdfStudio initialTab={initialPdfTab} notify={notify} />;
      case 'json-formatter':
        return <JsonFormatter notify={notify} />;
      case 'qr-generator':
        return <QrGenerator notify={notify} />;
      case 'color-palette':
        return <ColorPaletteGenerator notify={notify} />;
      case 'css-gradient':
        return <CssGradientGenerator notify={notify} />;
      case 'case-converter':
        return <CaseConverter notify={notify} />;
      case 'word-counter':
        return <WordCounter notify={notify} />;
      case 'base64-codec':
        return <Base64Codec notify={notify} />;
      case 'url-codec':
        return <UrlCodec notify={notify} />;
      case 'uuid-generator':
        return <UuidGenerator notify={notify} />;
      case 'image-compressor':
        return <ImageCompressor notify={notify} />;
      default:
        return <div className="p-8 text-center text-neutral-400">Tool not found</div>;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation Header */}
      <div className="space-y-4 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-neutral-200 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tools</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span>{categoryObj?.label || tool.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-200 font-medium">{tool.shortName}</span>
        </div>

        {/* Title, Icon, and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-indigo-400 shrink-0">
              <IconRenderer name={tool.icon} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
                  {tool.name}
                </h1>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(tool.id)}
                  className={`p-1.5 rounded-md transition-colors ${
                    isFavorite
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                {tool.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client-Side</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Body */}
      <section className="min-h-[400px]">
        {renderToolComponent()}
      </section>

      {/* Quick Tips & Technical Background Card */}
      <section className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Usage Notes & Technical Specifications</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          {doc.summary}
        </p>

        <ul className="space-y-1.5 pt-1">
          {doc.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-400">
              <span className="text-indigo-400 font-mono text-[11px] mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
