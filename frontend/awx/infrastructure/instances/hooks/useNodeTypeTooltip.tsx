import { useTranslation } from 'react-i18next';

export function useNodeTypeTooltip() {
  const { t } = useTranslation();
  return {
    hybrid: t(
      'Hybrid is the default node type for control plane nodes, responsible for runtime functions like project updates, management jobs and ansible-runner task operations. Hybrid nodes are also used for automation execution.'
    ),
    control: t(
      'Control nodes run project and inventory updates and system jobs, but not regular jobs. Execution capabilities are disabled on these nodes.'
    ),
    execution: t(
      'Execution nodes run jobs under ansible-runner with podman isolation. This node type is similar to isolated nodes. This is the default node type for execution plane nodes.'
    ),
    hop: t(
      'Similar to a jump host, hop nodes will route traffic to other execution nodes. Hop nodes cannot execute automation.'
    ),
  };
}
