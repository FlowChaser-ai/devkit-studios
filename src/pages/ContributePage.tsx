import React from 'react';
import { ArrowLeft, GitPullRequest, Code, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CopyButton } from '../components/common/CopyButton';

interface ContributePageProps {
  onBack: () => void;
}

const CLONE_COMMAND = 'git clone https://github.com/your-username/devkit-studio.git\ncd devkit-studio\nnpm install\nnpm run dev';

export const ContributePage: React.FC<ContributePageProps> = ({ onBack }) => {
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
          <GitPullRequest className="w-4 h-4 text-indigo-400" />
          <span>Open-Source Contributor Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
          Contributing to DevKit Studio
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
          DevKit Studio is built for and maintained by the developer community. We welcome new browser-based tools, performance optimizations, accessibility improvements, and documentation enhancements.
        </p>
      </div>

      {/* Local Setup Section */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Quick Local Setup</span>
          </div>
          <CopyButton textToCopy={CLONE_COMMAND} label="Copy Commands" variant="secondary" />
        </div>

        <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-md font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed">
          <code>{CLONE_COMMAND}</code>
        </pre>
      </div>

      {/* How to Add a New Tool */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-100">
          How to Add a New Tool
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-mono text-xs">1</span>
              <span>Create Component in <code>src/components/tools/</code></span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Create a self-contained component (e.g. <code>MyNewTool.tsx</code>). It should accept a <code>notify: (msg: string, type?: &apos;success&apos; | &apos;error&apos; | &apos;info&apos;) =&gt; void</code> prop to trigger visual toast notifications.
            </p>
          </div>

          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-mono text-xs">2</span>
              <span>Register Tool in <code>src/data/tools.ts</code></span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Add a new entry to the <code>TOOLS</code> array with unique ID, name, shortName, category, Lucide icon name, and relevant search keywords.
            </p>
          </div>

          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-mono text-xs">3</span>
              <span>Wire into <code>src/pages/ToolViewPage.tsx</code></span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Import your component and add a case to <code>renderToolComponent()</code>, plus helpful usage notes and tips to <code>TOOL_DOCUMENTATION</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Guidelines & Rules */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Core Contribution Rules</span>
        </h3>

        <div className="space-y-3 text-xs text-neutral-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>100% Client-Side Only:</strong> Never include external API endpoints, paid services, or telemetry trackers. All data operations must run in the browser.</span>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>No Broken Affordances:</strong> Every button, switch, or tab must work; avoid mock placeholders or dead clicks.</span>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Accessibility Standards:</strong> Enforce WCAG AA color contrast, visible focus rings, and proper keyboard navigation support.</span>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Clean Code & Dependencies:</strong> Avoid large dependencies when a native browser API (e.g. Canvas, crypto, TextEncoder) handles the task natively.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
