import { useEffect, useState } from 'react';
import {
  renderWidget,
  usePlugin,
  useTracker,
  WidgetLocation,
} from '@remnote/plugin-sdk';

function encodeStrudelUrl(code: string): string {
  return `https://strudel.cc/#${btoa(unescape(encodeURIComponent(code)))}`;
}

function StrudelWidget() {
  const plugin = usePlugin();

  // ── Read the Rem text reactively ─────────────────────────────────
  const trackerResult = useTracker(async (reactivePlugin) => {
    const ctx =
      await reactivePlugin.widget.getWidgetContext<WidgetLocation.UnderRemEditor>();
    if (!ctx?.remId) return undefined;

    const rem = await reactivePlugin.rem.findOne(ctx.remId);
    if (!rem) return undefined;

    const text = await rem.text;
    if (!text) return undefined;

    return await reactivePlugin.richText.toString(text);
  });

  const code = (trackerResult ?? '').trim();

  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Auto-load on first non-empty code.
  useEffect(() => {
    if (code.length > 0 && loadedUrl === null) {
      setLoadedUrl(encodeStrudelUrl(code));
    }
  }, [code]);

  const hasDrift =
    code.length > 0 && loadedUrl !== null && encodeStrudelUrl(code) !== loadedUrl;

  const handleReload = () => {
    setLoadedUrl(encodeStrudelUrl(code));
    setIframeKey((k) => k + 1);
  };

  // ── Rem text is empty and we never loaded ────────────────────────
  if (code.length === 0 && loadedUrl === null) {
    return (
      <div
        style={{
          padding: '8px 12px',
          color: '#888',
          fontStyle: 'italic',
          fontSize: '13px',
        }}
      >
        Write some Strudel code in this Rem to hear it in the REPL.
      </div>
    );
  }

  if (loadedUrl === null) {
    return null;
  }

  // ── Render the Strudel REPL ──────────────────────────────────────
  return (
    <div
      style={{
        width: '100%',
        marginTop: '4px',
        marginBottom: '4px',
      }}
    >
      {hasDrift && (
        <button
          onClick={handleReload}
          style={{
            display: 'block',
            width: '100%',
            padding: '6px 12px',
            marginBottom: '4px',
            border: '1px solid var(--rn-clr-border, #ccc)',
            borderRadius: '4px',
            background: 'var(--rn-clr-background-accent, #4a90d9)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Reload REPL with updated code
        </button>
      )}
      <div
        style={{
          width: '100%',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid var(--rn-clr-border, #e0e0e0)',
        }}
      >
        <iframe
          key={iframeKey}
          src={loadedUrl}
          width="100%"
          height="300"
          style={{ border: 'none', display: 'block' }}
          allow="autoplay; microphone"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}

renderWidget(StrudelWidget);
