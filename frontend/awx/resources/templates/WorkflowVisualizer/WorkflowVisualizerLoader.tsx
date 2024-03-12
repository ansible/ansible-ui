import { Bullseye, EmptyState, EmptyStateHeader, Icon, Spinner } from '@patternfly/react-core';
import { ShareAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { getPatternflyColor } from '../../../../../framework';

export function WorkflowVisualizerLoader() {
  const { t } = useTranslation();
  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateHeader
          titleText={t('Please wait until the Workflow Visualizer is populated.')}
          headingLevel="h4"
          icon={
            <Icon
              size="xl"
              style={{
                paddingBottom: '40px',
                color: getPatternflyColor('grey'),
              }}
            >
              <ShareAltIcon />
            </Icon>
          }
        >
          <Spinner />
        </EmptyStateHeader>
      </EmptyState>
    </Bullseye>
  );
}
