import { Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useViewOptions } from '../ViewOptionsProvider';

export function AddNodeButton(props: { variant?: 'primary' | 'secondary'; id?: string }) {
  const { setSidebarMode } = useViewOptions();
  const { t } = useTranslation();
  const id = props.id ?? 'add-node-button';
  return (
    <Button
      data-cy={id}
      data-testid={id}
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
