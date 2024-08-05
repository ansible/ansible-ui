import { useMemo, useState } from 'react';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { Badge, Divider, ExpandableSection, Title } from '@patternfly/react-core';
import { getItemKey } from '../../../crud/Data';
import {
  ITableColumn,
  PageDetails,
  PageDetail,
  PageTable,
  TextCell,
  useInMemoryView,
} from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useMapContentTypeToDisplayName } from '../../hooks/useMapContentTypeToDisplayName';

type ReviewData = {
  resourceType?: string;
  resources?: { id: number; name: string; username?: never }[];
  edaRoles?: { id: number; name: string; description?: string; username?: never }[];
  awxRoles?: { id: number; name: string; description?: string; username?: never }[];
  hubRoles?: { id: number; name: string; description?: string; username?: never }[];
  teams?: { id: number; name: string; username?: never }[];
  users?: { id: number; name?: never; username: string }[];
};

interface ReviewExpandableListProps<
  K extends { name: string; username?: never } | { name?: never; username: string },
> {
  selectedItems: K[];
  label?: string;
  fieldName: string;
  edaRolesLabel?: string;
  awxRolesLabel?: string;
  hubRolesLabel?: string;
}

const StyledBadge = styled(Badge)`
  margin-left: var(--pf-v5-global--spacer--sm);
`;
const StyledDivider = styled(Divider)`
  margin: var(--pf-v5-global--spacer--md) 0 var(--pf-v5-global--spacer--md) 0;
`;

export function RoleAssignmentsReviewStep(props: {
  edaRolesLabel?: string;
  awxRolesLabel?: string;
  hubRolesLabel?: string;
  selectedUser?: { id: number; name?: never; username: string };
  selectedTeam?: { id: number; name: string; username?: never };
}) {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType, resources, users, teams, edaRoles, awxRoles, hubRoles } =
    wizardData as ReviewData;
  const getDisplayName = useMapContentTypeToDisplayName();

  return (
    <>
      <Title headingLevel="h1">{t('Review')}</Title>
      {resourceType ? (
        <>
          <div
            style={{
              marginTop: 'var(--pf-v5-global--spacer--lg)',
            }}
          >
            <PageDetails disablePadding>
              <PageDetail label={t('Resource type')}>
                {getDisplayName(resourceType, { isTitleCase: true })}
              </PageDetail>
            </PageDetails>
          </div>
          <StyledDivider className="pf-v5-u-mb-xl" />
        </>
      ) : null}
      {props.selectedUser ? (
        <>
          <div
            style={{
              marginTop: 'var(--pf-v5-global--spacer--lg)',
            }}
          >
            <PageDetails disablePadding>
              <PageDetail label={t('User')}>{props.selectedUser.username}</PageDetail>
            </PageDetails>
          </div>
          <StyledDivider className="pf-v5-u-mb-xl" />
        </>
      ) : null}
      {props.selectedTeam ? (
        <>
          <div
            style={{
              marginTop: 'var(--pf-v5-global--spacer--lg)',
            }}
          >
            <PageDetails disablePadding>
              <PageDetail label={t('Team')}>{props.selectedTeam.name}</PageDetail>
            </PageDetails>
          </div>
          <StyledDivider className="pf-v5-u-mb-xl" />
        </>
      ) : null}
      {resources && resources.length ? (
        <>
          <ReviewExpandableList selectedItems={resources} fieldName="resources" />
          <StyledDivider />
        </>
      ) : null}
      {users && users.length ? (
        <>
          <ReviewExpandableList selectedItems={users} fieldName="users" />
          <StyledDivider />
        </>
      ) : null}
      {teams && teams.length ? (
        <>
          <ReviewExpandableList selectedItems={teams} fieldName="teams" />
          <StyledDivider />
        </>
      ) : null}
      {edaRoles && edaRoles.length ? (
        <ReviewExpandableList selectedItems={edaRoles} fieldName="edaRoles" {...props} />
      ) : null}
      {awxRoles && awxRoles.length ? (
        <ReviewExpandableList selectedItems={awxRoles} fieldName="awxRoles" {...props} />
      ) : null}
      {hubRoles && hubRoles.length ? (
        <ReviewExpandableList selectedItems={hubRoles} fieldName="hubRoles" {...props} />
      ) : null}
    </>
  );
}

function ReviewExpandableList<
  K extends
    | { id: number; name: string; description?: string; username?: never }
    | { id: number; name?: never; username: string },
>(props: ReviewExpandableListProps<K>) {
  const { label, selectedItems, fieldName, edaRolesLabel, awxRolesLabel, hubRolesLabel } = props;
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
        return edaRolesLabel || t('Roles');
      case 'awxRoles':
        return awxRolesLabel || t('Roles');
      case 'hubRoles':
        return hubRolesLabel || t('Roles');
      default:
        return '';
    }
  }, [awxRolesLabel, edaRolesLabel, hubRolesLabel, fieldName, label, t]);

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
      case 'awxRoles':
      case 'edaRoles':
      case 'hubRoles':
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

  if (view?.itemCount === 0) {
    return null;
  }

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
