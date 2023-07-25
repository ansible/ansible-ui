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

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    BRAND: string;
    PRODUCT: string;
    DISCLAIMER: string;
    VERSION: string;
    DELAY: string;
    PWA: string;
    AWX: string;
    HUB: string;
    EDA: string;
    AWX_ROUTE_PREFIX: string;
    HUB_ROUTE_PREFIX: string;
    EDA_ROUTE_PREFIX: string;
    HUB_API_BASE_PATH: string;
  }
}
