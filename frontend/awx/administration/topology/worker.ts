import * as d3 from 'd3';
import { MeshNode } from './types';
export const SELECTOR = '#topology';

interface MeshLink extends d3.SimulationLinkDatum<MeshNode> {}

export type TopologyLayoutMessage = {
  data: {
    nodes: MeshNode[];
    links: MeshLink[];
    height: number;
    width: number;
  };
};

export function runTopologyLayout(
  message: TopologyLayoutMessage,
  postMessage: (payload: unknown) => void
) {
  const {
    data: { nodes, links, height, width },
  } = message;
  const simulation = d3
    .forceSimulation(nodes)
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('charge', d3.forceManyBody().strength(-50))
    .force(
      'link',
      d3.forceLink<MeshNode, MeshLink>(links).id((d) => d.hostname)
    )
    .force('collide', d3.forceCollide(62))
    .force('forceX', d3.forceX(0))
    .force('forceY', d3.forceY(0))
    .stop();

  for (
    let i = 0,
      n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
    i < n;
    ++i
  ) {
    postMessage({ type: 'tick', progress: i / n });
    simulation.tick();
  }
  postMessage({ type: 'end', nodes, links });
}

self.onmessage = function calculateLayout(message: TopologyLayoutMessage) {
  runTopologyLayout(message, (payload) => self.postMessage(payload));
};
