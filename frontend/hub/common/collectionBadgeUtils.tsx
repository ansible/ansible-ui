import { LabelColor } from '@ansible/ansible-ui-framework';
import { ReactNode } from 'react';
import { isInsightsMode } from './isInsights';

const CERTIFIED_REPOS = isInsightsMode() ? new Set(['published']) : new Set(['rh-certified']);
const VALIDATED_REPO = 'validated';

export interface CollectionBadge {
  label: string;
  color: LabelColor;
  icon?: ReactNode;
  variant: 'filled' | 'outline';
}

export function CertifiedIcon() {
  return <i className="fas fa-certificate"></i>;
}

export function getCollectionBadge(
  repositoryName: string | undefined,
  t: (key: string) => string
): CollectionBadge {
  if (repositoryName && CERTIFIED_REPOS.has(repositoryName)) {
    return {
      label: t('Certified'),
      color: 'blue',
      icon: <CertifiedIcon />,
      variant: 'filled',
    };
  }

  if (repositoryName === VALIDATED_REPO) {
    return {
      label: t('Validated'),
      color: 'purple',
      variant: 'filled',
    };
  }

  return {
    label: repositoryName || '',
    color: 'grey',
    variant: 'filled',
  };
}
