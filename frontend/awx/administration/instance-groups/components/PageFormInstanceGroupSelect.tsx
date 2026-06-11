import { ReactNode } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { PageFormMultiSelectAwxResource } from '../../../common/PageFormMultiSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { useInstanceGroupsColumns } from '../hooks/useInstanceGroupColumns';
import { useInstanceGroupsFilters } from '../InstanceGroups';

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
  const tableColumns = useInstanceGroupsColumns();
  const filters = useInstanceGroupsFilters();
  return (
    <PageFormMultiSelectAwxResource<InstanceGroup>
      {...props}
      name={props.name}
      tableColumns={tableColumns}
      toolbarFilters={filters}
      queryPlaceholder={t('Loading instance groups...')}
      queryErrorText={t('Error loading instance groups')}
      url={awxAPI`/instance_groups/`}
      id="instance-group-select"
      placeholder={t('Select instance groups')}
      labelHelp={props.labelHelp}
      label={t('Instance groups')}
      isRequired={props.isRequired}
      compareOptionValues={(originalIG: InstanceGroup, selectedIG: InstanceGroup) =>
        originalIG.id === selectedIG.id
      }
    />
  );
}
