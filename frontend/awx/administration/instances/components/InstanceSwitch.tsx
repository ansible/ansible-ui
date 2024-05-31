import { Switch } from '@patternfly/react-core';
import { t } from 'i18next';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { useInstanceActions } from '../hooks/useInstanceActions';

export function InstanceSwitch(props: { instance: Instance }) {
  const { instance } = props;
  const { handleToggleInstance } = useInstanceActions(String(props.instance.id));
  const { activeAwxUser } = useAwxActiveUser();

  return (
    <Switch
      id="enable-instance"
      isDisabled={!activeAwxUser?.is_superuser}
      label={t('Enabled')}
      labelOff={t('Disabled')}
      isChecked={instance?.enabled}
      onChange={() => {
        void handleToggleInstance(!instance?.enabled);
      }}
    />
  );
}
