import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Spinner,
  Progress,
  ProgressVariant,
  Button,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { ExclamationTriangleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useDeprecationData, getDeprecationDescription } from './hooks/useDeprecationData';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { useNavigate } from 'react-router-dom';

function getSeverityVariant(severity: string): ProgressVariant {
  switch (severity) {
    case 'hot':
      return ProgressVariant.danger;
    case 'warm':
      return ProgressVariant.warning;
    case 'moderate':
    default:
      return ProgressVariant.success;
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'hot':
    case 'warm':
      return <ExclamationTriangleIcon />;
    default:
      return <InfoCircleIcon />;
  }
}

function getSeverityLabel(severity: string, t: (key: string) => string): string {
  switch (severity) {
    case 'hot':
      return t('Hot');
    case 'warm':
      return t('Warn');
    case 'moderate':
      return t('Moderate');
    default:
      return t('Cool');
  }
}

export function DeprecationsDashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useDeprecationData();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--pf-t--global--spacer--xl)', textAlign: 'center' }}>
        <Spinner size="xl" />
        <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
          {t('Loading deprecation data...')}
        </div>
      </div>
    );
  }

  const maxCount = data?.deprecations[0]?.count || 1;

  return (
    <div style={{ padding: 'var(--pf-t--global--spacer--xl)' }}>
      {/* Stats Cards */}
      <Grid hasGutter>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Total Warnings')}</CardTitle>
            <CardBody>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--4xl)',
                  fontWeight: 'var(--pf-t--global--font--weight--light)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {data?.totalWarnings || 0}
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--sm)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {t('From recent job executions')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Affected Jobs')}</CardTitle>
            <CardBody>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--4xl)',
                  fontWeight: 'var(--pf-t--global--font--weight--light)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {data?.affectedJobs || 0}
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--sm)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {t('Jobs with deprecation warnings')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Unique Issues')}</CardTitle>
            <CardBody>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--4xl)',
                  fontWeight: 'var(--pf-t--global--font--weight--light)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {data?.uniqueIssues || 0}
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--sm)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {t('Different deprecation types')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Heat Map Card */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Activity Heat Map')}</CardTitle>
        <CardBody>
          {!data?.deprecations || data.deprecations.length === 0 ? (
            <div
              style={{
                padding: 'var(--pf-t--global--spacer--xl)',
                textAlign: 'center',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              {t('No deprecation warnings found in recent jobs')}
            </div>
          ) : (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              {data.deprecations.map((dep) => (
                <div
                  key={dep.type}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--pf-t--global--spacer--md)',
                    marginBottom: 'var(--pf-t--global--spacer--md)',
                    padding: 'var(--pf-t--global--spacer--md)',
                    cursor: 'pointer',
                    borderRadius: 'var(--pf-t--global--border--radius--medium)',
                  }}
                  onClick={() => {
                    const jobsUrl = getPageUrl(AwxRoute.Jobs, {
                      query: { id__in: dep.jobIds },
                    });
                    void navigate(jobsUrl);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const jobsUrl = getPageUrl(AwxRoute.Jobs, {
                        query: { id__in: dep.jobIds },
                      });
                      void navigate(jobsUrl);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'var(--pf-t--global--background--color--action--hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      flex: '0 0 220px',
                      fontWeight: 'var(--pf-t--global--font--weight--semi-bold)',
                      fontSize: 'var(--pf-t--global--font--size--sm)',
                    }}
                  >
                    {dep.type}
                  </div>
                  <div style={{ flex: '1' }}>
                    <Progress
                      value={(dep.count / maxCount) * 100}
                      title={`${dep.count} ${t('occurrences')}`}
                      variant={getSeverityVariant(dep.severity)}
                    />
                  </div>
                  <div
                    style={{
                      flex: '0 0 110px',
                      textAlign: 'right',
                      fontSize: 'var(--pf-t--global--font--size--sm)',
                    }}
                  >
                    {getSeverityIcon(dep.severity)}{' '}
                    <span style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
                      {getSeverityLabel(dep.severity, t)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Table Card */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Issues')}</CardTitle>
        <CardBody>
          <div
            style={{
              fontSize: 'var(--pf-t--global--font--size--sm)',
              color: 'var(--pf-t--global--text--color--subtle)',
              marginBottom: 'var(--pf-t--global--spacer--md)',
            }}
          >
            {t('Click on occurrence count to view affected jobs and their templates')}
          </div>

          {!data?.deprecations || data.deprecations.length === 0 ? (
            <div
              style={{
                padding: 'var(--pf-t--global--spacer--xl)',
                textAlign: 'center',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              {t('No deprecation warnings found')}
            </div>
          ) : (
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Deprecation Type')}</Th>
                  <Th>{t('Occurrences')}</Th>
                  <Th>{t('Severity')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.deprecations.map((dep) => (
                  <Tr key={dep.type}>
                    <Td>
                      <div style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
                        {dep.type}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--pf-t--global--font--size--sm)',
                          color: 'var(--pf-t--global--text--color--subtle)',
                          marginTop: 'var(--pf-t--global--spacer--xs)',
                        }}
                      >
                        {getDeprecationDescription(dep.type)}
                      </div>
                    </Td>
                    <Td>
                      <Button
                        variant="link"
                        isInline
                        onClick={() => {
                          const jobsUrl = getPageUrl(AwxRoute.Jobs, {
                            query: { id__in: dep.jobIds },
                          });
                          void navigate(jobsUrl);
                        }}
                      >
                        {dep.count}
                      </Button>
                    </Td>
                    <Td>
                      {getSeverityIcon(dep.severity)}{' '}
                      <span style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
                        {getSeverityLabel(dep.severity, t)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
