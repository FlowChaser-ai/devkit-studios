import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../common/CopyButton';
import { RefreshCw, Lock, Unlock, Eye, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

interface ColorPaletteGeneratorProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

interface ColorSwatch {
  id: string;
  hex: string;
  locked: boolean;
}

// Convert HEX to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Convert HSL to HEX
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

// Calculate relative luminance for WCAG contrast
const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (hex: string, backgroundHex: string): number => {
  const rgb1 = hexToRgb(hex);
  const rgb2 = hexToRgb(backgroundHex);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
};

type HarmonyType = 'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'random';

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({ notify }) => {
  const [harmony, setHarmony] = useState<HarmonyType>('analogous');
  const [swatches, setSwatches] = useState<ColorSwatch[]>([
    { id: '1', hex: '#0F172A', locked: false },
    { id: '2', hex: '#3B82F6', locked: false },
    { id: '3', hex: '#6366F1', locked: false },
    { id: '4', hex: '#8B5CF6', locked: false },
    { id: '5', hex: '#EC4899', locked: false },
  ]);

  const generateHarmoniousPalette = useCallback((type: HarmonyType) => {
    // Generate base hue 0..360
    const baseHue = Math.floor(Math.random() * 360);
    const baseSat = Math.floor(Math.random() * 40) + 55; // 55..95%

    return swatches.map((swatch, idx) => {
      if (swatch.locked) return swatch;

      let h = baseHue;
      let s = baseSat;
      let l = 50;

      switch (type) {
        case 'analogous':
          h = (baseHue + (idx - 2) * 25 + 360) % 360;
          l = Math.min(85, Math.max(20, 25 + idx * 14));
          break;
        case 'monochromatic':
          h = baseHue;
          s = baseSat;
          l = Math.min(90, Math.max(15, 18 + idx * 16));
          break;
        case 'complementary':
          h = idx < 3 ? baseHue + (idx - 1) * 15 : (baseHue + 180 + (idx - 3) * 15) % 360;
          l = 25 + idx * 13;
          break;
        case 'triadic':
          const shift = idx === 0 ? 0 : idx === 1 ? 120 : idx === 2 ? 240 : idx === 3 ? 140 : 260;
          h = (baseHue + shift) % 360;
          l = 30 + (idx % 3) * 20;
          break;
        case 'random':
        default:
          h = Math.floor(Math.random() * 360);
          s = Math.floor(Math.random() * 50) + 40;
          l = Math.floor(Math.random() * 60) + 20;
          break;
      }

      return {
        ...swatch,
        hex: hslToHex(h, s, l),
      };
    });
  }, [swatches]);

  const handleGenerate = useCallback(() => {
    setSwatches((prev) => {
      const baseHue = Math.floor(Math.random() * 360);
      const baseSat = Math.floor(Math.random() * 40) + 55;

      return prev.map((swatch, idx) => {
        if (swatch.locked) return swatch;

        let h = baseHue;
        let s = baseSat;
        let l = 50;

        switch (harmony) {
          case 'analogous':
            h = (baseHue + (idx - 2) * 25 + 360) % 360;
            l = Math.min(85, Math.max(20, 25 + idx * 14));
            break;
          case 'monochromatic':
            h = baseHue;
            s = baseSat;
            l = Math.min(90, Math.max(15, 18 + idx * 16));
            break;
          case 'complementary':
            h = idx < 3 ? baseHue + (idx - 1) * 15 : (baseHue + 180 + (idx - 3) * 15) % 360;
            l = 25 + idx * 13;
            break;
          case 'triadic':
            const shift = idx === 0 ? 0 : idx === 1 ? 120 : idx === 2 ? 240 : idx === 3 ? 140 : 260;
            h = (baseHue + shift) % 360;
            l = 30 + (idx % 3) * 20;
            break;
          case 'random':
          default:
            h = Math.floor(Math.random() * 360);
            s = Math.floor(Math.random() * 50) + 40;
            l = Math.floor(Math.random() * 60) + 20;
            break;
        }

        return {
          ...swatch,
          hex: hslToHex(h, s, l),
        };
      });
    });
  }, [harmony]);

  // Spacebar triggers regeneration when in focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  const toggleLock = (id: string) => {
    setSwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
  };

  const updateColor = (id: string, newHex: string) => {
    setSwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hex: newHex.toUpperCase() } : s))
    );
  };

  const exportAsCss = () => {
    const css = `:root {\n${swatches
      .map((s, i) => `  --color-${i + 1}: ${s.hex};`)
      .join('\n')}\n}`;
    return css;
  };

  const exportAsTailwind = () => {
    const obj = swatches.reduce((acc, s, i) => {
      acc[`brand-${i + 1}`] = s.hex;
      return acc;
    }, {} as Record<string, string>);
    return JSON.stringify(obj, null, 2);
  };

  const exportAsJson = () => {
    return JSON.stringify(
      swatches.map((s) => s.hex),
      null,
      2
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate (Space)</span>
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1 hidden sm:block" />

          {/* Harmony Mode Selector */}
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Harmony:</span>
            <select
              value={harmony}
              onChange={(e) => setHarmony(e.target.value as HarmonyType)}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="analogous">Analogous</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="random">Random Harmonized</option>
            </select>
          </div>
        </div>

        {/* Quick Export Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 hidden sm:inline">Export:</span>
          <CopyButton
            textToCopy={exportAsCss()}
            label="CSS Vars"
            variant="secondary"
            onCopySuccess={() => notify('Copied CSS custom properties', 'success')}
          />
          <CopyButton
            textToCopy={exportAsTailwind()}
            label="Tailwind"
            variant="secondary"
            onCopySuccess={() => notify('Copied Tailwind colors JSON', 'success')}
          />
          <CopyButton
            textToCopy={exportAsJson()}
            label="HEX Array"
            variant="secondary"
            onCopySuccess={() => notify('Copied HEX color array', 'success')}
          />
        </div>
      </div>

      {/* Palette Swatches Display */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {swatches.map((swatch, idx) => {
          const rgb = hexToRgb(swatch.hex);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          const contrastWhite = getContrastRatio(swatch.hex, '#FFFFFF');
          const contrastBlack = getContrastRatio(swatch.hex, '#000000');
          const isLight = contrastBlack > contrastWhite;

          return (
            <div
              key={swatch.id}
              className="group relative flex flex-col rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 transition-all duration-150 hover:border-neutral-700"
            >
              {/* Color Block */}
              <div
                className="h-44 sm:h-56 w-full flex flex-col justify-between p-3 transition-colors relative"
                style={{ backgroundColor: swatch.hex }}
              >
                {/* Lock button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => toggleLock(swatch.id)}
                    aria-label={swatch.locked ? `Unlock swatch ${idx + 1}` : `Lock swatch ${idx + 1}`}
                    title={swatch.locked ? 'Click to unlock' : 'Click to lock'}
                    className={`p-1.5 rounded-md backdrop-blur-md transition-all ${
                      swatch.locked
                        ? 'bg-neutral-950/80 text-amber-400 border border-amber-400/30'
                        : 'bg-neutral-950/40 text-neutral-300 hover:text-white opacity-80 sm:opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {swatch.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Color Picker trigger */}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`color-picker-${swatch.id}`}
                    className={`cursor-pointer text-[11px] font-mono font-medium px-2 py-1 rounded backdrop-blur-md ${
                      isLight ? 'bg-black/20 text-neutral-900' : 'bg-white/20 text-white'
                    }`}
                  >
                    Pick
                  </label>
                  <input
                    id={`color-picker-${swatch.id}`}
                    type="color"
                    value={swatch.hex}
                    onChange={(e) => updateColor(swatch.id, e.target.value)}
                    className="sr-only"
                  />
                  <span
                    className={`text-[11px] font-mono ${
                      isLight ? 'text-neutral-900/80' : 'text-white/80'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </div>
              </div>

              {/* Data & Details Card */}
              <div className="p-3 space-y-2 bg-neutral-900">
                {/* HEX Row */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-neutral-100">
                    {swatch.hex}
                  </span>
                  <CopyButton
                    textToCopy={swatch.hex}
                    label="HEX"
                    variant="icon"
                    onCopySuccess={() => notify(`Copied ${swatch.hex}`, 'success')}
                  />
                </div>

                {/* RGB & HSL */}
                <div className="text-[11px] font-mono text-neutral-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">RGB:</span>
                    <span className="tabular-nums text-neutral-300">
                      {rgb.r}, {rgb.g}, {rgb.b}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">HSL:</span>
                    <span className="tabular-nums text-neutral-300">
                      {hsl.h}°, {hsl.s}%, {hsl.l}%
                    </span>
                  </div>
                </div>

                {/* WCAG Contrast check */}
                <div className="pt-2 border-t border-neutral-800 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>vs White</span>
                    <span className={`font-mono tabular-nums ${contrastWhite >= 4.5 ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {contrastWhite}:1 {contrastWhite >= 4.5 ? '✓ AA' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>vs Black</span>
                    <span className={`font-mono tabular-nums ${contrastBlack >= 4.5 ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {contrastBlack}:1 {contrastBlack >= 4.5 ? '✓ AA' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Usage Preview */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
        <div className="text-xs font-semibold text-neutral-200">Live Mockup Preview</div>
        <div
          className="p-6 rounded-lg transition-colors border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: swatches[0].hex }}
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4
              className="text-base font-semibold"
              style={{ color: swatches[4].hex }}
            >
              Headline Preview with Brand Palette
            </h4>
            <p
              className="text-xs max-w-md"
              style={{ color: swatches[2].hex }}
            >
              Test color legibility, text contrast ratios, and visual appeal before using them in code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded text-xs font-medium shadow"
              style={{
                backgroundColor: swatches[1].hex,
                color: getContrastRatio(swatches[1].hex, '#FFFFFF') > getContrastRatio(swatches[1].hex, '#000000') ? '#FFFFFF' : '#000000',
              }}
            >
              Primary Action
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded text-xs font-medium border"
              style={{
                borderColor: swatches[3].hex,
                color: swatches[3].hex,
                backgroundColor: 'transparent',
              }}
            >
              Secondary Outline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
