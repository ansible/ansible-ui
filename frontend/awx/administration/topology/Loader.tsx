import {
  EmptyState as PFEmptyState,
  Progress,
  ProgressMeasureLocation,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import styled from 'styled-components';

import { TopologyIcon as PFTopologyIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const EmptyState = styled(PFEmptyState)`
  --pf-v6-c-empty-state--m-lg--MaxWidth: none;
  min-height: 250px;
`;

const TopologyIcon = styled(PFTopologyIcon)`
  font-size: 3em;
  fill: #6a6e73;
`;

export const Loader = ({ className, progress }: { className: string; progress: number }) => {
  const { t } = useTranslation();

  return (
    <EmptyState variant="full" className={className} data-cy={className} data-testid={className}>
      <TopologyIcon />
      <Progress
        value={progress}
        measureLocation={ProgressMeasureLocation.inside}
        aria-label={t`content-loading-in-progress`}
        style={{ margin: '20px' }}
      />
      <Content style={{ margin: '20px' }}>
        <Content component={ContentVariants.small} style={{ fontWeight: 'bold', color: 'black' }}>
          {t`Please wait until the topology view is populated...`}
        </Content>
      </Content>
    </EmptyState>
  );
};
