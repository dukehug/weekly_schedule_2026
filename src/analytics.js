const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const GA_ID_PATTERN = /^G-[A-Z0-9]+$/i;

export const initializeAnalytics = () => {
  if (!GA_ID_PATTERN.test(GA_MEASUREMENT_ID || '') || typeof window === 'undefined') {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
  });

  if (!document.querySelector(`script[data-ga-id="${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.dataset.gaId = GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  return true;
};

export const trackEvent = (name, parameters = {}) => {
  if (
    !GA_ID_PATTERN.test(GA_MEASUREMENT_ID || '')
    || typeof window === 'undefined'
    || typeof window.gtag !== 'function'
  ) {
    return;
  }

  window.gtag('event', name, parameters);
};
