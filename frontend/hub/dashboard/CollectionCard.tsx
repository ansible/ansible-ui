import { CardBody } from '@patternfly/react-core';
import { AnsibleTowerIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { CSSProperties, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageDetail, TextCell } from '../../../framework';
import { useCarouselContext } from '../../../framework/PageCarousel/PageCarousel';
import {
  ColumnsDiv,
  PageDetailDiv,
  PageTableCard,
  Small,
} from '../../../framework/PageTable/PageTableCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';

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
          icon: <AnsibleTowerIcon />, // TODO: Update logo to use avatar_url if it exists
          title: <TextCell text={item.collection_version.name} />,
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
              <TextCell text={item.collection_version.version} />
              <TextCell text={item.collection_version.description} />
              <PageDetail>
                <PageDetailDiv>
                  <ColumnsDiv>
                    <>
                      {
                        item.collection_version.contents.filter((c) => c.content_type === 'module')
                          .length
                      }
                    </>
                    <Small>{t('Modules')}</Small>
                  </ColumnsDiv>
                  <ColumnsDiv>
                    <>
                      {
                        item.collection_version.contents.filter((c) => c.content_type === 'role')
                          .length
                      }
                    </>
                    <Small>{t('Roles')}</Small>
                  </ColumnsDiv>
                  <ColumnsDiv>
                    <>
                      {
                        item.collection_version.contents.filter(
                          (c) => c.content_type !== 'module' && c.content_type !== 'role'
                        ).length
                      }
                    </>
                    <Small>{t('Plugins')}</Small>
                  </ColumnsDiv>
                  <ColumnsDiv>
                    <>{Object.keys(item.collection_version.dependencies).length}</>
                    <Small>{t('Dependencies')}</Small>
                  </ColumnsDiv>
                </PageDetailDiv>
              </PageDetail>
            </CardBody>
          ),
          labels: item.is_signed
            ? [
                {
                  label: t('Signed'),
                  color: 'green',
                  icon: <CheckCircleIcon />,
                  variant: 'outline',
                },
              ]
            : undefined,
        })}
      ></PageTableCard>
    </div>
  );
}
