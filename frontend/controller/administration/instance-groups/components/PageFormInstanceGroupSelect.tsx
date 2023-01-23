import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectInstanceGroups } from '../hooks/useSelectInstanceGroups';

// TODO: needs to support multiple instance groups; drag to sort
export function PageFormInstanceGroupSelect(props: {
  name: string;
  label?: string;
  instanceGroupsPath?: string;
  instanceGroupsIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectInstanceGroups = useSelectInstanceGroups();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={props.label || t('Instance Groups')}
      placeholder="Enter instance group"
      selectTitle={t('Select an instance groups')}
      selectValue={(instanceGroup: InstanceGroup) => instanceGroup.name}
      selectOpen={selectInstanceGroups}
      validate={async (instanceGroupName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Inventory>>(
            `/api/v2/instance_groups/?name=${instanceGroupName}`
          );
          if (itemsResponse.results.length === 0) return t('Instance group not found.');
          if (props.instanceGroupsPath) {
            setValue(props.instanceGroupsPath, itemsResponse.results[0]);
          }
          if (props.instanceGroupsIdPath) {
            setValue(props.instanceGroupsIdPath, itemsResponse.results[0].id);
          }
        } catch (err) {
          if (err instanceof Error) return err.message;
          else return 'Unknown error';
        }
        return undefined;
      }}
      isRequired
    />
  );
}
