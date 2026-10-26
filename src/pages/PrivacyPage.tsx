import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, HardDrive, CheckCircle2 } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
        <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-Telemetry Privacy Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
          Your Data Never Leaves Your Device.
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
          DevKit Studio is architected so that all computations, transformations, and asset compressions run entirely in client-side JavaScript. We have no analytics servers, no user accounts, and no data collection.
        </p>
      </div>

      {/* Privacy Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Zero Remote Server Uploads</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            When you format a JSON string, encode a Base64 string, or compress an image, that payload is handled exclusively in your local machine&apos;s volatile RAM. It is never transmitted across the network.
          </p>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>No Trackers or Analytics</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            There are zero third-party tracking scripts, zero cookie banners, zero marketing pixels, and zero fingerprinting beacons embedded in DevKit Studio.
          </p>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Local Storage Transparency</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We use your browser&apos;s standard <code>window.localStorage</code> solely to remember your theme preference (dark/light), your starred favorites list, and recent tool history. You can wipe this anytime by clearing your browser cache.
          </p>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verifiable Source Code</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Because DevKit Studio is published under the open-source MIT License, you can inspect every line of source code yourself in GitHub or run it on a completely air-gapped machine.
          </p>
        </div>
      </div>

      {/* Local Storage Itemization Table */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
        <h3 className="text-xs font-semibold text-neutral-200">
          Browser Storage Itemization
        </h3>
        <div className="border border-neutral-800 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 font-mono">
              <tr>
                <th className="py-2 px-3">Storage Key</th>
                <th className="py-2 px-3">Purpose</th>
                <th className="py-2 px-3">Data Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              <tr>
                <td className="p-3 font-mono text-indigo-300">devkit_theme</td>
                <td className="p-3">Remembers your dark or light display mode</td>
                <td className="p-3 font-mono text-neutral-400">&quot;dark&quot; | &quot;light&quot;</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-indigo-300">devkit_favorites</td>
                <td className="p-3">Stores your bookmarked tool IDs for quick access</td>
                <td className="p-3 font-mono text-neutral-400">Array of tool IDs</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-indigo-300">devkit_recents</td>
                <td className="p-3">Keeps list of your last 6 used tools in the sidebar</td>
                <td className="p-3 font-mono text-neutral-400">Array of tool IDs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
