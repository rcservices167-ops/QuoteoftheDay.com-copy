import { useEffect, useState, useRef } from 'react';

export function ExternalHeader() {
  const [headerHTML, setHeaderHTML] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHeader();
  }, []);

  useEffect(() => {
    if (headerHTML && headerRef.current) {
      attachEventListeners();
    }
  }, [headerHTML]);

  const loadHeader = async () => {
    try {
      setLoading(true);
      console.log('[ExternalHeader] Starting to load header...');

      const response = await fetch("https://allofday.com/header.html");

      console.log('[ExternalHeader] Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch header: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('[ExternalHeader] Fetched HTML length:', html.length);
      console.log('[ExternalHeader] First 200 chars:', html.substring(0, 200));

      const processed = processHTML(html);
      console.log('[ExternalHeader] Processed HTML length:', processed.length);

      localStorage.setItem('external-header-html', processed);
      localStorage.setItem('external-header-timestamp', Date.now().toString());

      setHeaderHTML(processed);
      console.log('[ExternalHeader] Header HTML set successfully');
    } catch (err) {
      console.error('[ExternalHeader] Error loading header:', err);
      const cached = localStorage.getItem('external-header-html');
      if (cached) {
        console.log('[ExternalHeader] Using cached version');
        setHeaderHTML(cached);
      } else {
        console.error('[ExternalHeader] No cached version available');
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
        .external-header-wrapper * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        @media (max-width: 768px) {
          .external-header-wrapper {
            padding: 0.25rem !important;
            overflow-x: auto !important;
          }
          .external-header-wrapper nav,
          .external-header-wrapper ul,
          .external-header-wrapper .menu {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 0.25rem !important;
            justify-content: flex-start !important;
            font-size: 0.75rem !important;
            overflow-x: auto !important;
          }
          .external-header-wrapper a {
            padding: 0.25rem 0.5rem !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
        }
      </style>
    `;

    return styles + '\n' + mobileResponsiveStyles + '\n' + processed;
  };

  const attachEventListeners = () => {
    if (!headerRef.current) return;

    const currentSite = window.location.hostname;
    const links = headerRef.current.querySelectorAll('a');

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.includes(currentSite)) {
        link.classList.add('active-site');
      }
    });
  };

  if (loading) {
    return (
      <div className="external-header-loading">
        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'white' }}>Loading header...</div>
        </div>
      </div>
    );
  }

  if (!headerHTML) {
    console.error('[ExternalHeader] No header HTML to display');
    return (
      <div className="external-header-error">
        <div style={{ padding: '1rem', background: '#dc2626', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>Failed to load header</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={headerRef}
      className="external-header-wrapper overflow-x-hidden"
      dangerouslySetInnerHTML={{ __html: headerHTML }}
      suppressHydrationWarning
      style={{
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    />
  );
}
