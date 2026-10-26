import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Trash2, ArrowUpDown, Sparkles } from 'lucide-react';

interface CaseConverterProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

const SAMPLE_TEXT = 'DevKit Studio delivers fast, private developer utilities designed for modern workflows.';

// Conversion algorithms
const toUpperCase = (s: string) => s.toUpperCase();
const toLowerCase = (s: string) => s.toLowerCase();

const toSentenceCase = (s: string) => {
  return s
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
};

const toTitleCase = (s: string) => {
  const minorWords = new Set(['and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'for', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via']);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, arr) => {
      if (word.length === 0) return '';
      if (index === 0 || index === arr.length - 1 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

const wordsFromStr = (s: string): string[] => {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

const toCamelCase = (s: string) => {
  const words = wordsFromStr(s);
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
};

const toPascalCase = (s: string) => {
  const words = wordsFromStr(s);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const toKebabCase = (s: string) => {
  return wordsFromStr(s).map((w) => w.toLowerCase()).join('-');
};

const toSnakeCase = (s: string) => {
  return wordsFromStr(s).map((w) => w.toLowerCase()).join('_');
};

const toConstantCase = (s: string) => {
  return wordsFromStr(s).map((w) => w.toUpperCase()).join('_');
};

const toDotCase = (s: string) => {
  return wordsFromStr(s).map((w) => w.toLowerCase()).join('.');
};

const toAlternatingCase = (s: string) => {
  let upper = false;
  return s
    .split('')
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        upper = !upper;
        return upper ? char.toUpperCase() : char.toLowerCase();
      }
      return char;
    })
    .join('');
};

export const CaseConverter: React.FC<CaseConverterProps> = ({ notify }) => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  const transformations = [
    { label: 'UPPERCASE', fn: toUpperCase, desc: 'ALL CAPITAL LETTERS' },
    { label: 'lowercase', fn: toLowerCase, desc: 'all small letters' },
    { label: 'Sentence case', fn: toSentenceCase, desc: 'Capitalize first letter of sentences' },
    { label: 'Title Case', fn: toTitleCase, desc: 'Capitalize Major Words In Heading' },
    { label: 'camelCase', fn: toCamelCase, desc: 'firstWordLowerThenCaps' },
    { label: 'PascalCase', fn: toPascalCase, desc: 'EveryWordCapitalized' },
    { label: 'kebab-case', fn: toKebabCase, desc: 'words-separated-by-hyphens' },
    { label: 'snake_case', fn: toSnakeCase, desc: 'words_separated_by_underscores' },
    { label: 'CONSTANT_CASE', fn: toConstantCase, desc: 'UPPERCASE_WITH_UNDERSCORES' },
    { label: 'dot.case', fn: toDotCase, desc: 'words.separated.by.periods' },
    { label: 'aLtErNaTiNg', fn: toAlternatingCase, desc: 'MoCkInG cAsE sTyLe' },
  ];

  const applyTransformation = (fn: (s: string) => string, label: string) => {
    setText(fn(text));
    notify(`Converted to ${label}`, 'success');
  };

  const handleClear = () => {
    setText('');
    notify('Cleared text editor', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Input / Editor Section */}
      <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-300">Input String</span>
            <div className="flex items-center gap-3 font-mono tabular-nums text-neutral-400">
              <span>{charCount} chars</span>
              <span>·</span>
              <span>{wordCount} words</span>
              <span>·</span>
              <span>{lineCount} lines</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setText(SAMPLE_TEXT);
                notify('Sample text loaded', 'info');
              }}
              className="text-xs text-neutral-400 hover:text-indigo-400 px-1 py-0.5"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
              title="Clear text"
              aria-label="Clear text input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <CopyButton
              textToCopy={text}
              label="Copy All"
              variant="secondary"
              onCopySuccess={() => notify('Text copied to clipboard', 'success')}
            />
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text to convert cases instantly..."
          rows={5}
          className="w-full p-3 bg-neutral-950 text-neutral-100 font-mono text-sm leading-relaxed focus:outline-none"
        />
      </div>

      {/* Quick Transform Button Toolbar */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-300">
          Instant In-Place Converters
        </div>
        <div className="flex flex-wrap gap-2">
          {transformations.slice(0, 8).map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTransformation(t.fn, t.label)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded text-xs font-medium transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-side All Variations Gallery */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-200">All Case Variants Breakdown</span>
          <span className="text-neutral-400">Click copy on any variation to use immediately</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {transformations.map((t) => {
            const converted = text ? t.fn(text) : '';
            return (
              <div
                key={t.label}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between gap-2 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 font-mono">
                      {t.label}
                    </span>
                    <span className="block text-[11px] text-neutral-400">{t.desc}</span>
                  </div>
                  <CopyButton
                    textToCopy={converted}
                    label="Copy"
                    variant="secondary"
                    disabled={!converted}
                    onCopySuccess={() => notify(`Copied ${t.label}`, 'success')}
                  />
                </div>

                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre-wrap break-all min-h-[34px] flex items-center">
                  {converted || <span className="text-neutral-600 italic">No text provided</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
