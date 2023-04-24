import { FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { EdaRole } from '../../interfaces/EdaRole';
import { useSelectRoles } from './hooks/useSelectRoles';

interface PageFormEdaRolesSelectProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  isRequired?: boolean;
  instanceRolesPath?: Path<TFieldValues>;
  instanceRolesIdPath?: Path<TFieldValues>;
}

export function PageFormRolesSelect<TFieldValues extends FieldValues = FieldValues>(
  props: PageFormEdaRolesSelectProps<TFieldValues>
) {
  const { t } = useTranslation();
  const selectRoles = useSelectRoles();
  return (
    <PageFormMultiInput<EdaRole, TFieldValues>
      name={props.name}
      label={props.label || t('Roles')}
      selectTitle={t('Select roles')}
      selectOpen={selectRoles}
      validate={async (roles: EdaRole[]) => {
        if (props.isRequired && roles.length === 0) {
          return t('Role is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
