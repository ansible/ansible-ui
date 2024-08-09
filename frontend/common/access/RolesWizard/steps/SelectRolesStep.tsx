import { ISelected, ITableColumn, IToolbarFilter, IView, TextCell } from '../../../../../framework';
import { useMemo } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { Label, LabelGroup, Split, SplitItem, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';

interface SelectRolesStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined; error?: Error };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
  title?: string;
}

interface SelectRolesStepHeaderProps<
  K extends { name: string; username?: never } | { name?: never; username: string },
> {
  selectedItemsFromPreviousStep?: K[];
  labelForSelectedItemsFromPreviousStep?: string;
  descriptionForRoleSelection?: string;
  title?: string;
  resourceType?: string;
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
    title,
  } = props;
  const { wizardData } = usePageWizard();
  const { resourceType } = wizardData as { [key: string]: unknown };

  const selectedItemsFromPreviousStep = useMemo(() => {
    if (wizardData && fieldNameForPreviousStep) {
      return (wizardData as { [key: string]: [] })[fieldNameForPreviousStep];
    }
    return undefined;
  }, [fieldNameForPreviousStep, wizardData]);

  const labelForSelectedItemsFromPreviousStep = useMemo(() => {
    if (selectedItemsFromPreviousStep?.length && fieldNameForPreviousStep) {
      const previousStepKey =
        fieldNameForPreviousStep === 'resources' ? resourceType : fieldNameForPreviousStep;
      switch (previousStepKey) {
        case 'users':
          return t('Selected users');
        case 'teams':
          return t('Selected teams');
        case 'eda.edacredential':
          return t('Selected credentials');
        case 'eda.project':
          return t('Selected projects');
        case 'eda.activation':
          return t('Selected rulebook activations');
        case 'eda.rulebook':
          return t('Selected rulebooks');
        case 'eda.rulebookprocess':
          return t('Selected rulebook processes');
        case 'eda.credentialtype':
          return t('Selected credential types');
        case 'eda.decisionenvironment':
          return t('Selected decision environments');
        case 'eda.auditrule':
          return t('Selected audit rules');
        default:
          return undefined;
      }
    }
    return undefined;
  }, [fieldNameForPreviousStep, resourceType, selectedItemsFromPreviousStep?.length, t]);

  return (
    <>
      <SelectRolesStepHeader
        selectedItemsFromPreviousStep={selectedItemsFromPreviousStep}
        labelForSelectedItemsFromPreviousStep={labelForSelectedItemsFromPreviousStep}
        descriptionForRoleSelection={descriptionForRoleSelection}
        title={title}
        resourceType={resourceType ? (resourceType as string) : undefined}
      ></SelectRolesStepHeader>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected roles')}
        errorStateTitle={t('Error loading roles')}
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
    title,
    resourceType,
  } = props;
  const { t } = useTranslation();
  return (
    <>
      <StyledTitle headingLevel="h1">{title ?? t('Select roles to apply')}</StyledTitle>
      {resourceType !== 'system' ? (
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
      ) : null}
      {descriptionForRoleSelection && (
        <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>{descriptionForRoleSelection}</h2>
      )}
    </>
  );
}
