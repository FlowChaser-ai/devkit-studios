import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Trash2, Upload, FileCode, AlertCircle, ArrowLeftRight, Download, Image as ImageIcon } from 'lucide-react';

interface Base64CodecProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

type Mode = 'encode' | 'decode' | 'file';

// UTF-8 safe encode: handles Unicode characters & emojis without Latin-1 errors
const encodeUtf8Base64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// UTF-8 safe decode
const decodeUtf8Base64 = (base64: string): string => {
  const clean = base64.trim().replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

export const Base64Codec: React.FC<Base64CodecProps> = ({ notify }) => {
  const [mode, setMode] = useState<Mode>('encode');
  const [inputText, setInputText] = useState<string>('Hello from DevKit Studio! 🚀');
  const [outputText, setOutputText] = useState<string>('SGVsbG8gZnJvbSBEZXZLaXQgU3R1ZGlvISDwn5mp');
  const [error, setError] = useState<string | null>(null);

  // File state
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [includeDataUriPrefix, setIncludeDataUriPrefix] = useState<boolean>(true);
  const [rawBase64Data, setRawBase64Data] = useState<string>('');

  const handleTextChange = (text: string, currentMode = mode) => {
    setInputText(text);
    if (!text.trim()) {
      setOutputText('');
      setError(null);
      return;
    }

    try {
      if (currentMode === 'encode') {
        const encoded = encodeUtf8Base64(text);
        setOutputText(encoded);
        setError(null);
      } else if (currentMode === 'decode') {
        // Strip data URI prefix if pasted
        let clean = text.trim();
        if (clean.includes('base64,')) {
          clean = clean.split('base64,')[1];
        }
        const decoded = decodeUtf8Base64(clean);
        setOutputText(decoded);
        setError(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid Base64 sequence');
      setOutputText('');
    }
  };

  const handleSwapModes = () => {
    if (mode === 'file') return;
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInputText(outputText);
    handleTextChange(outputText, newMode);
    notify(`Switched to ${newMode.toUpperCase()} mode`, 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type || 'application/octet-stream');
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Part = result.split(',')[1] || '';
      setRawBase64Data(base64Part);

      if (includeDataUriPrefix) {
        setOutputText(result);
      } else {
        setOutputText(base64Part);
      }
      setError(null);
      notify(`Encoded ${file.name} to Base64`, 'success');
    };
    reader.onerror = () => {
      setError('Failed to read file from disk');
      notify('File reading failed', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadDecoded = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Output downloaded as file', 'success');
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setFileName('');
    setRawBase64Data('');
  };

  // Check if output is an image Data URI
  const isImageDataUri = outputText.startsWith('data:image/');

  return (
    <div className="space-y-6">
      {/* Mode Selector & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-md">
          <button
            type="button"
            onClick={() => {
              setMode('encode');
              handleTextChange(inputText, 'encode');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'encode' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Encode Text
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('decode');
              handleTextChange(inputText, 'decode');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'decode' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Decode Base64
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('file');
              setError(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'file' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            File to Base64
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mode !== 'file' && (
            <button
              type="button"
              onClick={handleSwapModes}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
            title="Clear all"
            aria-label="Clear input and output"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}. Check for invalid characters or corrupt padding.</span>
        </div>
      )}

      {/* Mode Specific Inputs */}
      {mode === 'file' ? (
        <div className="p-8 border-2 border-dashed border-neutral-800 hover:border-indigo-500/50 rounded-xl bg-neutral-900/50 text-center transition-colors flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-indigo-400 mb-3" />
          <p className="text-sm font-medium text-neutral-200 mb-1">
            Select an image or file to convert to Base64
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            Files are processed strictly locally in your browser memory. Nothing is sent to any server.
          </p>

          <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
            <span>Browse Computer</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>

          {fileName && (
            <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 flex items-center gap-4">
              <span>File: {fileName}</span>
              <span>·</span>
              <span>{(fileSize / 1024).toFixed(1)} KB</span>
              <span>·</span>
              <span>{fileType}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
              <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                {mode === 'encode' ? 'Raw UTF-8 Text Input' : 'Base64 Input'}
              </span>
              <span className="font-mono tabular-nums text-neutral-400">
                {inputText.length} chars
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'Enter plain text to encode into Base64...'
                  : 'Paste Base64 string to decode...'
              }
              rows={8}
              className="w-full p-3 bg-neutral-950 text-neutral-100 font-mono text-xs leading-relaxed resize-y focus:outline-none"
            />
          </div>

          {/* Output Panel */}
          <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
              <span className="font-medium text-neutral-300">
                {mode === 'encode' ? 'Encoded Base64 Output' : 'Decoded Text Output'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-neutral-400">
                  {outputText.length} chars
                </span>
                <CopyButton
                  textToCopy={outputText}
                  label="Copy"
                  variant="secondary"
                  disabled={!outputText}
                  onCopySuccess={() => notify('Output copied to clipboard', 'success')}
                />
                <button
                  type="button"
                  onClick={handleDownloadDecoded}
                  disabled={!outputText}
                  className="p-1.5 text-neutral-400 hover:text-white rounded disabled:opacity-30"
                  title="Download as file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="Result will appear here..."
              rows={8}
              className="w-full p-3 bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed resize-y focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Mode === file output and image preview */}
      {mode === 'file' && outputText && (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-200">Base64 Output</span>
              <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDataUriPrefix}
                  onChange={(e) => {
                    setIncludeDataUriPrefix(e.target.checked);
                    if (e.target.checked) {
                      setOutputText(`data:${fileType};base64,${rawBase64Data}`);
                    } else {
                      setOutputText(rawBase64Data);
                    }
                  }}
                  className="rounded bg-neutral-950 border-neutral-800 text-indigo-600"
                />
                <span>Include Data URI Prefix (data:image/...)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-400">
                {outputText.length} chars
              </span>
              <CopyButton
                textToCopy={outputText}
                label="Copy Base64"
                variant="primary"
                onCopySuccess={() => notify('Base64 string copied', 'success')}
              />
            </div>
          </div>

          <textarea
            value={outputText}
            readOnly
            rows={6}
            className="w-full p-3 bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed rounded border border-neutral-800 focus:outline-none"
          />

          {isImageDataUri && (
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col items-center gap-2">
              <div className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 mb-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                Decoded Image Live Render
              </div>
              <img
                src={outputText}
                alt="Decoded preview"
                className="max-h-64 max-w-full rounded border border-neutral-800 object-contain shadow"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
