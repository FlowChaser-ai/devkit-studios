import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
  onCopySuccess?: (msg?: string) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  disabled?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  className = '',
  onCopySuccess,
  variant = 'secondary',
  disabled = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!textToCopy || disabled) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      onCopySuccess?.(label ? `${label} copied to clipboard` : 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 text-xs rounded-md';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        disabled={disabled || !textToCopy}
        title={copied ? 'Copied!' : label}
        aria-label={copied ? 'Copied to clipboard' : label}
        className={`${baseStyles} p-2 ${
          copied
            ? 'text-emerald-500 bg-emerald-500/10'
            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
        } ${className}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  const variantStyles = {
    primary: copied
      ? 'bg-emerald-600 text-white'
      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
    secondary: copied
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
      : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 border border-neutral-700/60',
    ghost: copied
      ? 'text-emerald-400 bg-emerald-500/10'
      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !textToCopy}
      aria-label={copied ? 'Copied' : label}
      className={`${baseStyles} px-3 py-1.5 gap-1.5 ${variantStyles} ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
};
