import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { ArrowLeftRight, Trash2, Plus, AlertCircle, Link2, ExternalLink } from 'lucide-react';

interface UrlCodecProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

type EncodeMethod = 'component' | 'full';

const SAMPLE_URL = 'https://api.example.com/v2/search?q=open source dev tools&sort=asc&filter=active#results';

export const UrlCodec: React.FC<UrlCodecProps> = ({ notify }) => {
  const [input, setInput] = useState<string>(SAMPLE_URL);
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeMethod, setEncodeMethod] = useState<EncodeMethod>('component');
  const [error, setError] = useState<string | null>(null);

  // Parsed query parameters breakdown
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([]);
  const [parsedBaseUrl, setParsedBaseUrl] = useState<string>('');

  const parseUrlParams = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      setParsedBaseUrl(`${parsed.origin}${parsed.pathname}`);
      const params: { key: string; value: string }[] = [];
      parsed.searchParams.forEach((val, key) => {
        params.push({ key, value: val });
      });
      setQueryParams(params);
    } catch {
      // If not a full URL, attempt manual query string extraction
      if (urlStr.includes('?')) {
        const parts = urlStr.split('?');
        setParsedBaseUrl(parts[0]);
        const search = parts[1]?.split('#')[0] || '';
        const searchParams = new URLSearchParams(search);
        const params: { key: string; value: string }[] = [];
        searchParams.forEach((val, key) => {
          params.push({ key, value: val });
        });
        setQueryParams(params);
      } else {
        setQueryParams([]);
        setParsedBaseUrl('');
      }
    }
  };

  const processUrl = (val: string, curMode = mode, method = encodeMethod) => {
    setInput(val);
    if (!val.trim()) {
      setOutput('');
      setError(null);
      setQueryParams([]);
      return;
    }

    try {
      if (curMode === 'encode') {
        const res = method === 'component' ? encodeURIComponent(val) : encodeURI(val);
        setOutput(res);
        setError(null);
      } else {
        const res = decodeURIComponent(val);
        setOutput(res);
        setError(null);
        parseUrlParams(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Malformed URI sequence');
      setOutput('');
    }

    if (curMode === 'encode') {
      parseUrlParams(val);
    }
  };

  const handleSwap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    processUrl(output, newMode, encodeMethod);
    notify(`Switched to ${newMode.toUpperCase()} mode`, 'info');
  };

  const updateQueryParam = (index: number, newKey: string, newValue: string) => {
    const updated = [...queryParams];
    updated[index] = { key: newKey, value: newValue };
    setQueryParams(updated);

    // Reconstruct URL
    if (parsedBaseUrl) {
      const searchParams = new URLSearchParams();
      updated.forEach((p) => {
        if (p.key.trim()) searchParams.append(p.key.trim(), p.value);
      });
      const queryString = searchParams.toString();
      const newUrl = queryString ? `${parsedBaseUrl}?${queryString}` : parsedBaseUrl;
      setInput(newUrl);
      processUrl(newUrl, mode, encodeMethod);
    }
  };

  const addQueryParam = () => {
    const updated = [...queryParams, { key: 'param', value: 'value' }];
    setQueryParams(updated);
  };

  const removeQueryParam = (index: number) => {
    const updated = queryParams.filter((_, i) => i !== index);
    setQueryParams(updated);

    if (parsedBaseUrl) {
      const searchParams = new URLSearchParams();
      updated.forEach((p) => {
        if (p.key.trim()) searchParams.append(p.key.trim(), p.value);
      });
      const queryString = searchParams.toString();
      const newUrl = queryString ? `${parsedBaseUrl}?${queryString}` : parsedBaseUrl;
      setInput(newUrl);
      processUrl(newUrl, mode, encodeMethod);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setQueryParams([]);
    setParsedBaseUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-md">
            <button
              type="button"
              onClick={() => {
                setMode('encode');
                processUrl(input, 'encode');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                mode === 'encode' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Encode URL
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('decode');
                processUrl(input, 'decode');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                mode === 'decode' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Decode URL
            </button>
          </div>

          {mode === 'encode' && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 pl-2">
              <span>Standard:</span>
              <select
                value={encodeMethod}
                onChange={(e) => {
                  const m = e.target.value as EncodeMethod;
                  setEncodeMethod(m);
                  processUrl(input, 'encode', m);
                }}
                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200"
              >
                <option value="component">encodeURIComponent (All special chars)</option>
                <option value="full">encodeURI (Preserves http://, /, ?)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
            title="Clear all"
            aria-label="Clear URL input"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}: Malformed percent-encoding sequence detected (e.g., %ZZ or lonely %).</span>
        </div>
      )}

      {/* Dual Textarea Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-medium text-neutral-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              {mode === 'encode' ? 'Raw URL / Query String' : 'Encoded URI String'}
            </span>
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_URL);
                processUrl(SAMPLE_URL, mode);
              }}
              className="text-neutral-400 hover:text-indigo-400"
            >
              Sample URL
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => processUrl(e.target.value)}
            placeholder="Paste URL or text to encode/decode..."
            rows={5}
            className="w-full p-3 bg-neutral-950 text-neutral-100 font-mono text-xs leading-relaxed resize-y focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">
              {mode === 'encode' ? 'Percent-Encoded Output' : 'Decoded URL Output'}
            </span>
            <CopyButton
              textToCopy={output}
              label="Copy Result"
              variant="secondary"
              disabled={!output}
              onCopySuccess={() => notify('URL copied to clipboard', 'success')}
            />
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Processed output appears here..."
            rows={5}
            className="w-full p-3 bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed resize-y focus:outline-none"
          />
        </div>
      </div>

      {/* Query Parameters Table Inspector */}
      {queryParams.length > 0 && (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200">
              Extracted Query Parameters ({queryParams.length})
            </span>
            <button
              type="button"
              onClick={addQueryParam}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </div>

          <div className="border border-neutral-800 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 font-mono">
                <tr>
                  <th className="py-2 px-3 w-1/3">Key (Param)</th>
                  <th className="py-2 px-3">Decoded Value</th>
                  <th className="py-2 px-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                {queryParams.map((param, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateQueryParam(index, e.target.value, param.value)}
                        className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-200 focus:border-indigo-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateQueryParam(index, param.key, e.target.value)}
                        className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-200 focus:border-indigo-500"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeQueryParam(index)}
                        className="p-1 text-neutral-400 hover:text-rose-400"
                        title="Remove parameter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
