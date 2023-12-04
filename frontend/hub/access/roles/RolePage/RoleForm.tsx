import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { Role } from '../Role';

export type RoleInput = Omit<Role, 'pulp_href' | 'pulp_created' | 'locked'>;

export function CreateRole() {}

export function EditRole() {}

export function RoleInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput name="name" label={t('Name')} placeholder={t('Enter name')} isRequired />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormSection title={t('Permissions')}></PageFormSection>
    </>
  );
}
