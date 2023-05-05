import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  Scrollable,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaRole } from '../../interfaces/EdaRole';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
} from '@patternfly/react-core';

export function RoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGet<EdaRole>(
    `${API_PREFIX}/roles/${params.id ?? ''}/`,
    undefined,
    SWR_REFRESH_INTERVAL
  );

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: RouteObj.EdaRoles }, { label: role?.name }]}
      />
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>{role?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{role?.description || ''}</PageDetail>
          <PageDetail label={t('Created')}>
            <DateTimeCell format="date-time" value={role?.created_at} />
          </PageDetail>
        </PageDetails>
        <PageDetails numberOfColumns={'single'}>
          <PageDetail label={t('Permissions')}>
            <DescriptionList
              isCompact
              isHorizontal
              horizontalTermWidthModifier={{
                default: '16ch',
              }}
            >
              {role?.permissions.map((permission) => (
                <DescriptionListGroup key={permission?.resource_type}>
                  <DescriptionListTerm
                    style={{ fontWeight: 'normal' }}
                    key={permission?.resource_type}
                  >
                    {permission?.resource_type}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelGroup numLabels={5}>
                      {permission?.action.map((action) => (
                        <Label key={action}>{action}</Label>
                      ))}
                    </LabelGroup>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
