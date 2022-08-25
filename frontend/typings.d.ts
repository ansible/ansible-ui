declare module '*.png'

type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>

declare module '*.svg' {
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
    const content: string

    export { ReactComponent }
    export default content
}
