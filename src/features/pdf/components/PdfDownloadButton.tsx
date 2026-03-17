import React from 'react';

interface PdfDownloadButtonProps {
  onGenerate: () => Promise<void>;
  label?: string;
  loading?: boolean;
}

export function PdfDownloadButton({
  onGenerate,
  label = 'Download PDF',
  loading = false,
}: PdfDownloadButtonProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = loading || internalLoading;

  async function handleClick() {
    if (isLoading) return;
    setInternalLoading(true);
    try {
      await onGenerate();
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
      aria-label={isLoading ? 'Generating PDF…' : label}
    >
      {isLoading ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
          Generating…
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
