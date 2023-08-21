declare global {
    interface Window {
      gtag: (event: string, action: string, options: object) => void;
    }
  }
  
export const GA_TRACKING_ID = 'G-G1E9K73QPR';

export const pageview = (url: string) => {
    window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
};

export const event = ({
    action,
    category,
    label,
    value,
}: {
    action: string;
    category: string;
    label: string;
    value: string | number;
}): void => {
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};