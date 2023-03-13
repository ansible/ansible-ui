import { FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { EdaGroup } from '../../../interfaces/EdaGroup';
import { useSelectGroups } from '../hooks/useSelectGroups';

interface PageFormEdaGroupSelectProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  isRequired?: boolean;
  instanceGroupsPath?: Path<TFieldValues>;
  instanceGroupsIdPath?: Path<TFieldValues>;
}

export function PageFormGroupSelect<TFieldValues extends FieldValues = FieldValues>(
  props: PageFormEdaGroupSelectProps<TFieldValues>
) {
  const { t } = useTranslation();
  const selectGroups = useSelectGroups();
  return (
    <PageFormMultiInput<EdaGroup, TFieldValues>
      name={props.name}
      label={props.label || t('Groups')}
      selectTitle={t('Select groups')}
      selectOpen={selectGroups}
      validate={async (groups: EdaGroup[]) => {
        if (props.isRequired && groups.length === 0) {
          return t('Group is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
