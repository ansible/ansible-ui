/* eslint-disable no-restricted-exports */
declare module '*.svg?react' {
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
}

// Window interface extension for Insights/CRC mode
// Used by TokenInsights component to access Chrome auth APIs
interface Window {
  insights?: {
    chrome: {
      auth: {
        doOffline: () => void;
        getOfflineToken: () => Promise<{
          data: {
            access_token: string;
            expires_in: number;
            id_token: string;
            refresh_expires_in: number;
            refresh_token: string;
            scope: string;
            session_state: string;
            token_type: string;
          };
        }>;
      };
    };
  };
}
