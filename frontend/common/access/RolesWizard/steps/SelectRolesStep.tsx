import { useFormContext } from 'react-hook-form';
import { ISelected, ITableColumn, IToolbarFilter, IView } from '../../../../../framework';
import { useEffect } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface SelectRolesStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
}

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

/*
 * Deprecated
 * use useMultiSelectListView hook instead of this component
 */
export function SelectRolesStep<T extends object>(props: SelectRolesStepProps<T>) {
  const { setValue } = useFormContext();
  const { t } = useTranslation();

  useEffect(() => {
    setValue('roles', props.view.selectedItems);
  }, [setValue, props.view.selectedItems]);

  return (
    <>
      <StyledTitle headingLevel="h1">{t('Select roles to apply')}</StyledTitle>
      <PageMultiSelectList
        view={props.view}
        tableColumns={props.tableColumns}
        toolbarFilters={props.toolbarFilters}
        labelForSelectedItems={t('Selected roles')}
      />
    </>
  );
}
