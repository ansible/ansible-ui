import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardTitle, Grid, GridItem, Spinner } from '@patternfly/react-core';
import { useDeprecationData } from './hooks/useDeprecationData';

const SEVERITY_COLORS = {
  hot: '#c9190b',
  warm: '#ec7a08',
  moderate: '#f0ab00',
  cool: '#06c',
};

const SEVERITY_LABELS = {
  hot: '🔥 HOT',
  warm: '⚠️ WARN',
  moderate: '⚡ MODERATE',
  cool: '❄️ COOL',
};

export function DeprecationsDashboard() {
  const { t } = useTranslation();
  const { totalWarnings, affectedJobs, uniqueIssues, deprecations, loading } = useDeprecationData();

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spinner size="xl" />
        <div style={{ marginTop: '16px' }}>{t('Loading deprecation data...')}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <Grid hasGutter>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Total Warnings')}</CardTitle>
            <CardBody>
              <div style={{ fontSize: '36px', fontWeight: '300', marginBottom: '8px' }}>
                {totalWarnings}
              </div>
              <div style={{ fontSize: '13px', color: '#6a6e73' }}>
                {t('From last 20 jobs scanned')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Affected Jobs')}</CardTitle>
            <CardBody>
              <div style={{ fontSize: '36px', fontWeight: '300', marginBottom: '8px' }}>
                {affectedJobs}
              </div>
              <div style={{ fontSize: '13px', color: '#6a6e73' }}>
                {t('Jobs with deprecation warnings')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Unique Issues')}</CardTitle>
            <CardBody>
              <div style={{ fontSize: '36px', fontWeight: '300', marginBottom: '8px' }}>
                {uniqueIssues}
              </div>
              <div style={{ fontSize: '13px', color: '#6a6e73' }}>
                {t('Different deprecation types')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Heat Map Card */}
      <Card style={{ marginTop: '24px' }}>
        <CardTitle>{t('Deprecation Activity Heat Map')}</CardTitle>
        <CardBody>
          {deprecations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6a6e73' }}>
              {t('No deprecation warnings found in recent jobs')}
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              {deprecations.map((dep, index) => {
                const maxCount = deprecations[0]?.count || 1;
                const widthPercent = Math.min((dep.count / maxCount) * 100, 100);
                const color = SEVERITY_COLORS[dep.severity];
                const label = SEVERITY_LABELS[dep.severity];

                return (
                  <div
                    key={dep.type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: index < deprecations.length - 1 ? '12px' : '0',
                      padding: '12px',
                    }}
                  >
                    <div style={{ flex: '0 0 220px', fontWeight: '500', fontSize: '14px' }}>
                      {dep.type}
                    </div>
                    <div
                      style={{
                        flex: '1',
                        height: '24px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPercent}%`,
                          height: '100%',
                          background: `linear-gradient(to right, ${color}, ${color}dd)`,
                          borderRadius: '3px',
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        flex: '0 0 110px',
                        textAlign: 'right',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                    >
                      {dep.count} {t('occurrences')}
                    </div>
                    <div
                      style={{
                        flex: '0 0 110px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color,
                        fontSize: '13px',
                      }}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Table Card */}
      <Card style={{ marginTop: '24px' }}>
        <CardTitle>{t('Deprecation Issues')}</CardTitle>
        <CardBody>
          <div style={{ fontSize: '13px', color: '#6a6e73', marginBottom: '16px' }}>
            {t('Showing deprecations from recent jobs')}
          </div>

          {deprecations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6a6e73' }}>
              {t('No deprecation warnings found')}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #4a4a4a', background: 'transparent' }}>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    {t('Deprecation Type')}
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    {t('Count')}
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    {t('Severity')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {deprecations.map((dep, index) => {
                  const color = SEVERITY_COLORS[dep.severity];
                  const label = SEVERITY_LABELS[dep.severity];
                  const isLast = index === deprecations.length - 1;

                  return (
                    <tr
                      key={dep.type}
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid #4a4a4a',
                        background: 'transparent',
                      }}
                    >
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#fff' }}>
                          {dep.type}
                        </div>
                        <div style={{ fontSize: '12px', color: '#c7c7c7', marginTop: '4px' }}>
                          {dep.description}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontWeight: '500',
                          fontSize: '14px',
                          color: '#fff',
                        }}
                      >
                        {dep.count}
                      </td>
                      <td
                        style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: '600',
                          color,
                        }}
                      >
                        {label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
