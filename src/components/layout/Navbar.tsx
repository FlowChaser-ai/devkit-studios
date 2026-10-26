import React from 'react';
import { Sun, Moon, Search, Menu, X, Terminal } from 'lucide-react';
import { ThemeMode } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenSearch,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/85 backdrop-blur-md">
      {/* Top Bar 3-Zone Contract: Brand — 4-5 single line text links — 1 action zone */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single element Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-neutral-100 hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <span>DevKit Studio</span>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'home' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            All Tools
          </button>
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'about' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            About
          </button>
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'privacy' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Privacy Guarantee
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contribute')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentView === 'contribute' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Contribute
          </button>
        </nav>

        {/* Zone 3: Quick Action Zone (Search + Theme Toggle + Mobile Menu) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-md text-xs font-medium transition-colors"
            title="Search tools (Press / or Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400">Search tools...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-950 border border-neutral-700 rounded text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 rounded-md transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md"
            aria-label="Search tools"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile Navigation Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          <button
            type="button"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 px-3 rounded text-sm text-neutral-200 hover:bg-neutral-900"
          >
            All Developer Tools
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('about');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 px-3 rounded text-sm text-neutral-200 hover:bg-neutral-900"
          >
            About DevKit Studio
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('privacy');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 px-3 rounded text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Privacy Guarantee (100% Client-Side)
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('contribute');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 px-3 rounded text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Contribute & Open-Source
          </button>
        </div>
      )}
    </header>
  );
};
