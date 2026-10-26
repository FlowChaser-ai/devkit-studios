import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Trash2, Image as ImageIcon, Sliders, ArrowRight } from 'lucide-react';

interface ImageCompressorProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png';

export const ImageCompressor: React.FC<ImageCompressorProps> = ({ notify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  
  // Dimensions
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);

  // Compression parameters
  const [quality, setQuality] = useState<number>(80); // 1 - 100
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');

  // File size states
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      notify('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOriginalUrl(url);

      const img = new Image();
      img.onload = () => {
        setOrigDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
      img.src = url;
    };
    reader.readAsDataURL(selectedFile);
    notify(`Loaded ${selectedFile.name}`, 'info');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Perform client-side compression via canvas
  useEffect(() => {
    if (!originalUrl || origDimensions.width === 0) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = targetWidth || img.width;
      const h = targetHeight || img.height;

      canvas.width = w;
      canvas.height = h;

      if (!ctx) return;

      // Fill white background for JPEGs if source had transparent alpha
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            setCompressedSize(blob.size);
            if (compressedUrl) {
              URL.revokeObjectURL(compressedUrl);
            }
            const newUrl = URL.createObjectURL(blob);
            setCompressedUrl(newUrl);
          }
        },
        format,
        quality / 100
      );
    };
    img.src = originalUrl;
  }, [originalUrl, quality, format, targetWidth, targetHeight, origDimensions.width]);

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (preserveAspectRatio && origDimensions.width > 0) {
      const ratio = origDimensions.height / origDimensions.width;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleDownload = () => {
    if (!compressedUrl || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `${baseName}_compressed.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Downloaded compressed image as .${ext}`, 'success');
  };

  const handleReset = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setOriginalUrl('');
    setCompressedUrl('');
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(80);
    setFormat('image/jpeg');
    notify('Reset image compressor', 'info');
  };

  const savingsPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone if no image loaded */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-12 border-2 border-dashed border-neutral-800 hover:border-indigo-500/60 rounded-xl bg-neutral-900/50 text-center transition-colors flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => {
            const el = document.getElementById('image-file-input');
            if (el) el.click();
          }}
        >
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200 mb-1">
            Drag and drop your image here, or click to browse
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-4">
            Supports JPEG, PNG, and WebP. 100% private in-browser compression without server uploads.
          </p>
          <input
            id="image-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
          >
            Select Image
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Info & Actions Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-neutral-200 block truncate max-w-xs">
                  {file.name}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {origDimensions.width} × {origDimensions.height} px
                </span>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-neutral-400">{formatBytes(originalSize)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-100 font-semibold">{formatBytes(compressedSize)}</span>
                {savingsPercent > 0 && (
                  <span className="text-emerald-400 font-medium">
                    (-{savingsPercent}%)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!compressedUrl || isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
            {/* Quality Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="quality-slider" className="text-neutral-300 font-medium">Quality ({quality}%)</label>
                <span className="text-neutral-400 text-[11px]">
                  {quality > 85 ? 'High fidelity' : quality > 60 ? 'Balanced' : 'Aggressive'}
                </span>
              </div>
              <input
                id="quality-slider"
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Target Format */}
            <div className="space-y-1.5">
              <label htmlFor="format-select" className="text-xs text-neutral-300 font-medium block">Output Format</label>
              <select
                id="format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200"
              >
                <option value="image/jpeg">JPEG (Universal, best photo compression)</option>
                <option value="image/webp">WebP (Modern, high efficiency)</option>
                <option value="image/png">PNG (Lossless / transparent)</option>
              </select>
            </div>

            {/* Resize Max Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="width-input" className="text-neutral-300 font-medium">Resize Width ({targetWidth}px)</label>
                <label className="flex items-center gap-1 text-[11px] text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preserveAspectRatio}
                    onChange={(e) => setPreserveAspectRatio(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600"
                  />
                  <span>Lock Ratio</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="width-input"
                  type="number"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 100)}
                  min={50}
                  max={8000}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setTargetWidth(origDimensions.width);
                    setTargetHeight(origDimensions.height);
                  }}
                  className="text-xs text-neutral-400 hover:text-white px-2 py-1 bg-neutral-800 rounded"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Side-by-side Visual Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Card */}
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-neutral-300">Original Source</span>
                <span className="font-mono tabular-nums">{formatBytes(originalSize)}</span>
              </div>
              <div className="h-72 w-full bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={originalUrl}
                  alt="Original preview"
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>
            </div>

            {/* Compressed Card */}
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                  Compressed Output
                  {isProcessing && <span className="text-amber-400 text-[10px]">Processing...</span>}
                </span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                  {formatBytes(compressedSize)}
                </span>
              </div>
              <div className="h-72 w-full bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-center overflow-hidden p-2">
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed output preview"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                ) : (
                  <span className="text-neutral-500 text-xs">Generating preview...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
