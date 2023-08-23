import { CheckCircleIcon } from '@patternfly/react-icons';
import { PageDetailDiv, PageTableCard, Small } from '../../../framework/PageTable/PageTableCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { PageDetail, TextCell } from '../../../framework';
import { useTranslation } from 'react-i18next';
import { CardBody, Truncate } from '@patternfly/react-core';
import { useCarouselContext } from '../../../framework/PageCarousel/PageCarousel';
import styled, { CSSProperties } from 'styled-components';
import { useMemo } from 'react';
import { RouteObj } from '../../Routes';
import { Logo } from '../common/Logo';

export const ColumnsDiv = styled.div`
  display: grid;
  gap: 6px;
  align-items: baseline;
`;

// TODO: If deployment mode is INSIGHTS, CERTIFIED_REPO should be set to 'published'. This needs to be updated
// in the future when we are able to identify INSIGHTS mode
const CERTIFIED_REPO = 'rh-certified';

function CertifiedIcon() {
  return <i className="fas fa-certificate"></i>;
}

export function CollectionCard(props: { collection: CollectionVersionSearch }) {
  const { t } = useTranslation();
  const { collection } = props;
  const { width: parentCarouselWidth, visibleCards } = useCarouselContext();

  const divMaxWidth: CSSProperties = useMemo(() => {
    if (visibleCards === 4) {
      return { maxWidth: 380 };
    }
    if (parentCarouselWidth) {
      return { maxWidth: Math.floor((parentCarouselWidth - 60) / visibleCards) }; // 60 represents the combined gap between cards
    }
    return {};
  }, [parentCarouselWidth, visibleCards]);

  return (
    <div className="size-container" style={divMaxWidth}>
      <PageTableCard
        item={collection}
        itemToCardFn={(item: CollectionVersionSearch) => ({
          id: item.collection_version.name,
          icon: (
            <Logo
              alt={t(
                `${item.namespace_metadata?.company || item.collection_version.namespace} logo`
              )}
              fallbackToDefault
              image={item.namespace_metadata?.avatar_url ?? null}
              logoSize="48px"
              width="48px"
              flexGrow
            />
          ),
          title: (
            <TextCell
              text={item.collection_version.name}
              to={RouteObj.CollectionDetails.replace(':id', item.collection_version.name)}
            />
          ),
          iconAboveTitle: true,
          subtitle: (
            <TextCell
              text={t('Provided by {{provider}}', {
                provider: item.collection_version.namespace,
              })}
            />
          ),
          cardBody: (
            <CardBody>
              <TextCell text={`v${item.collection_version.version}`} />
              {item.collection_version.description && (
                <Truncate
                  content={item.collection_version.description}
                  tooltipPosition={'bottom'}
                />
              )}
              <PageDetail>
                <PageDetailDiv>
                  <ColumnsDiv>
                    <dd>
                      {
                        item.collection_version.contents.filter((c) => c.content_type === 'module')
                          .length
                      }
                    </dd>
                    <Small>
                      <dt>{t('Modules')}</dt>
                    </Small>
                  </ColumnsDiv>
                  <ColumnsDiv>
                    <dd>
                      {
                        item.collection_version.contents.filter((c) => c.content_type === 'role')
                          .length
                      }
                    </dd>
                    <Small>
                      <dt>{t('Roles')}</dt>
                    </Small>
                  </ColumnsDiv>
                  <ColumnsDiv>
                    <dd>
                      {
                        item.collection_version.contents.filter(
                          (c) => c.content_type !== 'module' && c.content_type !== 'role'
                        ).length
                      }
                    </dd>
                    <Small>
                      <dt>{t('Plugins')}</dt>
                    </Small>
                  </ColumnsDiv>
                  <ColumnsDiv>
                    <dd>{Object.keys(item.collection_version.dependencies).length}</dd>
                    <Small>
                      <dt>{t('Dependencies')}</dt>
                    </Small>
                  </ColumnsDiv>
                </PageDetailDiv>
              </PageDetail>
            </CardBody>
          ),
          labels: [
            ...(item.repository.name === CERTIFIED_REPO
              ? [
                  {
                    label: t('Certified'),
                    color: 'blue',
                    icon: <CertifiedIcon />,
                    variant: 'outline',
                  },
                ]
              : [
                  {
                    label: item.repository.name,
                    color: 'blue',
                    variant: 'outline',
                  },
                ]),
            ...(item.is_signed
              ? [
                  {
                    label: t('Signed'),
                    color: 'green',
                    icon: <CheckCircleIcon />,
                    variant: 'outline',
                  },
                ]
              : []),
          ],
        })}
      ></PageTableCard>
    </div>
  );
}
