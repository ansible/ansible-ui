import { AnsibleTowerIcon, CheckCircleIcon } from '@patternfly/react-icons';
import {
  ColumnsDiv,
  PageDetailDiv,
  PageTableCard,
} from '../../../framework/PageTable/PageTableCard';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { PageDetail, TextCell } from '../../../framework';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@patternfly/react-core';

export function CollectionCard(props: { collection: CollectionVersionSearch }) {
  const { t } = useTranslation();
  const { collection } = props;

  return (
    <PageTableCard
      item={collection}
      itemToCardFn={(item: CollectionVersionSearch) => ({
        id: item.collection_version.name,
        icon: <AnsibleTowerIcon />, // TODO: Update logo to use avatar_url if it exists
        title: <TextCell text={item.collection_version.name} />,
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
                  <small style={{ opacity: 0.7 }}>{t('Modules')}</small>
                </ColumnsDiv>
                <ColumnsDiv>
                  <>
                    {
                      item.collection_version.contents.filter((c) => c.content_type === 'role')
                        .length
                    }
                  </>
                  <small style={{ opacity: 0.7 }}>{t('Roles')}</small>
                </ColumnsDiv>
                <ColumnsDiv>
                  <>
                    {
                      item.collection_version.contents.filter(
                        (c) => c.content_type !== 'module' && c.content_type !== 'role'
                      ).length
                    }
                  </>
                  <small style={{ opacity: 0.7 }}>{t('Plugins')}</small>
                </ColumnsDiv>
                <ColumnsDiv>
                  <>{Object.keys(item.collection_version.dependencies).length}</>
                  <small style={{ opacity: 0.7 }}>{t('Dependencies')}</small>
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
      showSelect
    ></PageTableCard>
  );
}
