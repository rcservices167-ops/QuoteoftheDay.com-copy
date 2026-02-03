import { useEffect, useState, useRef } from 'react';

export function ExternalFooter() {
  const [footerHTML, setFooterHTML] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    try {
      setLoading(true);
      console.log('[ExternalFooter] Starting to load footer...');

      const response = await fetch("https://allofday.com/footer.html");

      console.log('[ExternalFooter] Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch footer: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('[ExternalFooter] Fetched HTML length:', html.length);
      console.log('[ExternalFooter] First 200 chars:', html.substring(0, 200));

      const processed = processHTML(html);
      console.log('[ExternalFooter] Processed HTML length:', processed.length);

      localStorage.setItem('external-footer-html', processed);
      localStorage.setItem('external-footer-timestamp', Date.now().toString());

      setFooterHTML(processed);
      console.log('[ExternalFooter] Footer HTML set successfully');
    } catch (err) {
      console.error('[ExternalFooter] Error loading footer:', err);
      const cached = localStorage.getItem('external-footer-html');
      if (cached) {
        console.log('[ExternalFooter] Using cached version');
        setFooterHTML(cached);
      } else {
        console.error('[ExternalFooter] No cached version available');
      }
    } finally {
      setLoading(false);
    }
  };

  const processHTML = (html: string): string => {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    const styles = styleMatch ? styleMatch.join('\n') : '';

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;

    const processed = bodyContent.replace(
      /(href|src)="([^"]+)"/g,
      (match, attr, path) => {
        if (!path.startsWith('http') && !path.startsWith('//') && !path.startsWith('#')) {
          const cleanPath = path.startsWith('/') ? path.substring(1) : path;
          return `${attr}="https://AllofDay.com/${cleanPath}"`;
        }
        return match;
      }
    );

    const mobileResponsiveStyles = `
      <style>
        .external-footer-wrapper * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        @media (max-width: 768px) {
          .external-footer-wrapper {
            padding: 1rem !important;
          }
          .external-footer-wrapper nav,
          .external-footer-wrapper ul,
          .external-footer-wrapper .footer-links,
          .external-footer-wrapper .menu {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
            width: 100% !important;
          }
          .external-footer-wrapper li,
          .external-footer-wrapper a {
            width: 100% !important;
            text-align: center !important;
            padding: 0.5rem !important;
            font-size: 0.875rem !important;
          }
        }
      </style>
    `;

    return styles + '\n' + mobileResponsiveStyles + '\n' + processed;
  };

  if (loading) {
    return (
      <div className="external-footer-loading">
        <div style={{ padding: '2rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', color: '#6b7280' }}>
            Loading footer...
          </div>
        </div>
      </div>
    );
  }

  if (!footerHTML) {
    console.error('[ExternalFooter] No footer HTML to display');
    return (
      <div className="external-footer-error">
        <div style={{ padding: '2rem', background: '#dc2626', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>Failed to load footer</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={footerRef}
      className="external-footer-wrapper overflow-x-hidden"
      dangerouslySetInnerHTML={{ __html: footerHTML }}
      suppressHydrationWarning
      style={{
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    />
  );
}
