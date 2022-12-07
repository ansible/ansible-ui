import { GitAltIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { pfWarning, TextCell } from '../../framework';

export function getScmType(scm_type: string): { text: string; icon: ReactNode } {
  switch (scm_type) {
    case 'git':
      return {
        text: 'Git',
        icon: <GitAltIcon color="#F1502F" />,
      };
    default:
      return {
        text: 'Unknown',
        icon: <QuestionCircleIcon color={pfWarning} />,
      };
  }
}

export function ScmType(props: { scmType: string }) {
  const scm = getScmType(props.scmType);
  return <TextCell icon={scm.icon} iconSize="md" text={scm.text} />;
}
