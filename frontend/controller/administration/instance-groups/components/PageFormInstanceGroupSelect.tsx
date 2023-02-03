import { FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useSelectInstanceGroups } from '../hooks/useSelectInstanceGroups';

interface PageFormInstanceGroupSelectProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  isRequired?: boolean;
  instanceGroupsPath?: Path<TFieldValues>;
  instanceGroupsIdPath?: Path<TFieldValues>;
}

// TODO: add drag and drop sorting
export function PageFormInstanceGroupSelect<TFieldValues extends FieldValues = FieldValues>(
  props: PageFormInstanceGroupSelectProps<TFieldValues>
) {
  const { t } = useTranslation();
  const selectInstanceGroups = useSelectInstanceGroups();
  return (
    <PageFormMultiInput<InstanceGroup, TFieldValues>
      name={props.name}
      label={props.label || t('Instance Groups')}
      selectTitle={t('Select an instance groups')}
      selectOpen={selectInstanceGroups}
      validate={async (instanceGroups: InstanceGroup[]) => {
        if (props.isRequired && instanceGroups.length === 0) {
          return t('Instance group is required.');
        }
        return undefined;
      }}
      isRequired
    />
  );
}
