import { useEffect, useState } from 'react';
import { MultiSelectDialog, usePageDialogs } from '../../../../../../framework';
import { useAwxView } from '../../../../common/useAwxView';
import { Instance } from '../../../../interfaces/Instance';
import { useInstancesColumns } from '../../../instances/hooks/useInstancesColumns';
import { useInstancesFilters } from '../../../instances/hooks/useInstancesFilter';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useTranslation } from 'react-i18next';

export interface AssociateInstanceModalProps {
  instanceGroupId: string;
  onAssociate: (items: Instance[]) => void;
}

function AssociateInstanceModal(props: AssociateInstanceModalProps) {
  const { t } = useTranslation();
  const tableColumns = useInstancesColumns();
  const toolbarFilters = useInstancesFilters();
  const { instanceGroupId, onAssociate } = props;

  const view = useAwxView<Instance>({
    url: awxAPI`/instances/`,
    queryParams: { not__node_type: ['control', 'hop'], not__rampart_groups__id: instanceGroupId },
    toolbarFilters,
    tableColumns,
  });

  return (
    <MultiSelectDialog
      title={t('Select instances')}
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      onSelect={onAssociate}
    />
  );
}

export function useAssociateInstanceModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<AssociateInstanceModalProps>();

  useEffect(() => {
    if (props) {
      pushDialog(<AssociateInstanceModal {...props} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);

  return setProps;
}
