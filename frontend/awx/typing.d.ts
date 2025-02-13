/* eslint-disable no-restricted-exports */
declare module '*.ts?worker' {
  const Worker: new () => Worker;
  export default Worker;
}

declare module '*.svg?react' {
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
}
