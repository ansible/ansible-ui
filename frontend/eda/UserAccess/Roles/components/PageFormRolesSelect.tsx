import { ReactNode } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { useSelectRoles } from '../hooks/useSelectRoles';
import { EdaRole } from '../../../interfaces/EdaRole';

export function PageFormRolesSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  labelHelp: string;
  additionalControls?: ReactNode;
  isRequired?: boolean;
}) {
  const { t } = useTranslation();
  const selectRoles = useSelectRoles();

  return (
    <PageFormMultiInput<EdaRole, TFieldValues, TFieldName>
      {...props}
      name={props.name}
      placeholder={t('Select role(s)')}
      labelHelpTitle={t('Role(s)')}
      labelHelp={props.labelHelp}
      label={t('Role(s)')}
      selectTitle={t('Select role(s)')}
      selectOpen={selectRoles}
      validate={async (roles: EdaRole[]) => {
        if (props.isRequired && roles.length === 0) {
          return t('Roles are required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
