import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Trash2, Clock, Volume2, BookOpen, BarChart3, FileText } from 'lucide-react';

interface WordCounterProps {
  notify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

const SAMPLE_TEXT = `Software engineering is the systematic application of engineering approaches to the development of software. As software becomes increasingly vital to critical infrastructure, medicine, aviation, and commerce, developers must prioritize security, performance, accessibility, and documentation.

Open-source tooling empowers developers across the globe to build faster, review code transparently, and preserve user privacy without relying on opaque cloud vendors.`;

export const WordCounter: React.FC<WordCounterProps> = ({ notify }) => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);

  // Computations
  const stats = useMemo(() => {
    const raw = text;
    const trimmed = raw.trim();

    // Characters
    const charsWithSpaces = raw.length;
    const charsWithoutSpaces = raw.replace(/\s+/g, '').length;

    // Words
    const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = wordsArray.length;

    // Sentences
    const sentences = trimmed
      ? trimmed.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0)
      : [];
    const sentenceCount = sentences.length;

    // Paragraphs
    const paragraphs = trimmed
      ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
      : [];
    const paragraphCount = paragraphs.length;

    // Lines
    const lineCount = raw ? raw.split('\n').length : 0;

    // Average word length
    const totalWordLength = wordsArray.reduce((acc, w) => acc + w.replace(/[^a-zA-Z0-9]/g, '').length, 0);
    const avgWordLength = wordCount > 0 ? (totalWordLength / wordCount).toFixed(1) : '0';

    // Longest word
    let longestWord = '';
    wordsArray.forEach((w) => {
      const clean = w.replace(/[^a-zA-Z0-9-]/g, '');
      if (clean.length > longestWord.length) longestWord = clean;
    });

    // Reading & Speaking times
    // 200 words per minute average reading
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    const readingTimeSeconds = Math.round((wordCount / 200) * 60);

    // 130 words per minute average speech
    const speakingTimeMinutes = Math.ceil(wordCount / 130);
    const speakingTimeSeconds = Math.round((wordCount / 130) * 60);

    // Keyword density
    const stopWords = new Set([
      'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'for', 'it', 'as', 'was',
      'with', 'be', 'by', 'on', 'not', 'he', 'i', 'this', 'are', 'or', 'at', 'from',
      'an', 'your', 'all', 'we', 'can', 'has', 'have', 'more', 'without', 'must'
    ]);

    const freqMap: Record<string, number> = {};
    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / (wordCount || 1)) * 100).toFixed(1),
      }));

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      wordCount,
      sentenceCount,
      paragraphCount,
      lineCount,
      avgWordLength,
      longestWord,
      readingTimeMinutes,
      readingTimeSeconds,
      speakingTimeMinutes,
      speakingTimeSeconds,
      topKeywords,
    };
  }, [text]);

  const statsSummary = `Word Count: ${stats.wordCount}\nCharacters (with spaces): ${stats.charsWithSpaces}\nCharacters (no spaces): ${stats.charsWithoutSpaces}\nSentences: ${stats.sentenceCount}\nParagraphs: ${stats.paragraphCount}\nEst. Reading Time: ~${stats.readingTimeMinutes} min\nEst. Speaking Time: ~${stats.speakingTimeMinutes} min`;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-[11px] text-neutral-400">Words</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {stats.wordCount.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-[11px] text-neutral-400">Characters</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {stats.charsWithSpaces.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5 font-mono tabular-nums">
            {stats.charsWithoutSpaces} no spaces
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-[11px] text-neutral-400">Sentences</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {stats.sentenceCount.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-[11px] text-neutral-400">Paragraphs</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {stats.paragraphCount.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" />
            Reading Time
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {stats.readingTimeSeconds < 60
              ? `${stats.readingTimeSeconds}s`
              : `~${stats.readingTimeMinutes}m`}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">@ 200 WPM</div>
        </div>

        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-sky-400" />
            Speaking Time
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {stats.speakingTimeSeconds < 60
              ? `${stats.speakingTimeSeconds}s`
              : `~${stats.speakingTimeMinutes}m`}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">@ 130 WPM</div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Document Text
            </span>
            <span className="font-mono tabular-nums text-neutral-400">
              Avg length: {stats.avgWordLength} chars/word
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setText(SAMPLE_TEXT);
                notify('Sample document loaded', 'info');
              }}
              className="text-xs text-neutral-400 hover:text-indigo-400 px-1 py-0.5"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={() => {
                setText('');
                notify('Cleared text editor', 'info');
              }}
              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
              title="Clear text"
              aria-label="Clear document text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <CopyButton
              textToCopy={statsSummary}
              label="Copy Stats"
              variant="secondary"
              onCopySuccess={() => notify('Analytics summary copied to clipboard', 'success')}
            />
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste articles, essays, code comments, or copy to measure length..."
          rows={8}
          className="w-full p-4 bg-neutral-950 text-neutral-100 font-mono text-xs leading-relaxed focus:outline-none"
        />
      </div>

      {/* Keyword Frequency & Deep Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Keywords Density */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              Keyword Density (Excluding Stop Words)
            </span>
            <span className="text-neutral-400">Top 8 terms</span>
          </div>

          {stats.topKeywords.length > 0 ? (
            <div className="space-y-2">
              {stats.topKeywords.map((k) => (
                <div key={k.word} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-neutral-300 font-medium">{k.word}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, parseFloat(k.density) * 10)}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-neutral-400 w-16 text-right">
                      {k.count} ({k.density}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 py-4 text-center">
              Type or paste longer text to see keyword density distribution.
            </p>
          )}
        </div>

        {/* Structural Breakdown */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Lexical Characteristics
          </div>

          <div className="space-y-2.5 text-xs text-neutral-300">
            <div className="flex justify-between py-1 border-b border-neutral-800">
              <span className="text-neutral-400">Longest Word</span>
              <span className="font-mono text-indigo-300">{stats.longestWord || 'None'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800">
              <span className="text-neutral-400">Average Word Length</span>
              <span className="font-mono tabular-nums text-neutral-200">{stats.avgWordLength} characters</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800">
              <span className="text-neutral-400">Total Lines</span>
              <span className="font-mono tabular-nums text-neutral-200">{stats.lineCount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800">
              <span className="text-neutral-400">Estimated Reading Speed</span>
              <span className="text-neutral-400">Standard adult silent reading (~200 WPM)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
