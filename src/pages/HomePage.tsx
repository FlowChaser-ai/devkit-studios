import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Layers,
  Minimize2,
  Users,
  X,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { TOOLS, CATEGORIES, AGE_GROUPS } from '../data/tools';
import { ToolCategory, ToolDefinition, AgeGroupId, PdfActionTab } from '../types';
import { IconRenderer } from '../components/common/IconRenderer';

interface HomePageProps {
  onSelectTool: (toolId: string, initialTab?: PdfActionTab) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
  recentToolIds: string[];
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
  recentToolIds,
  onOpenSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Age group selector state (strictly optional, zero personal info collected)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupId | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('devkit_saved_age_group');
        return (saved as AgeGroupId) || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [rememberAgeGroup, setRememberAgeGroup] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && !!localStorage.getItem('devkit_saved_age_group');
    } catch {
      return false;
    }
  });

  const handleSelectAgeGroup = (ageId: AgeGroupId) => {
    if (selectedAgeGroup === ageId) {
      // Toggle off
      setSelectedAgeGroup(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('devkit_saved_age_group');
      }
    } else {
      setSelectedAgeGroup(ageId);
      if (rememberAgeGroup && typeof window !== 'undefined') {
        localStorage.setItem('devkit_saved_age_group', ageId);
      }
    }
  };

  const handleClearAgeGroup = () => {
    setSelectedAgeGroup(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devkit_saved_age_group');
    }
  };

  const handleRememberToggle = (checked: boolean) => {
    setRememberAgeGroup(checked);
    if (typeof window !== 'undefined') {
      if (checked && selectedAgeGroup) {
        localStorage.setItem('devkit_saved_age_group', selectedAgeGroup);
      } else {
        localStorage.removeItem('devkit_saved_age_group');
      }
    }
  };

  const activeAgeDef = AGE_GROUPS.find((g) => g.id === selectedAgeGroup);

  // Filter tools based on search, category, and optional age group
  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesAge = !selectedAgeGroup || activeAgeDef?.recommendedToolIds.includes(tool.id);
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.shortName.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q));

    return matchesCategory && matchesAge && matchesQuery;
  });

  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-8 pb-2 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs text-indigo-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% In-Browser Privacy</span>
          <span aria-hidden="true">·</span>
          <span>Zero Server Uploads</span>
          <span aria-hidden="true">·</span>
          <span>Open-Source MIT</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 max-w-3xl mx-auto leading-tight">
          Everyday Developer Utilities, <br className="hidden sm:inline" />
          Crafted for Speed & Privacy.
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Create & merge PDFs, format JSON, compress images, generate QR codes, create color schemes, convert text cases, and encode payloads entirely within your local browser memory.
        </p>

        {/* Search Bar Input */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all tools by keyword (e.g. pdf, json, qr, base64, uuid)..."
              className="w-full pl-10 pr-24 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-neutral-400 hover:text-white px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-950 border border-neutral-700 rounded text-neutral-400">
                /
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRIORITY 1: FEATURED PDF STUDIO AT THE TOP               */}
      {/* ========================================================= */}
      <section className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-neutral-900 border border-indigo-500/30 shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                Featured Document Tool
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Client-Side
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-indigo-400" />
                <span>PDF Studio</span>
              </h2>
              <p className="text-xs sm:text-sm font-medium text-indigo-200/90 mt-1">
                Create, convert, merge, and manage PDFs — free and private.
              </p>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Compile formatted notes and essays into A4 PDFs, turn multiple photos into a multi-page document, combine separate PDF reports, or optimize file size right in your browser memory.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2">
              <div className="text-[11px] font-medium text-neutral-400 mb-2">
                Quick Actions:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTool('pdf-studio', 'text-to-pdf')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-indigo-500/50 rounded-lg text-xs font-medium transition-all group"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Text to PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTool('pdf-studio', 'images-to-pdf')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-indigo-500/50 rounded-lg text-xs font-medium transition-all group"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Images to PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTool('pdf-studio', 'merge-pdfs')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-indigo-500/50 rounded-lg text-xs font-medium transition-all group"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Merge PDFs</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTool('pdf-studio', 'compress-pdf')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-indigo-500/50 rounded-lg text-xs font-medium transition-all group"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Compress PDF</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTool('pdf-studio')}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <span>Open PDF Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRIORITY 2: AGE-CATEGORY SELECTOR                        */}
      {/* ========================================================= */}
      <section className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                <span>Find tools for your age group</span>
                <span className="text-[11px] font-normal text-neutral-400 font-mono">(Optional)</span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Pick a category to highlight helpful utilities for school, college, or daily developer tasks. No date of birth collected.
              </p>
            </div>
          </div>

          {selectedAgeGroup && (
            <button
              type="button"
              onClick={handleClearAgeGroup}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors shrink-0 self-start sm:self-center"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Age Group Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {AGE_GROUPS.map((group) => {
            const isSelected = selectedAgeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => handleSelectAgeGroup(group.id)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{group.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                  {group.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Age Group Guidance Banner */}
        {activeAgeDef && (
          <div className="p-3 bg-neutral-950 border border-indigo-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="text-neutral-200 font-medium">
                Showing {filteredTools.length} suggested tools for {activeAgeDef.label} ({activeAgeDef.badge})
              </div>
              <div className="text-neutral-400 text-[11px]">
                {activeAgeDef.guidance}
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={rememberAgeGroup}
                onChange={(e) => handleRememberToggle(e.target.checked)}
                className="rounded bg-neutral-900 border-neutral-700 text-indigo-600"
              />
              <span>Remember on this device</span>
            </label>
          </div>
        )}
      </section>

      {/* Category Filter Tabs */}
      <section className="flex flex-wrap items-center justify-center gap-1.5 border-b border-neutral-800/80 pb-5">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          All {TOOLS.length} Tools
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* Favorites Section (if any) */}
      {selectedCategory === 'all' && !searchQuery && !selectedAgeGroup && favoriteTools.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Favorite Bookmarks
            </h2>
            <span className="text-xs text-neutral-400">Saved to local browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteTools.map((tool) => (
              <div
                key={`fav-${tool.id}`}
                onClick={() => onSelectTool(tool.id)}
                className="group p-4 bg-neutral-900/90 border border-neutral-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all duration-150 flex items-start justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 shrink-0">
                    <IconRenderer name={tool.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-100 group-hover:text-indigo-300 transition-colors truncate">
                      {tool.shortName}
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(tool.id);
                  }}
                  className="text-amber-400 hover:text-amber-300 p-1 shrink-0"
                  title="Remove from favorites"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Tools Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>
            Showing <span className="font-mono tabular-nums text-neutral-200">{filteredTools.length}</span> tools
          </span>
          <div className="flex items-center gap-2">
            {selectedAgeGroup && (
              <span className="text-indigo-400 font-medium">Filtered by age: {activeAgeDef?.label}</span>
            )}
            {searchQuery && (
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);
            const categoryObj = CATEGORIES.find((c) => c.id === tool.category);

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`group relative p-5 bg-neutral-900 border rounded-xl cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-4 ${
                  tool.id === 'pdf-studio'
                    ? 'border-indigo-500/40 hover:border-indigo-400 shadow-sm'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Category metadata line (Zero-pill discipline) */}
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span>{categoryObj?.label || tool.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[11px]">Browser-side</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isFav
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Header: Icon + Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 shrink-0">
                      <IconRenderer name={tool.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-indigo-300 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 group-hover:text-neutral-300 font-medium flex items-center gap-1">
                    Open tool
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                    <span>{tool.keywords.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="pt-6 border-t border-neutral-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold text-neutral-200">Zero Server Uploads</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every PDF operation, JSON parse, string conversion, and image compression runs strictly within your browser. Sensitive documents and API payloads never touch a server.
            </p>
          </div>

          <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold text-neutral-200">Zero Latency Feedback</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Immediate client-side computation with instant copy-to-clipboard, error indicators, and high-performance canvas rendering.
            </p>
          </div>

          <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold text-neutral-200">Clean Open-Source Stack</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No bloated frameworks, no paid analytics, and no intrusive trackers. Free forever under the permissive MIT License.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
