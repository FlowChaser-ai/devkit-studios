import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { CheckCircle2, AlertCircle, Trash2, Download, FileCode, Wand2, FileSpreadsheet } from 'lucide-react';

interface JsonFormatterProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

const SAMPLE_JSONS: Record<string, string> = {
  api: JSON.stringify(
    {
      status: 'success',
      data: {
        id: 'usr_98a72b',
        username: 'alex_developer',
        email: 'alex@example.org',
        roles: ['admin', 'contributor'],
        profile: {
          bio: 'Building open-source developer tooling for the web.',
          website: 'https://github.com/devkit-studio',
          location: 'San Francisco, CA',
        },
        metrics: {
          contributions: 428,
          reputation: 99.4,
          verified: true,
        },
      },
      timestamp: 1729900800,
    },
    null,
    2
  ),
  config: JSON.stringify(
    {
      name: 'devkit-studio',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'lucide-react': '^0.546.0',
      },
      engines: {
        node: '>=18.0.0',
      },
    },
    null,
    2
  ),
};

export const JsonFormatter: React.FC<JsonFormatterProps> = ({ notify }) => {
  const [input, setInput] = useState<string>(SAMPLE_JSONS.api);
  const [output, setOutput] = useState<string>(SAMPLE_JSONS.api);
  const [indent, setIndent] = useState<number | string>(2);
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [sortKeys, setSortKeys] = useState<boolean>(false);

  const getLineColFromError = (errMsg: string, text: string) => {
    // Try to extract position e.g. "at position 42"
    const posMatch = errMsg.match(/position\s+(\d+)/i);
    if (posMatch && posMatch[1]) {
      const pos = parseInt(posMatch[1], 10);
      const lines = text.slice(0, pos).split('\n');
      return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
      };
    }
    // Try "line X column Y"
    const lineColMatch = errMsg.match(/line\s+(\d+).*column\s+(\d+)/i);
    if (lineColMatch) {
      return {
        line: parseInt(lineColMatch[1], 10),
        column: parseInt(lineColMatch[2], 10),
      };
    }
    return {};
  };

  const deepSortKeys = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(deepSortKeys);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj as Record<string, unknown>)
        .sort()
        .reduce((res: Record<string, unknown>, key: string) => {
          res[key] = deepSortKeys((obj as Record<string, unknown>)[key]);
          return res;
        }, {});
    }
    return obj;
  };

  const handleFormat = (customIndent = indent, customSort = sortKeys) => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      let parsed = JSON.parse(input);
      if (customSort) {
        parsed = deepSortKeys(parsed);
      }
      const indentVal = customIndent === 'tab' ? '\t' : Number(customIndent);
      const formatted = JSON.stringify(parsed, null, indentVal);
      setOutput(formatted);
      setError(null);
      notify('JSON formatted and validated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
      const loc = getLineColFromError(msg, input);
      setError({ message: msg, ...loc });
      notify('Invalid JSON detected. See error details.', 'error');
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      notify('JSON minified into compact single line', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
      const loc = getLineColFromError(msg, input);
      setError({ message: msg, ...loc });
      notify('Cannot minify invalid JSON', 'error');
    }
  };

  const handleFixCommonIssues = () => {
    try {
      // Replace single quotes around keys/values with double quotes
      let fixed = input
        .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
        // Remove trailing commas in objects and arrays
        .replace(/,\s*([}\]])/g, '$1');

      // Attempt parsing
      JSON.parse(fixed);
      setInput(fixed);
      const parsed = JSON.parse(fixed);
      setOutput(JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent)));
      setError(null);
      notify('Repaired common JSON syntax issues (quotes & trailing commas)', 'success');
    } catch (err) {
      notify('Could not automatically fix JSON. Please check manual syntax.', 'error');
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devkit_output.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Downloaded devkit_output.json', 'success');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;
  const reduction = inputBytes > 0 && outputBytes < inputBytes 
    ? Math.round(((inputBytes - outputBytes) / inputBytes) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFormat()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            Format & Validate
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors whitespace-nowrap"
          >
            Minify Compact
          </button>
          <button
            type="button"
            onClick={handleFixCommonIssues}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Auto-fix single quotes and trailing commas"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Fix</span>
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1 hidden sm:block" />

          {/* Indent Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>Indent:</span>
            <select
              value={indent}
              onChange={(e) => {
                const val = e.target.value === 'tab' ? 'tab' : parseInt(e.target.value, 10);
                setIndent(val);
                if (output && !error) handleFormat(val, sortKeys);
              }}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>

          {/* Sort Keys Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer select-none ml-2">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => {
                setSortKeys(e.target.checked);
                if (output && !error) handleFormat(indent, e.target.checked);
              }}
              className="rounded bg-neutral-800 border-neutral-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
            />
            <span>Sort Keys</span>
          </label>
        </div>

        {/* Templates & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <span>Sample:</span>
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_JSONS.api);
                setOutput(SAMPLE_JSONS.api);
                setError(null);
              }}
              className="hover:text-indigo-400 px-1 py-0.5 rounded text-neutral-300"
            >
              API
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_JSONS.config);
                setOutput(SAMPLE_JSONS.config);
                setError(null);
              }}
              className="hover:text-indigo-400 px-1 py-0.5 rounded text-neutral-300"
            >
              Config
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
            title="Clear all"
            aria-label="Clear all input and output"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner if invalid */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-300">Syntax Error Detected</div>
            <div className="font-mono text-neutral-300">{error.message}</div>
            {(error.line || error.column) && (
              <div className="text-neutral-400">
                Location: Line {error.line || '?'}, Column {error.column || '?'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor & Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="flex flex-col border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-medium text-neutral-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              JSON Input
            </span>
            <span className="font-mono tabular-nums text-neutral-400">
              {inputBytes > 1024 ? `${(inputBytes / 1024).toFixed(1)} KB` : `${inputBytes} B`}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw, unformatted, or minified JSON here..."
            className="w-full h-96 p-3 bg-neutral-950 text-neutral-100 font-mono text-xs leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Formatted Output
              </span>
              {!error && output && (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> Valid JSON
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {reduction > 0 && (
                <span className="text-emerald-400 text-[11px] font-mono tabular-nums">
                  -{reduction}% smaller
                </span>
              )}
              <span className="font-mono tabular-nums text-neutral-400">
                {outputBytes > 1024 ? `${(outputBytes / 1024).toFixed(1)} KB` : `${outputBytes} B`}
              </span>
              <CopyButton
                textToCopy={output}
                label="Copy"
                variant="secondary"
                disabled={!output || !!error}
                onCopySuccess={(msg) => notify(msg || 'JSON copied', 'success')}
              />
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output || !!error}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Download .json file"
                aria-label="Download JSON file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="w-full h-96 p-3 bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed resize-y focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
