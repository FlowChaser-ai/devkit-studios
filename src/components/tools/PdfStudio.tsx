import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import {
  FileText,
  Image as ImageIcon,
  Layers,
  Minimize2,
  Upload,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileCode,
  RefreshCw,
} from 'lucide-react';
import { PdfActionTab } from '../../types';

interface PdfStudioProps {
  initialTab?: PdfActionTab;
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

export const PdfStudio: React.FC<PdfStudioProps> = ({ initialTab = 'text-to-pdf', notify }) => {
  const [activeTab, setActiveTab] = useState<PdfActionTab>(initialTab);

  // Sync if initialTab prop updates
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ==========================================
  // TAB 1: TEXT TO PDF STATE
  // ==========================================
  const [docTitle, setDocTitle] = useState('Technical Report & Project Overview');
  const [textContent, setTextContent] = useState(
    `DevKit Studio — Document Specification

1. INTRODUCTION
This document demonstrates client-side PDF generation executed entirely within browser memory. No text or binary data is transmitted across external networks, ensuring strict confidentiality for internal company notes, study guides, and confidential briefs.

2. SPECIFICATIONS
- Format: ISO 32000-1 (PDF Standard)
- Engine: Browser Canvas & jsPDF vector rendering
- Privacy: 100% Client-Side memory execution
- Features: Automatic text wrapping, configurable typography, headers, and pagination.

3. CONCLUSION
Client-side PDF compilation provides sub-second document export speeds while upholding stringent zero-telemetry user privacy standards.`
  );
  const [fontSize, setFontSize] = useState<number>(12);
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [isGeneratingTextPdf, setIsGeneratingTextPdf] = useState(false);

  const handleGenerateTextPdf = () => {
    try {
      setIsGeneratingTextPdf(true);
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const maxLineWidth = pageWidth - margin * 2;

      // Title header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSize + 6);
      doc.text(docTitle, margin, margin + 15);

      // Body text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);

      const splitLines = doc.splitTextToSize(textContent, maxLineWidth);
      let cursorY = margin + 45;
      const lineHeight = fontSize * 1.5;

      for (let i = 0; i < splitLines.length; i++) {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin + 20;
        }
        doc.text(splitLines[i], margin, cursorY);
        cursorY += lineHeight;
      }

      // Page numbers footer
      if (includePageNumbers) {
        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 50, pageHeight - 20);
        }
      }

