type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>

declare module '*.svg' {
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
    export { ReactComponent }
    export default content
}

declare module '*.png' {
    const content: string
    export default content
}
