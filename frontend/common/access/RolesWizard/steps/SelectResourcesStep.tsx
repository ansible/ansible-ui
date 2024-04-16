import { useTranslation } from 'react-i18next';
import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  TextCell,
  ToolbarFilterType,
} from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useMemo } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { Text, TextContent, TextVariants, Title } from '@patternfly/react-core';

export interface SelectRolesStepProp<T extends { name?: string }> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
}

const resourceTypeToNameMapping = {};
/** Roles wizard step for selecting resources based on the resourceType selected */
export function SelectRolesStep<T extends { name?: string }>(props: SelectRolesStepProps<T>) {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType } = wizardData as { [key: string]: unknown };
  const tableColumns = useMemo<ITableColumn<T>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (item: T) => item.name,
        sort: 'name',
      },
    ],
    [t]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__contains',
        comparison: 'contains',
      },
    ],
    [t]
  );

  return (
    <TextContent>
      <Title headingLevel="h1">{title}</Title>
      <Text component={TextVariants.h2}>
        {t(
          "Choose the resources that will be receiving new roles. You'll be able to select the roles to apply in the next step. Note that the resources chosen here will receive all roles chosen in the next step."
        )}
      </Text>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected roles')}
      />
    </TextContent>
  );
}
