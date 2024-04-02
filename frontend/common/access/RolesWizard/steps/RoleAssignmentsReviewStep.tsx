import { useMemo, useState } from 'react';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { Badge, Divider, ExpandableSection, Title } from '@patternfly/react-core';
import { getItemKey } from '../../../crud/Data';
import {
  ITableColumn,
  PageDetail,
  PageTable,
  TextCell,
  useInMemoryView,
} from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type ReviewData = {
  resourceType?: string;
  resources?: { id: number; name: string; username?: never }[];
  roles?: { id: number; name: string; description?: string; username?: never }[];
  teams?: { id: number; name: string; username?: never }[];
  users?: { id: number; name?: never; username: string }[];
};

interface ReviewExpandableListProps<
  K extends { name: string; username?: never } | { name?: never; username: string },
> {
  selectedItems: K[];
  label?: string;
  fieldName: string;
}

const StyledDivider = styled(Divider)`
  margin-bottom: var(--pf-v5-global--spacer--lg);
`;

const StyledBadge = styled(Badge)`
  margin-left: var(--pf-v5-global--spacer--sm);
`;

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

export function RoleAssignmentsReviewStep() {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();

  const reviewData = useMemo<ReviewData>(() => {
    const data: ReviewData = {};
    if ((wizardData as ReviewData)['resourceType']) {
      data.resourceType = (wizardData as ReviewData).resourceType;
    }
    if ((wizardData as ReviewData)['users'] && (wizardData as ReviewData)['users']?.length) {
      data.users = (wizardData as ReviewData).users;
    }
    if ((wizardData as ReviewData)['teams'] && (wizardData as ReviewData)['teams']?.length) {
      data.teams = (wizardData as ReviewData).teams;
    }
    if ((wizardData as ReviewData)['roles'] && (wizardData as ReviewData)['roles']?.length) {
      data.roles = (wizardData as ReviewData).roles;
    }
    if (
      (wizardData as ReviewData)['resources'] &&
      (wizardData as ReviewData)['resources']?.length
    ) {
      data.resources = (wizardData as ReviewData).resources;
    }
    return data;
  }, [wizardData]);

  return (
    <>
      <StyledTitle headingLevel="h1">{t('Review')}</StyledTitle>
      {reviewData?.resourceType ? (
        <>
          <PageDetail label={t('Resource type')}>{reviewData.resourceType}</PageDetail>
          <StyledDivider />
        </>
      ) : null}
      {reviewData?.resources?.length ? (
        <>
          <ReviewExpandableList selectedItems={reviewData.resources} fieldName="resources" />
          <StyledDivider />
        </>
      ) : null}
      {reviewData?.users?.length ? (
        <>
          <ReviewExpandableList selectedItems={reviewData.users} fieldName="users" />
          <StyledDivider />
        </>
      ) : null}
      {reviewData?.teams?.length ? (
        <>
          <ReviewExpandableList selectedItems={reviewData.teams} fieldName="teams" />
          <StyledDivider />
        </>
      ) : null}
      {reviewData?.roles?.length ? (
        <ReviewExpandableList selectedItems={reviewData.roles} fieldName="roles" />
      ) : null}
    </>
  );
}

function ReviewExpandableList<
  K extends
    | { id: number; name: string; description?: string; username?: never }
    | { id: number; name?: never; username: string },
>(props: ReviewExpandableListProps<K>) {
  const { label, selectedItems, fieldName } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };
  const { t } = useTranslation();
  const labelForSelectedItems = useMemo(() => {
    if (label) {
      return label;
    }
    switch (fieldName) {
      case 'users':
        return t('Users');
      case 'teams':
        return t('Teams');
      case 'resources':
        return t('Resources');
      case 'roles':
        return t('Roles');
      default:
        return '';
    }
  }, [fieldName, label, t]);

  const tableColumns: ITableColumn<K>[] = useMemo(() => {
    switch (fieldName) {
      case 'users':
        return [
          {
            header: t('Username'),
            cell: (user: K) => <TextCell text={user.username} />,
            card: 'name',
            list: 'name',
            sort: 'username',
            maxWidth: 200,
          },
        ];
      case 'roles':
        return [
          {
            header: t('Name'),
            cell: (item: K) => <TextCell text={item.name} />,
            card: 'name',
            list: 'name',
            sort: 'name',
          },
          {
            header: t('Description'),
            cell: (role: K) =>
              (role as { id: number; name: string; description?: string; username?: never })
                .description && (
                <TextCell
                  text={
                    (role as { id: number; name: string; description?: string; username?: never })
                      .description
                  }
                />
              ),
            card: 'description',
            list: 'description',
          },
        ];
      default:
        return [
          {
            header: t('Name'),
            cell: (item: K) => <TextCell text={item.name} />,
            card: 'name',
            list: 'name',
            sort: 'name',
          },
        ];
    }
  }, [fieldName, t]);

  const view = useInMemoryView<K>({
    keyFn: getItemKey,
    items: selectedItems,
    tableColumns,
  });

  return (
    <ExpandableSection
      toggleContent={
        <div>
          <span>{labelForSelectedItems}</span>
          <StyledBadge isRead>{selectedItems.length}</StyledBadge>
        </div>
      }
      onToggle={onToggle}
      isExpanded={isExpanded}
    >
      <PageTable<K>
        {...view}
        tableColumns={tableColumns}
        errorStateTitle="NEVER"
        emptyStateTitle="NEVER"
        defaultSubtitle={t('Role')}
        disablePagination
        disableLastRowBorder
        compact
        borderless
      />
    </ExpandableSection>
  );
}
