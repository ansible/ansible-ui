import {
  IPageActionSwitchSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { PageActionSwitch } from '@ansible/ansible-ui-framework/PageActions/PageActionSwitch';
import { useTranslation } from 'react-i18next';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { useInstanceActions } from '../hooks/useInstanceActions';

export function InstanceSwitch(props: { instance: Instance }) {
  const { t } = useTranslation();
  const { instance } = props;
  const { handleToggleInstance } = useInstanceActions(String(props.instance.id));
  const { activeAwxUser } = useAwxActiveUser();

  const action: IPageActionSwitchSingle<Instance> = {
    type: PageActionType.Switch,
    onToggle: () => {
      void handleToggleInstance(!instance?.enabled);
    },
    isSwitchOn: () => instance?.enabled,
    isDisabled: (_instance) =>
      !activeAwxUser?.is_superuser
        ? t('You do not have permissions to toggle this instance')
        : undefined,
    ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
    selection: PageActionSelection.Single,
    label: '',
  };

  return <PageActionSwitch action={action} selectedItem={instance} />;
}
