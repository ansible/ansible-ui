// DEBUG TOOLS
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateRandomLinks = (
  n: {
    id: number;
    hostname: string;
    node_type: string;
    node_state: string;
    enabled: boolean;
  }[],
  r: number
) => {
  const links = [];
  function getRandomLinkState() {
    return ['established', 'adding', 'removing'][getRandomInt(0, 2)];
  }
  for (let i = 0; i < r; i++) {
    const link = {
      source: n[getRandomInt(0, n.length - 1)].hostname,
      target: n[getRandomInt(0, n.length - 1)].hostname,
      link_state: getRandomLinkState(),
    };
    if (link.source !== link.target) {
      links.push(link);
    }
  }

  return { nodes: n, links };
};

export const generateRandomNodes = (n: number) => {
  const nodes = [];
  function getRandomType() {
    return ['hybrid', 'execution', 'control', 'hop'][getRandomInt(0, 3)];
  }
  function getRandomState() {
    return [
      'ready',
      'provisioning',
      'deprovisioning',
      'installed',
      'provision-fail',
      'deprovision-fail',
      'unavailable',
    ][getRandomInt(0, 6)];
  }
  for (let i = 0; i < n; i++) {
    const id = i + 1;
    const randomType = getRandomType();
    const randomState = getRandomState();
    const node = {
      id,
      hostname: `node-${id}`,
      node_type: randomType,
      node_state: randomState,
      enabled: Math.random() < 0.5,
    };
    nodes.push(node);
  }
  return generateRandomLinks(nodes, getRandomInt(1, n - 1));
};

export function computeForks(
  memCapacity: number,
  cpuCapacity: number,
  selectedCapacityAdjustment: number
) {
  const minCapacity = memCapacity;
  const maxCapacity = cpuCapacity;
  const percentage = selectedCapacityAdjustment * 100;

  return Math.round((maxCapacity - minCapacity) / 100) * percentage + minCapacity;
}
