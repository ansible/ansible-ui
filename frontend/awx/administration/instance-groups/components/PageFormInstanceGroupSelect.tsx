import { ReactNode } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useSelectInstanceGroups } from '../hooks/useSelectInstanceGroups';

export function PageFormInstanceGroupSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  labelHelp: string;
  additionalControls?: ReactNode;
  isRequired?: boolean;
}) {
  const { t } = useTranslation();
  const selectInstanceGroup = useSelectInstanceGroups(true);

  return (
    <PageFormMultiInput<InstanceGroup>
      {...props}
      name={props.name}
      id="instance-group-select"
      placeholder={t('Add instance groups')}
      labelHelpTitle={t('Instance groups')}
      labelHelp={props.labelHelp}
      label={t('Instance Groups')}
      selectTitle={t('Select an instance group')}
      selectOpen={selectInstanceGroup}
      validate={(instanceGroups: InstanceGroup[]) => {
        if (props.isRequired && instanceGroups.length === 0) {
          return t('Instance group is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
