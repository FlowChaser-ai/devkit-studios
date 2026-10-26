import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw, Wifi, Link, Mail, Phone, FileText } from 'lucide-react';

interface QrGeneratorProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export const QrGenerator: React.FC<QrGeneratorProps> = ({ notify }) => {
  const [type, setType] = useState<QrType>('url');
  
  // Basic content
  const [url, setUrl] = useState('https://github.com/devkit-studio');
  const [text, setText] = useState('DevKit Studio: Fast, private, open-source developer tools.');
  
  // Wi-Fi inputs
  const [wifiSsid, setWifiSsid] = useState('DevKit-Guest');
  const [wifiPassword, setWifiPassword] = useState('devkit2026');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Email inputs
  const [emailTo, setEmailTo] = useState('contact@example.org');
  const [emailSubject, setEmailSubject] = useState('Hello from DevKit Studio');
  const [emailBody, setEmailBody] = useState('Love the open-source tools!');

  // Phone input
  const [phone, setPhone] = useState('+1-555-019-2834');

  // QR Settings
  const [size, setSize] = useState<number>(280);
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#0a0a0a');
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M');
  const [margin, setMargin] = useState<number>(2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [svgData, setSvgData] = useState<string>('');

  // Assemble the QR string according to type
  const getRawContent = (): string => {
    switch (type) {
      case 'url':
        return url.trim() || 'https://';
      case 'text':
        return text;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phone.replace(/\s+/g, '')}`;
      default:
        return url;
    }
  };

  const rawString = getRawContent();

  useEffect(() => {
    if (!canvasRef.current || !rawString) return;

    QRCode.toCanvas(
      canvasRef.current,
      rawString,
      {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      },
      (err) => {
        if (err) {
          console.error('QR code generation error:', err);
          notify('Error rendering QR code with chosen parameters', 'error');
        }
      }
    );

    // Also generate SVG for vector download
    QRCode.toString(
      rawString,
      {
        type: 'svg',
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      },
      (err, svgString) => {
        if (!err && svgString) {
          setSvgData(svgString);
        }
      }
    );
  }, [rawString, size, fgColor, bgColor, errorLevel, margin, notify]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notify('QR code PNG downloaded successfully', 'success');
    } catch (err) {
      notify('Failed to export PNG', 'error');
    }
  };

  const handleDownloadSvg = () => {
    if (!svgData) return;
    try {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrcode_${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify('QR code SVG downloaded successfully', 'success');
    } catch (err) {
      notify('Failed to export SVG', 'error');
    }
  };

  const handleReset = () => {
    setUrl('https://github.com/devkit-studio');
    setText('');
    setSize(280);
    setFgColor('#ffffff');
    setBgColor('#0a0a0a');
    setErrorLevel('M');
    setMargin(2);
    notify('Reset QR settings to defaults', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-5">
        {/* Type Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            type="button"
            onClick={() => setType('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              type === 'url' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => setType('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              type === 'text' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plain Text</span>
          </button>
          <button
            type="button"
            onClick={() => setType('wifi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              type === 'wifi' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi</span>
          </button>
          <button
            type="button"
            onClick={() => setType('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              type === 'email' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => setType('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              type === 'phone' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
        </div>

        {/* Input Fields */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
          {type === 'url' && (
            <div className="space-y-1.5">
              <label htmlFor="qr-url-input" className="text-xs font-medium text-neutral-300">Target Website URL</label>
              <input
                id="qr-url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {type === 'text' && (
            <div className="space-y-1.5">
              <label htmlFor="qr-text-input" className="text-xs font-medium text-neutral-300">Text Content</label>
              <textarea
                id="qr-text-input"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter arbitrary text or notes..."
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {type === 'wifi' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="qr-wifi-ssid" className="text-xs font-medium text-neutral-300">Network Name (SSID)</label>
                  <input
                    id="qr-wifi-ssid"
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="qr-wifi-pass" className="text-xs font-medium text-neutral-300">Password</label>
                  <input
                    id="qr-wifi-pass"
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <label htmlFor="qr-wifi-auth" className="text-neutral-400">Security:</label>
                  <select
                    id="qr-wifi-auth"
                    value={wifiAuth}
                    onChange={(e) => setWifiAuth(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                    className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600"
                  />
                  <span>Hidden Network</span>
                </label>
              </div>
            </div>
          )}

          {type === 'email' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="qr-email-addr" className="text-xs font-medium text-neutral-300">Recipient Email</label>
                <input
                  id="qr-email-addr"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="qr-email-subject" className="text-xs font-medium text-neutral-300">Subject</label>
                <input
                  id="qr-email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="qr-email-body" className="text-xs font-medium text-neutral-300">Pre-filled Body</label>
                <textarea
                  id="qr-email-body"
                  rows={2}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100"
                />
              </div>
            </div>
          )}

          {type === 'phone' && (
            <div className="space-y-1.5">
              <label htmlFor="qr-phone-input" className="text-xs font-medium text-neutral-300">Phone Number (with country code)</label>
              <input
                id="qr-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 font-mono"
              />
            </div>
          )}
        </div>

        {/* Customization Options */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
          <div className="text-xs font-semibold text-neutral-200">Customization & Aesthetics</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foreground & Background Color */}
            <div className="space-y-2">
              <label htmlFor="qr-fg-color" className="text-xs text-neutral-400">Foreground Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="qr-fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-neutral-200"
                />
                <div className="flex gap-1">
                  {['#ffffff', '#6366f1', '#06b6d4', '#10b981'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFgColor(c)}
                      className="w-5 h-5 rounded-full border border-neutral-700"
                      style={{ backgroundColor: c }}
                      title={`Set ${c}`}
                      aria-label={`Set foreground color to ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="qr-bg-color" className="text-xs text-neutral-400">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="qr-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-neutral-200"
                />
                <div className="flex gap-1">
                  {['#0a0a0a', '#171717', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgColor(c)}
                      className="w-5 h-5 rounded-full border border-neutral-700"
                      style={{ backgroundColor: c }}
                      title={`Set ${c}`}
                      aria-label={`Set background color to ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-800">
            {/* Error correction */}
            <div className="space-y-1">
              <label htmlFor="qr-error-level" className="text-xs text-neutral-400">Error Correction</label>
              <select
                id="qr-error-level"
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200"
              >
                <option value="L">Low (7% recovery)</option>
                <option value="M">Medium (15% recovery)</option>
                <option value="Q">Quartile (25% recovery)</option>
                <option value="H">High (30% recovery)</option>
              </select>
            </div>

            {/* Quiet Zone Margin */}
            <div className="space-y-1">
              <label htmlFor="qr-quiet-zone" className="text-xs text-neutral-400">Margin / Quiet Zone ({margin})</label>
              <input
                id="qr-quiet-zone"
                type="range"
                min={0}
                max={4}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Resolution */}
            <div className="space-y-1">
              <label htmlFor="qr-res-slider" className="text-xs text-neutral-400">Resolution ({size}px)</label>
              <input
                id="qr-res-slider"
                type="range"
                min={180}
                max={480}
                step={20}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview & Download Output Column */}
      <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="w-full flex items-center justify-between pb-4 border-b border-neutral-800 text-xs text-neutral-400">
          <span className="font-medium text-neutral-300">Live Render Canvas</span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 hover:text-neutral-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Canvas Display */}
        <div className="my-6 p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/60 shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded shadow-md"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Download Buttons */}
        <div className="w-full space-y-2 pt-4 border-t border-neutral-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          </div>
          <p className="text-[11px] text-center text-neutral-400">
            Rendered locally in your browser. Compatible with all iOS & Android cameras.
          </p>
        </div>
      </div>
    </div>
  );
};
