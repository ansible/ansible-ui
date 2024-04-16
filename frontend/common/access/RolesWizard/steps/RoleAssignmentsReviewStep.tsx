import { useMemo, useState } from 'react';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { Badge, Divider, ExpandableSection, Title, TextContent } from '@patternfly/react-core';
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
  edaRoles?: { id: number; name: string; description?: string; username?: never }[];
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

const StyledBadge = styled(Badge)`
  margin-left: var(--pf-v5-global--spacer--sm);
`;

export function RoleAssignmentsReviewStep() {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType, resources, users, teams, edaRoles } = wizardData as ReviewData;

  return (
    <TextContent>
      <Title headingLevel="h1">{t('Review')}</Title>
      {resourceType ? (
        <>
          <PageDetail label={t('Resource type')}>{resourceType}</PageDetail>
          <Divider />
        </>
      ) : null}
      {resources && resources.length ? (
        <>
          <ReviewExpandableList selectedItems={resources} fieldName="resources" />
          <Divider />
        </>
      ) : null}
      {users && users.length ? (
        <>
          <ReviewExpandableList selectedItems={users} fieldName="users" />
          <Divider />
        </>
      ) : null}
      {teams && teams.length ? (
        <>
          <ReviewExpandableList selectedItems={teams} fieldName="teams" />
          <Divider />
        </>
      ) : null}
      {edaRoles && edaRoles.length ? (
        <ReviewExpandableList selectedItems={edaRoles} fieldName="edaRoles" />
      ) : null}
    </TextContent>
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
      case 'edaRoles':
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
      case 'edaRoles':
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
      data-cy={`expandable-section-${fieldName}`}
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