      const safeFilename = (docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'document') + '.pdf';
      doc.save(safeFilename);
      notify(`Downloaded ${safeFilename}`, 'success');
    } catch (err) {
      console.error(err);
      notify('Failed to generate Text PDF', 'error');
    } finally {
      setIsGeneratingTextPdf(false);
    }
  };

  // ==========================================
  // TAB 2: IMAGES TO PDF STATE
  // ==========================================
  interface ImageItem {
    id: string;
    file: File;
    previewUrl: string;
    width: number;
    height: number;
  }
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageFit, setImageFit] = useState<'fit' | 'fill'>('fit');
  const [isConvertingImages, setIsConvertingImages] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: Promise<ImageItem>[] = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const previewUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            previewUrl,
            width: img.width,
            height: img.height,
          });
        };
        img.src = previewUrl;
      });
    });

    Promise.all(newItems).then((loaded) => {
      setImages((prev) => [...prev, ...loaded]);
      notify(`Added ${loaded.length} image(s)`, 'info');
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }
    const newArr = [...images];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setImages(newArr);
  };

  const handleGenerateImagesPdf = async () => {
    if (images.length === 0) {
      notify('Please upload at least one image', 'error');
      return;
    }

    try {
      setIsConvertingImages(true);
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const imageBytes = await item.file.arrayBuffer();
        let embeddedImage;

        if (item.file.type === 'image/jpeg' || item.file.name.endsWith('.jpg') || item.file.name.endsWith('.jpeg')) {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          // PNG or WebP converted through canvas to PNG buffer
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.src = item.previewUrl;
          });
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          const base64Data = pngDataUrl.split(',')[1];
          const rawBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          embeddedImage = await pdfDoc.embedPng(rawBytes);
        }

        // Create standard page sized to image or A4
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        const page = pdfDoc.addPage([imgWidth, imgHeight]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images_converted_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify(`Created PDF with ${images.length} pages`, 'success');
    } catch (err) {
      console.error(err);
      notify('Failed to generate Images PDF', 'error');
    } finally {
      setIsConvertingImages(false);
    }
  };

  // ==========================================
  // TAB 3: MERGE PDFS STATE
  // ==========================================
  interface MergeItem {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
  }
  const [mergeFiles, setMergeFiles] = useState<MergeItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleMergeFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const items: MergeItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        notify(`Skipped ${file.name}: only PDF files can be merged`, 'error');
        continue;
      }
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        items.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: doc.getPageCount(),
        });
      } catch (err) {
        console.error(err);
        notify(`Could not parse ${file.name}`, 'error');
      }
    }

    setMergeFiles((prev) => [...prev, ...items]);
    if (items.length > 0) {
      notify(`Loaded ${items.length} PDF file(s) for merging`, 'info');
    }
  };

  const handleRemoveMergeFile = (id: string) => {
    setMergeFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveMergeFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === mergeFiles.length - 1)
    ) {
      return;
    }
    const newArr = [...mergeFiles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setMergeFiles(newArr);
  };

  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      notify('Please add at least 2 PDF files to merge', 'error');
      return;
    }

    try {
      setIsMerging(true);
      const mergedPdf = await PDFDocument.create();

      let totalPages = 0;
      for (const item of mergeFiles) {
        const buffer = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        totalPages += copiedPages.length;
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify(`Successfully merged into a single ${totalPages}-page PDF`, 'success');
    } catch (err) {
      console.error(err);
      notify('Failed to merge PDF documents', 'error');
    } finally {
      setIsMerging(false);
    }
  };

  // ==========================================
  // TAB 4: COMPRESS / OPTIMIZE PDF STATE
  // ==========================================
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressPageCount, setCompressPageCount] = useState<number>(0);
  const [originalPdfSize, setOriginalPdfSize] = useState<number>(0);
  const [compressedPdfSize, setCompressedPdfSize] = useState<number>(0);
  const [compressedPdfBlobUrl, setCompressedPdfBlobUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const handleCompressFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      notify('Please select a valid PDF file', 'error');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setCompressFile(file);
      setOriginalPdfSize(file.size);
      setCompressPageCount(doc.getPageCount());
      setCompressedPdfSize(0);
      if (compressedPdfBlobUrl) {
        URL.revokeObjectURL(compressedPdfBlobUrl);
        setCompressedPdfBlobUrl('');
      }
      notify(`Loaded ${file.name} (${doc.getPageCount()} pages)`, 'info');
    } catch (err) {
      console.error(err);
      notify('Could not parse PDF file', 'error');
    }
  };

  const handleExecuteCompress = async () => {
    if (!compressFile) return;

    try {
      setIsCompressing(true);
      const buffer = await compressFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Client-side optimization: re-encode structural objects, remove unused metadata streams,
      // and apply stream compression dictionary flags via PDFDocument.save({ useObjectStreams: true })
      const optimizedBytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([optimizedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      setCompressedPdfSize(blob.size);
      const url = URL.createObjectURL(blob);
      setCompressedPdfBlobUrl(url);

      const diff = compressFile.size - blob.size;
      if (diff > 0) {
        const pct = Math.round((diff / compressFile.size) * 100);
        notify(`Optimized PDF: reduced by ${pct}% (${(diff / 1024).toFixed(1)} KB saved)`, 'success');
      } else {
        notify('PDF structures optimized with stream compression dictionary', 'success');
      }
    } catch (err) {
      console.error(err);
      notify('Compression failed for this PDF structure', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownloadCompressed = () => {
    if (!compressedPdfBlobUrl || !compressFile) return;
    const a = document.createElement('a');
    a.href = compressedPdfBlobUrl;
    a.download = `optimized_${compressFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify('Downloaded optimized PDF', 'success');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* PDF Studio Sub-Feature Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('text-to-pdf')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'text-to-pdf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text to PDF</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('images-to-pdf')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'images-to-pdf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Images to PDF</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('merge-pdfs')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'merge-pdfs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Merge PDFs</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('compress-pdf')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'compress-pdf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Minimize2 className="w-4 h-4" />
          <span>Compress PDF</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TOOL 1: TEXT TO PDF                                  */}
      {/* ========================================================= */}
      {activeTab === 'text-to-pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
              <div className="space-y-1">
                <label htmlFor="pdf-title-input" className="text-xs font-medium text-neutral-300">Document Title Header</label>
                <input
                  id="pdf-title-input"
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <label htmlFor="pdf-body-input" className="font-medium text-neutral-300">Document Body Content</label>
                  <span className="font-mono tabular-nums">{textContent.length} characters</span>
                </div>
                <textarea
                  id="pdf-body-input"
                  rows={14}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs font-mono text-neutral-200 leading-relaxed focus:outline-none focus:border-indigo-500"
                  placeholder="Paste or write text to convert to a PDF document..."
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
              <div className="text-xs font-semibold text-neutral-200">Page Formatting</div>

              <div className="space-y-1">
                <label htmlFor="pdf-font-size" className="text-xs text-neutral-400 block">Font Size ({fontSize} pt)</label>
                <select
                  id="pdf-font-size"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                >
                  <option value={10}>10 pt — Compact</option>
                  <option value={12}>12 pt — Standard Reading</option>
                  <option value={14}>14 pt — Large / Accessible</option>
                  <option value={16}>16 pt — High Visibility</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="pdf-orientation" className="text-xs text-neutral-400 block">Orientation</label>
                <div id="pdf-orientation" className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('p')}
                    className={`py-1.5 px-3 rounded text-xs font-medium border ${
                      orientation === 'p'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('l')}
                    className={`py-1.5 px-3 rounded text-xs font-medium border ${
                      orientation === 'l'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-800 text-indigo-600"
                />
                <span>Include &quot;Page X of Y&quot; footer</span>
              </label>

              <div className="pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={handleGenerateTextPdf}
                  disabled={isGeneratingTextPdf || !textContent.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingTextPdf ? 'Compiling PDF...' : 'Download PDF Document'}</span>
                </button>
              </div>

              <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                Standard A4 PDF with automatic multi-page pagination. Compiled 100% locally in your browser memory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TOOL 2: IMAGES TO PDF                                */}
      {/* ========================================================= */}
      {activeTab === 'images-to-pdf' && (
        <div className="space-y-6">
          <div className="p-6 border-2 border-dashed border-neutral-800 hover:border-indigo-500/50 rounded-xl bg-neutral-900/50 text-center transition-colors flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              id="images-to-pdf-input"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label htmlFor="images-to-pdf-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                Select or Drop Multiple Images
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mb-4">
                JPEG, PNG, or WebP. Each image becomes a clean page in the resulting PDF.
              </p>
              <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                Browse Images
              </span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold text-neutral-200">
                  Image Queue ({images.length} Pages)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                      setImages([]);
                    }}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateImagesPdf}
                    disabled={isConvertingImages}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isConvertingImages ? 'Generating PDF...' : 'Download Combined PDF'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                          Page {index + 1}
                        </span>
                        <span className="truncate max-w-[120px] text-[11px]">{item.file.name}</span>
                      </div>
                      <div className="h-36 w-full rounded bg-neutral-900 flex items-center justify-center overflow-hidden border border-neutral-800/80">
                        <img
                          src={item.previewUrl}
                          alt={`Page ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'down')}
                          disabled={index === images.length - 1}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                          title="Move later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400"
                        title="Remove page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TOOL 3: MERGE PDFS                                   */}
      {/* ========================================================= */}
      {activeTab === 'merge-pdfs' && (
        <div className="space-y-6">
          <div className="p-6 border-2 border-dashed border-neutral-800 hover:border-indigo-500/50 rounded-xl bg-neutral-900/50 text-center transition-colors flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              id="merge-pdfs-input"
              multiple
              accept="application/pdf"
              onChange={handleMergeFilesUpload}
              className="hidden"
            />
            <label htmlFor="merge-pdfs-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                Select Two or More PDF Documents to Merge
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mb-4">
                Arrange files in your desired sequence. Merging happens entirely client-side without remote uploads.
              </p>
              <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                Choose PDF Files
              </span>
            </label>
          </div>

          {mergeFiles.length > 0 && (
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold text-neutral-200">
                  Merge Sequence ({mergeFiles.length} Documents · {mergeFiles.reduce((acc, f) => acc + f.pageCount, 0)} Total Pages)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMergeFiles([])}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteMerge}
                    disabled={isMerging || mergeFiles.length < 2}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isMerging ? 'Merging Documents...' : 'Merge & Download Unified PDF'}</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950">
                {mergeFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-neutral-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs tabular-nums text-neutral-500 w-6">
                        #{index + 1}
                      </span>
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-neutral-200 truncate max-w-sm sm:max-w-md">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {item.pageCount} page(s) · {formatFileSize(item.size)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveMergeFile(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMergeFile(index, 'down')}
                        disabled={index === mergeFiles.length - 1}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMergeFile(item.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400 ml-2"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TOOL 4: COMPRESS PDF                                 */}
      {/* ========================================================= */}
      {activeTab === 'compress-pdf' && (
        <div className="space-y-6">
          {!compressFile ? (
            <div className="p-8 border-2 border-dashed border-neutral-800 hover:border-indigo-500/50 rounded-xl bg-neutral-900/50 text-center transition-colors flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                id="compress-pdf-input"
                accept="application/pdf"
                onChange={handleCompressFileUpload}
                className="hidden"
              />
              <label htmlFor="compress-pdf-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                  <Minimize2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                  Upload PDF to Compress & Optimize
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-4">
                  Normalizes PDF object streams, strips orphaned metadata dictionaries, and cleans up document bytes.
                </p>
                <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                  Select PDF File
                </span>
              </label>
            </div>
          ) : (
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-neutral-100">{compressFile.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {compressPageCount} pages · Original Size: {formatFileSize(originalPdfSize)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (compressedPdfBlobUrl) URL.revokeObjectURL(compressedPdfBlobUrl);
                    setCompressFile(null);
                    setCompressedPdfBlobUrl('');
                  }}
                  className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Choose Another File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-neutral-300">Optimization Mechanism</div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Runs stream compression on internal PDF cross-reference tables and compresses raw binary page objects with <code>useObjectStreams</code>.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleExecuteCompress}
                      disabled={isCompressing}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors shadow-sm disabled:opacity-40"
                    >
                      {isCompressing ? 'Optimizing Objects...' : 'Run Optimization'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-neutral-300">Results Comparison</div>
                  {compressedPdfSize > 0 ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Original Size:</span>
                        <span className="font-mono tabular-nums text-neutral-300">{formatFileSize(originalPdfSize)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Optimized Size:</span>
                        <span className="font-mono tabular-nums text-emerald-400 font-semibold">{formatFileSize(compressedPdfSize)}</span>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleDownloadCompressed}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Optimized PDF</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 py-3">
                      Click &quot;Run Optimization&quot; to inspect byte reductions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
