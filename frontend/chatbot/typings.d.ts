/* eslint-disable no-restricted-exports */
declare module '*.svg?react' {
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.css?inline' {
  const src: string;
  export default src;
}
