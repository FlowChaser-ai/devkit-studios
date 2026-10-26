import React from 'react';
import { Terminal, ShieldCheck, Heart, Github } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-neutral-800/80 bg-neutral-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-100">
              <div className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span>DevKit Studio</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Free, private, and open-source suite of everyday developer tools.
              Every operation runs locally inside your browser memory with zero tracking and zero server uploads.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Processing</span>
              <span aria-hidden="true">·</span>
              <span>Zero Analytics</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-neutral-200">Toolkit Pages</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-neutral-200 transition-colors"
                >
                  All 10 Developer Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-neutral-200 transition-colors"
                >
                  About the Project
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-neutral-200 transition-colors"
                >
                  Privacy Guarantee
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contribute')}
                  className="hover:text-neutral-200 transition-colors"
                >
                  Contribution Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Open-Source info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-neutral-200">Open-Source</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              DevKit Studio is published under the permissive MIT License. Free for developers, students, and teams worldwide.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-mono text-neutral-400">
                React 19 · TypeScript · Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} DevKit Studio. Released under the MIT License.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="hover:text-neutral-200"
            >
              Privacy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('contribute')}
              className="hover:text-neutral-200"
            >
              Open Source
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-neutral-200"
            >
              Architecture
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
