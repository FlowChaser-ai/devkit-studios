import React from 'react';
import { ArrowLeft, Terminal, Shield, Zap, Code2, Globe } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs text-indigo-400 font-medium">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>About DevKit Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
          Open-Source Developer Utilities Designed for Speed, Privacy, and Focus.
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
          Most online developer tools are littered with banner ads, paywalled limits, bloated analytics trackers, or worse — they send your private tokens and API payloads to remote cloud servers.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-neutral-200">100% In-Browser Privacy</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All text formatting, decoding, and image compression runs directly inside your local browser runtime. Zero external network requests.
          </p>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-neutral-200">Sub-Millisecond Speed</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Instantaneous feedback without waiting for server round-trips. Keyboard-first shortcuts enable rapid, fluid iteration.
          </p>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-neutral-200">MIT Open Source</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Fully open-source and free forever. Anyone can audit the source code, fork the repository, or contribute additional tools.
          </p>
        </div>
      </div>

      {/* Technology Architecture */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
        <h2 className="text-sm font-semibold text-neutral-200">
          Architecture & Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-300">
          <div className="space-y-1">
            <div className="font-medium text-neutral-200">React 19 & TypeScript</div>
            <p className="text-neutral-400">
              Modern functional components, strictly typed data structures, and zero runtime surprises.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-neutral-200">Tailwind CSS v4</div>
            <p className="text-neutral-400">
              High-performance utility styling without external bloated CSS frameworks.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-neutral-200">Browser Canvas Engine</div>
            <p className="text-neutral-400">
              Hardware-accelerated image scaling and QR code rasterization using native HTML5 Canvas APIs.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-neutral-200">Web Cryptography API</div>
            <p className="text-neutral-400">
              Standard-compliant RFC 4122 v4 pseudorandom UUID generation via crypto.randomUUID().
            </p>
          </div>
        </div>
      </div>

      {/* Call to action links */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition-colors"
        >
          Read Privacy Policy
        </button>
        <button
          type="button"
          onClick={() => onNavigate('contribute')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
        >
          Contribution Guide
        </button>
      </div>
    </div>
  );
};
