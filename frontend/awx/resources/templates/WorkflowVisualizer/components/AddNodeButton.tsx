import { Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useViewOptions } from '../ViewOptionsProvider';

export function AddNodeButton(props: { variant?: 'primary' | 'secondary' }) {
  const { setSidebarMode } = useViewOptions();
  const { t } = useTranslation();
  return (
    <Button
      data-cy="add-node-button"
      icon={<PlusCircleIcon />}
      variant={props.variant || 'secondary'}
      label={t('Add step')}
      onClick={() => {
        setSidebarMode('add');
      }}
    >
      {t('Add step')}
    </Button>
  );
}
