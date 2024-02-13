/* eslint-disable no-restricted-exports */
type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export { ReactComponent };
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module 'shell-escape-tag';

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    BRAND: string;
    PRODUCT: string;
    DISCLAIMER: string;
    VERSION: string;
    DELAY: string;
    UI_MODE?: 'AWX' | 'HUB' | 'EDA' | 'GALAXY';
    ROUTE_PREFIX: string;
    AWX_API_PREFIX: string;
    AWX_WEBSOCKET_PREFIX: string;
    HUB_API_PREFIX: string;
    EDA_API_PREFIX: string;
  }
}
