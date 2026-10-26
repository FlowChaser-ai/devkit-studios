import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../common/CopyButton';
import { RefreshCw, Download, Fingerprint, Check } from 'lucide-react';

interface UuidGeneratorProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

// Cryptographically secure UUID v4 generator
const generateSingleUuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 compliant
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const UuidGenerator: React.FC<UuidGeneratorProps> = ({ notify }) => {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<'none' | 'double' | 'single'>('none');
  const [outputFormat, setOutputFormat] = useState<'plain' | 'json'>('plain');

  const [uuids, setUuids] = useState<string[]>([]);

  const generateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateSingleUuid());
    }
    setUuids(list);
  }, [count]);

  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  const formatUuid = (raw: string): string => {
    let result = raw;
    if (!hyphens) {
      result = result.replace(/-/g, '');
    }
    if (uppercase) {
      result = result.toUpperCase();
    } else {
      result = result.toLowerCase();
    }
    if (braces) {
      result = `{${result}}`;
    }
    if (quotes === 'double') {
      result = `"${result}"`;
    } else if (quotes === 'single') {
      result = `'${result}'`;
    }
    return result;
  };

  const formattedUuids = uuids.map(formatUuid);

  const getFullOutputText = (): string => {
    if (outputFormat === 'json') {
      return JSON.stringify(formattedUuids, null, 2);
    }
    return formattedUuids.join('\n');
  };

  const fullText = getFullOutputText();

  const handleDownload = () => {
    const ext = outputFormat === 'json' ? 'json' : 'txt';
    const blob = new Blob([fullText], { type: outputFormat === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uuids_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(`Downloaded ${count} UUIDs as .${ext}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generateUuids}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          {/* Count Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>Quantity:</span>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200"
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
              <option value={25}>25 UUIDs</option>
              <option value={50}>50 UUIDs</option>
              <option value={100}>100 UUIDs</option>
            </select>
          </div>

          <div className="h-4 w-px bg-neutral-700 mx-1 hidden sm:block" />

          {/* Format switches */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-indigo-600"
              />
              <span>Uppercase</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-indigo-600"
              />
              <span>Hyphens</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={braces}
                onChange={(e) => setBraces(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-indigo-600"
              />
              <span>Braces {'{}'}</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Output Format */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded">
            <button
              type="button"
              onClick={() => setOutputFormat('plain')}
              className={`px-2 py-1 text-xs rounded ${
                outputFormat === 'plain' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
              }`}
            >
              Lines
            </button>
            <button
              type="button"
              onClick={() => setOutputFormat('json')}
              className={`px-2 py-1 text-xs rounded ${
                outputFormat === 'json' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
              }`}
            >
              JSON
            </button>
          </div>

          <CopyButton
            textToCopy={fullText}
            label="Copy All"
            variant="secondary"
            onCopySuccess={() => notify(`Copied ${count} UUIDs`, 'success')}
          />
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 border border-neutral-700 rounded transition-colors"
            title="Download formatted file"
            aria-label="Download UUIDs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Single UUID Highlight Box */}
      {formattedUuids[0] && (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <Fingerprint className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-neutral-400 block">Primary UUID</span>
              <span className="font-mono text-sm sm:text-base font-semibold text-neutral-100 truncate block selection:bg-indigo-500/30">
                {formattedUuids[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CopyButton
              textToCopy={formattedUuids[0]}
              label="Copy Primary"
              variant="primary"
              onCopySuccess={() => notify('Primary UUID copied', 'success')}
            />
          </div>
        </div>
      )}

      {/* Batch List Display */}
      <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
          <span className="font-medium text-neutral-300">
            Batch Output ({formattedUuids.length} Identifiers)
          </span>
          <span className="font-mono tabular-nums text-neutral-400">
            RFC 4122 v4 Standard
          </span>
        </div>

        <div className="divide-y divide-neutral-800 max-h-96 overflow-y-auto">
          {formattedUuids.map((uuid, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 hover:bg-neutral-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[11px] font-mono tabular-nums text-neutral-400 w-6">
                  {idx + 1}.
                </span>
                <span className="font-mono text-xs text-neutral-200 truncate select-all">
                  {uuid}
                </span>
              </div>
              <CopyButton
                textToCopy={uuid}
                variant="icon"
                className="opacity-70 group-hover:opacity-100"
                onCopySuccess={() => notify(`Copied #${idx + 1}`, 'success')}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
