import {
  ComponentFactory,
  DefaultNode,
  GraphComponent,
  GraphElement,
  Model,
  ModelKind,
  useComponentFactory,
  useModel,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology'
import { ComponentType, useMemo } from 'react'
import useSWR from 'swr'
import { swrOptions, useFetcher } from '../../../Data'
import { DefaultEdge } from './Edge'

export default function Topology() {
  return (
    <VisualizationProvider>
      <TopologyInternal />
      <VisualizationSurface />
    </VisualizationProvider>
  )
}

function TopologyInternal() {
  const fetcher = useFetcher()
  const { data } = useSWR<{
    nodes: {
      id: number
      hostname: string
      node_state: 'healthy'
      node_type: 'hybrid'
    }[]
    links: {
      source: string
      target: string
    }[]
  }>(`/api/v2/mesh_visualizer/`, fetcher, swrOptions)

  useComponentFactory(defaultComponentFactory)
  const model = useMemo<Model>(
    () => ({
      graph: {
        // layout: 'Force',
        id: 'g1',
        type: 'graph',
      },
      nodes: data?.nodes.map((node, index) => ({
        id: node.hostname,
        type: 'node',
        x: index * 100 + 50,
        y: 50,
        width: 20,
        height: 20,
        label: node.hostname,
      })),
      edges: data?.links.map((link, index) => ({
        id: index.toString(),
        type: 'edge',
        source: link.source,
        target: link.target,
        bendpoints: [
          [80, 30],
          [110, 10],
        ],
      })),
    }),
    [data?.links, data?.nodes]
  )
  // const model2 = useMemo<Model>(
  //   () => ({
  //     graph: {
  //       // layout: 'Force',
  //       id: 'g1',
  //       type: 'graph',
  //     },
  //     nodes: new Array(600).fill(0).map((_, index) => ({
  //       id: index.toString(),
  //       type: 'node',
  //       x: Math.floor(index % 16) * 60 + 50,
  //       y: Math.floor(index / 16) * 60 + 50,
  //       width: 20,
  //       height: 20,
  //       label: 'test',
  //     })),
  //   }),
  //   []
  // )
  useModel(model)
  return null
}

const defaultComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string
): ComponentType<{ element: GraphElement }> => {
  switch (type) {
    default:
      switch (kind) {
        case ModelKind.graph:
          return GraphComponent as unknown as ComponentType<{ element: GraphElement }>
        case ModelKind.node:
          return DefaultNode as unknown as ComponentType<{ element: GraphElement }>
        case ModelKind.edge:
          return DefaultEdge as unknown as ComponentType<{ element: GraphElement }>
        default:
          return undefined as unknown as ComponentType<{ element: GraphElement }>
      }
  }
}
