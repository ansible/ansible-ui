import { ReactNode } from 'react';
import { TextCell } from '../../framework';

export function getScmType(scm_type: string | null | undefined): {
  text: string;
  icon?: ReactNode;
} {
  switch (scm_type) {
    case 'git':
      return {
        text: 'Git',
      };
    case 'svn':
      return {
        text: 'Svn',
      };
    case '':
      return {
        text: 'Manual',
      };
    case 'insights':
      return {
        text: 'Insights',
      };
    case 'archive':
      return {
        text: 'Remote archive',
      };
    default:
      return {
        text: 'Unknown',
      };
  }
}

export function ScmType(props: { scmType: string | null | undefined }) {
  const scm = getScmType(props.scmType);
  return <TextCell icon={scm.icon} iconSize="md" text={scm.text} />;
}
