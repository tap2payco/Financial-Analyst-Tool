import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const WIDGET_ROOT_ID = 'numbers-consulting-widget-root';

function injectTailwind() {
    if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
}

function mountWidget() {
  // Check if root already exists
  if (document.getElementById(WIDGET_ROOT_ID)) {
    return;
  }

  // Inject styles
  injectTailwind();

  // Create root element
  const rootElement = document.createElement('div');
  rootElement.id = WIDGET_ROOT_ID;
  document.body.appendChild(rootElement);

  // Mount React app
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
}

// Auto-mount when script loads
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountWidget();
} else {
  window.addEventListener('DOMContentLoaded', mountWidget);
}

// Expose mount function globally just in case
(window as any).NumbersConsultingWidget = {
  mount: mountWidget,
};
