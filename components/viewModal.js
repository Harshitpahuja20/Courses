  "use client";

  import { useEffect, useState, useCallback, useRef } from "react";

  export default function VideoModal({
    gdriveId,
    onClose,
    title = "Video",
    backLabel = "Back",
  }) {
    const [open, setOpen] = useState(false);
    const [frameLoaded, setFrameLoaded] = useState(false);
    const lastFocusRef = useRef(null);

    const doClose = useCallback(() => {
      setOpen(false);
      setTimeout(() => {
        onClose?.();
        if (lastFocusRef.current && typeof lastFocusRef.current.focus === "function") {
          lastFocusRef.current.focus();
        }
      }, 220);
    }, [onClose]);

    useEffect(() => {
      setOpen(true);
      lastFocusRef.current = document.activeElement;

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const disableContext = (e) => e.preventDefault();
      document.addEventListener("contextmenu", disableContext);

      const onKey = (e) => {
        if (e.key === "Escape") doClose();
        if ((e.altKey && e.key === "ArrowLeft") || e.key === "Backspace") doClose();
      };
      document.addEventListener("keydown", onKey);

      return () => {
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("contextmenu", disableContext);
        document.removeEventListener("keydown", onKey);
      };
    }, [doClose]);

    const onBackdropClick = (e) => {
      if (e.target === e.currentTarget) doClose();
    };

    const src = `https://drive.google.com/file/d/${gdriveId}/preview`;

    return (
      <>
        {/* Animations */}
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
          @keyframes riseIn {
            from { opacity: 0; transform: translateY(16px) scale(.98) }
            to   { opacity: 1; transform: translateY(0) scale(1) }
          }
          @keyframes riseOut {
            from { opacity: 1; transform: translateY(0) scale(1) }
            to   { opacity: 0; transform: translateY(10px) scale(.99) }
          }
          .modal-backdrop-enter { animation: fadeIn .18s ease-out both }
          .modal-backdrop-exit  { animation: fadeOut .18s ease-in both }
          .modal-panel-enter     { animation: riseIn .24s cubic-bezier(.22,1,.36,1) both }
          .modal-panel-exit      { animation: riseOut .20s ease-in both }
        `}</style>

        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} player`}
          className={`fixed inset-0 z-[70] ${open ? "modal-backdrop-enter" : "modal-backdrop-exit"} bg-black/75 backdrop-blur-sm`}
          onClick={onBackdropClick}
        >
          {/* Full-screen panel */}
          <div className={`fixed inset-0 z-[71] flex flex-col ${open ? "modal-panel-enter" : "modal-panel-exit"}`}>
            {/* Header */}
            <header className="h-14 shrink-0 flex items-center justify-between px-3 sm:px-4 bg-[var(--surface)] border-b border-token">
              <div className="flex items-center gap-2">
                <button
                  onClick={doClose}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-token text-foreground hover:bg-[var(--elev-2)]"
                  aria-label={backLabel}
                  autoFocus
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="font-semibold text-sm sm:text-base">{title}</span>
              </div>

              <button
                onClick={doClose}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-token text-foreground hover:bg-[var(--elev-2)]"
                aria-label="Close"
                title="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Player */}
            <div className="relative flex-1 bg-background">
              {!frameLoaded && (
                <div className="absolute inset-0 z-[72] grid place-items-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="4" fill="none" />
                      <path fill="var(--brand)" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                    </svg>
                    <p className="text-sm text-muted">Loading player…</p>
                  </div>
                </div>
              )}

              <iframe
                title={`${title} preview`}
                src={src}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="no-referrer"
                loading="lazy"
                onLoad={() => setFrameLoaded(true)}
              />
            </div>

            {/* Footer */}
            <footer className="h-12 shrink-0 flex items-center justify-between px-3 sm:px-4 bg-[var(--surface)] border-t border-token text-xs text-muted">
              <span>Tip: press <kbd className="px-1 py-0.5 rounded border border-token">Esc</kbd> to close</span>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted hover:opacity-90"
                style={{ color: "var(--brand)" }}
              >
                Open in Google Drive
              </a>
            </footer>
          </div>
        </div>
      </>
    );
  }
