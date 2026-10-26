import React, { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useFavorites } from './hooks/useFavorites';
import { useRecentTools } from './hooks/useRecentTools';
import { TOOLS } from './data/tools';
import { ToastMessage, PdfActionTab } from './types';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/Toast';
import { SearchModal } from './components/common/SearchModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ToolViewPage } from './pages/ToolViewPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContributePage } from './pages/ContributePage';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentTools, addRecent } = useRecentTools();

  // Navigation state: 'home' | 'about' | 'privacy' | 'contribute' | <tool.id>
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPdfTab, setSelectedPdfTab] = useState<PdfActionTab | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Toast system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectTool = (toolId: string, initialTab?: PdfActionTab) => {
    if (toolId === 'pdf-studio') {
      setSelectedPdfTab(initialTab || 'text-to-pdf');
    } else {
      setSelectedPdfTab(undefined);
    }
    setCurrentView(toolId);
    addRecent(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setSelectedPdfTab(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut listener for / and Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine current active tool if viewing a tool
  const activeTool = TOOLS.find((t) => t.id === currentView);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'home' && (
          <HomePage
            onSelectTool={handleSelectTool}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            recentToolIds={recentTools}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPage onBack={() => handleNavigate('home')} />
        )}

        {currentView === 'contribute' && (
          <ContributePage onBack={() => handleNavigate('home')} />
        )}

        {activeTool && (
          <ToolViewPage
            tool={activeTool}
            onBack={() => handleNavigate('home')}
            isFavorite={isFavorite(activeTool.id)}
            onToggleFavorite={toggleFavorite}
            notify={notify}
            initialPdfTab={selectedPdfTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Search Dialog Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
        favorites={favorites}
      />

      {/* Action Feedback Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
