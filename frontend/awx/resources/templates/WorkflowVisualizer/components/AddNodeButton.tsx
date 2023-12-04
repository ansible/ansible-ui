import { Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { action, useVisualizationController } from '@patternfly/react-topology';
import { useTranslation } from 'react-i18next';

export function AddNodeButton(props: { variant?: 'primary' | 'secondary' }) {
  const controller = useVisualizationController();

  const { t } = useTranslation();
  return (
    <Button
      data-cy="add-node-button"
      icon={<PlusCircleIcon />}
      variant={props.variant || 'secondary'}
      label={t('Add node')}
      onClick={() => {
        action(() => {
          controller
            .getGraph()
            .setData({ ...controller?.getGraph()?.getData(), sideBarMode: 'add' });
        })();
      }}
    >
      {t('Add node')}
    </Button>
  );
}
