import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Plus, Trash2, RefreshCw, Compass, Sparkles } from 'lucide-react';

interface CssGradientGeneratorProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = 'linear' | 'radial' | 'conic';

const PRESETS = [
  {
    name: 'Midnight Slate',
    type: 'linear' as GradientType,
    angle: 135,
    stops: [
      { id: '1', color: '#0f172a', position: 0 },
      { id: '2', color: '#1e1b4b', position: 50 },
      { id: '3', color: '#312e81', position: 100 },
    ],
  },
  {
    name: 'Violet Nebula',
    type: 'linear' as GradientType,
    angle: 90,
    stops: [
      { id: '1', color: '#4f46e5', position: 0 },
      { id: '2', color: '#7c3aed', position: 50 },
      { id: '3', color: '#db2777', position: 100 },
    ],
  },
  {
    name: 'Emerald Glow',
    type: 'linear' as GradientType,
    angle: 45,
    stops: [
      { id: '1', color: '#064e3b', position: 0 },
      { id: '2', color: '#047857', position: 45 },
      { id: '3', color: '#10b981', position: 100 },
    ],
  },
  {
    name: 'Conic Prism',
    type: 'conic' as GradientType,
    angle: 0,
    stops: [
      { id: '1', color: '#6366f1', position: 0 },
      { id: '2', color: '#06b6d4', position: 33 },
      { id: '3', color: '#ec4899', position: 66 },
      { id: '4', color: '#6366f1', position: 100 },
    ],
  },
  {
    name: 'Cyber Horizon',
    type: 'radial' as GradientType,
    angle: 0,
    stops: [
      { id: '1', color: '#3b82f6', position: 0 },
      { id: '2', color: '#1d4ed8', position: 40 },
      { id: '3', color: '#0f172a', position: 100 },
    ],
  },
];

export const CssGradientGenerator: React.FC<CssGradientGeneratorProps> = ({ notify }) => {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState<number>(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: '1', color: '#4338ca', position: 0 },
    { id: '2', color: '#6366f1', position: 50 },
    { id: '3', color: '#a855f7', position: 100 },
  ]);

  const generateGradientCss = (): string => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');

    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    }
    if (type === 'radial') {
      return `radial-gradient(circle, ${stopsStr})`;
    }
    if (type === 'conic') {
      return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  };

  const gradientValue = generateGradientCss();
  const fullCssSnippet = `background: ${stops[0]?.color || '#4338ca'};\nbackground: ${gradientValue};`;

  const handleAddStop = () => {
    if (stops.length >= 8) {
      notify('Maximum 8 color stops allowed', 'info');
      return;
    }
    const newId = String(Date.now());
    const lastStop = stops[stops.length - 1];
    const prevPosition = lastStop ? Math.min(95, lastStop.position + 15) : 50;
    
    setStops([...stops, { id: newId, color: '#ec4899', position: prevPosition }]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 2) {
      notify('At least 2 color stops are required', 'info');
      return;
    }
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id: string, updates: Partial<ColorStop>) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setType(preset.type);
    setAngle(preset.angle);
    setStops(preset.stops);
    notify(`Applied preset: ${preset.name}`, 'info');
  };

  const handleReset = () => {
    setType('linear');
    setAngle(135);
    setStops([
      { id: '1', color: '#4338ca', position: 0 },
      { id: '2', color: '#6366f1', position: 50 },
      { id: '3', color: '#a855f7', position: 100 },
    ]);
    notify('Reset gradient to default', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Controls Column */}
      <div className="lg:col-span-7 space-y-5">
        {/* Type & Angle Selection */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Gradient Type */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-md">
              {(['linear', 'radial', 'conic'] as GradientType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                    type === t ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Angle Slider (for linear and conic) */}
          {type !== 'radial' && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  Angle Direction: <span className="font-mono text-neutral-100">{angle}°</span>
                </span>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                  {[0, 45, 90, 135, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setAngle(deg)}
                      className={`px-1.5 py-0.5 rounded ${angle === deg ? 'bg-indigo-600/40 text-indigo-300' : 'hover:text-white'}`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Color Stops List */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200">
              Color Stops ({stops.length}/8)
            </span>
            <button
              type="button"
              onClick={handleAddStop}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="flex items-center gap-3 p-2.5 bg-neutral-950 border border-neutral-800 rounded-md"
              >
                {/* Color input */}
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => handleUpdateStop(stop.id, { color: e.target.value })}
                  className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />

                {/* Color hex string */}
                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) => handleUpdateStop(stop.id, { color: e.target.value })}
                  className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-neutral-200 uppercase"
                />

                {/* Position slider */}
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => handleUpdateStop(stop.id, { position: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500"
                  />
                  <span className="w-10 text-right font-mono text-xs tabular-nums text-neutral-300">
                    {stop.position}%
                  </span>
                </div>

                {/* Remove stop button */}
                <button
                  type="button"
                  onClick={() => handleRemoveStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="p-1 text-neutral-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-neutral-400"
                  title="Remove color stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Presets */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2.5">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Curated Gradient Presets
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const bg =
                p.type === 'linear'
                  ? `linear-gradient(${p.angle}deg, ${p.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`
                  : p.type === 'radial'
                  ? `radial-gradient(circle, ${p.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`
                  : `conic-gradient(from ${p.angle}deg, ${p.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;

              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="flex items-center gap-2.5 p-2 bg-neutral-950 border border-neutral-800 rounded hover:border-neutral-700 text-left transition-colors group"
                >
                  <div
                    className="w-6 h-6 rounded-md border border-neutral-700 shadow-sm shrink-0"
                    style={{ background: bg }}
                  />
                  <span className="text-xs text-neutral-300 group-hover:text-white truncate">
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Preview & CSS Output Column */}
      <div className="lg:col-span-5 flex flex-col space-y-5">
        {/* Preview Container */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">Live Preview</span>
            <span className="font-mono text-[11px] capitalize">{type} gradient</span>
          </div>

          <div
            className="w-full h-64 rounded-xl border border-neutral-800 shadow-inner flex items-center justify-center p-6 text-center transition-all duration-300"
            style={{ background: gradientValue }}
          >
            <div className="bg-neutral-950/70 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/10 shadow-lg text-white">
              <span className="text-xs font-semibold tracking-wide">Dynamic UI Background</span>
            </div>
          </div>
        </div>

        {/* Copyable CSS */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200">Production CSS</span>
            <CopyButton
              textToCopy={fullCssSnippet}
              label="Copy CSS"
              variant="primary"
              onCopySuccess={() => notify('CSS gradient copied to clipboard', 'success')}
            />
          </div>

          <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-md font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
            <code>{fullCssSnippet}</code>
          </pre>

          <div className="text-[11px] text-neutral-400">
            Includes solid color fallback for legacy browser compatibility.
          </div>
        </div>
      </div>
    </div>
  );
};
