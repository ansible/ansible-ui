import { TOPOLOGY_AZURE, TOPOLOGY_OCP_A, TOPOLOGY_SAAS, TOPOLOGY_UNKNOWN } from './constants';

/**
 * Gets the AAP topology type from AAP_TOPOLOGY_TYPE environment variable.
 *
 * @returns The topology type: 'saas', 'ocp-a', 'man-b', or '' (unknown)
 *
 * @example
 * ```typescript
 * const topologyType = getTopologyType();
 * if (topologyType === TOPOLOGY_SAAS) {
 *   test.skip('Feature not available on SaaS');
 * }
 * ```
 */
export function getTopologyType(): string {
  const topologyType = process.env.AAP_TOPOLOGY_TYPE || '';
  const validTypes = [TOPOLOGY_SAAS, TOPOLOGY_OCP_A, TOPOLOGY_AZURE];
  return validTypes.includes(topologyType) ? topologyType : TOPOLOGY_UNKNOWN;
}

/**
 * Checks if the current topology is SaaS.
 *
 * @returns true if topology is 'saas', false otherwise
 */
export function isSaaS(): boolean {
  return getTopologyType() === TOPOLOGY_SAAS;
}

/**
 * Checks if the current topology is Azure (man-b).
 *
 * @returns true if topology is 'man-b', false otherwise
 */
export function isAzure(): boolean {
  return getTopologyType() === TOPOLOGY_AZURE;
}

/**
 * Checks if the current topology is OCP-A.
 *
 * @returns true if topology is 'ocp-a', false otherwise
 */
export function isOcpA(): boolean {
  return getTopologyType() === TOPOLOGY_OCP_A;
}

/**
 * Checks if the current topology is one of the specified types.
 *
 * @param types - Topology types to check against
 * @returns true if current topology matches any of the specified types
 *
 * @example
 * ```typescript
 * if (isTopology(TOPOLOGY_SAAS, TOPOLOGY_AZURE)) {
 *   test.skip('Not available on SaaS or Azure');
 * }
 * ```
 */
export function isTopology(...types: string[]): boolean {
  return types.includes(getTopologyType());
}
