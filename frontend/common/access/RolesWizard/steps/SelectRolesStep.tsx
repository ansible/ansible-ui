import { ISelected, ITableColumn, IToolbarFilter, IView, TextCell } from '../../../../../framework';
import { useMemo } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { Label, LabelGroup, Split, SplitItem, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';

interface SelectRolesStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
}

interface SelectRolesStepHeaderProps<
  K extends { name: string; username?: never } | { name?: never; username: string },
> {
  selectedItemsFromPreviousStep?: K[];
  labelForSelectedItemsFromPreviousStep?: string;
  descriptionForRoleSelection?: string;
}

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function SelectRolesStep<T extends object>(props: SelectRolesStepProps<T>) {
  const { t } = useTranslation();
  const {
    view,
    tableColumns,
    toolbarFilters,
    fieldNameForPreviousStep,
    descriptionForRoleSelection,
  } = props;
  const { wizardData } = usePageWizard();

  const selectedItemsFromPreviousStep = useMemo(() => {
    if (wizardData && fieldNameForPreviousStep) {
      return (wizardData as { [key: string]: [] })[fieldNameForPreviousStep];
    }
    return undefined;
  }, [fieldNameForPreviousStep, wizardData]);

  const labelForSelectedItemsFromPreviousStep = useMemo(() => {
    if (selectedItemsFromPreviousStep?.length && fieldNameForPreviousStep) {
      switch (fieldNameForPreviousStep) {
        case 'users':
          return t('Selected users');
        case 'teams':
          return t('Selected teams');
        // TODO: Add additional resource types
        default:
          return undefined;
      }
    }
    return undefined;
  }, [fieldNameForPreviousStep, selectedItemsFromPreviousStep?.length, t]);

  return (
    <>
      <SelectRolesStepHeader
        selectedItemsFromPreviousStep={selectedItemsFromPreviousStep}
        labelForSelectedItemsFromPreviousStep={labelForSelectedItemsFromPreviousStep}
        descriptionForRoleSelection={descriptionForRoleSelection}
      ></SelectRolesStepHeader>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected roles')}
      />
    </>
  );
}
/**
 * Header for selection of roles: Shows title, description and optional labels for
 * users/teams/resources selected from the previous step
 */
function SelectRolesStepHeader<
  K extends { name: string; username?: never } | { name?: never; username: string },
>(props: SelectRolesStepHeaderProps<K>) {
  const {
    selectedItemsFromPreviousStep,
    labelForSelectedItemsFromPreviousStep,
    descriptionForRoleSelection,
  } = props;
  const { t } = useTranslation();
  return (
    <>
      <StyledTitle headingLevel="h1">{t('Select roles to apply')}</StyledTitle>
      <Split hasGutter>
        <SplitItem style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          {labelForSelectedItemsFromPreviousStep ?? t('Selected')}
        </SplitItem>
        {selectedItemsFromPreviousStep && selectedItemsFromPreviousStep.length > 0 && (
          <LabelGroup>
            {selectedItemsFromPreviousStep?.map((item, i) => {
              return (
                <Label key={i}>
                  <TextCell text={item.name ? item.name : item.username} />
                </Label>
              );
            })}
          </LabelGroup>
        )}
      </Split>
      {descriptionForRoleSelection && (
        <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>{descriptionForRoleSelection}</h2>
      )}
    </>
  );
}
