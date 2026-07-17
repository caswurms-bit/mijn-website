import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, forceReload?: boolean) => void;
    };
  }
}

export default function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.Trustpilot && ref.current) {
      window.Trustpilot.loadFromElement(ref.current);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-US"
      data-template-id="56278e9abfbbba0bdcd568bc"
      data-businessunit-id="6a5a821a75d92bfc50f968bf"
      data-style-height="52px"
      data-style-width="100%"
      data-token="ba575ace-7de5-4403-a6bf-39b19fb6d25d"
    >
      <a href="https://www.trustpilot.com/review/easypici.nl" target="_blank" rel="noopener noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
