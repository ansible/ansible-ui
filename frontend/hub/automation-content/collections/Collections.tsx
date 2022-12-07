import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Divider,
  Gallery,
  GalleryItem,
  Label,
  LabelGroup,
  PageSection,
  Split,
  SplitItem,
  Stack,
} from '@patternfly/react-core'
import {
  CheckCircleIcon,
  CircleIcon,
  ExternalLinkAltIcon,
  RedhatIcon,
} from '@patternfly/react-icons'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader, PageLayout, PageTable } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { idKeyFn, useHubView } from '../../useHubView'
import { Collection } from './Collection'
import { useCollectionActions } from './hooks/useCollectionActions'
import { useCollectionColumns } from './hooks/useCollectionColumns'
import { useCollectionFilters } from './hooks/useCollectionFilters'
import { useCollectionsActions } from './hooks/useCollectionsActions'

export function Collections() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useCollectionFilters()
  const tableColumns = useCollectionColumns()
  const view = useHubView<Collection>(
    '/api/automation-hub/_ui/v1/repo/published/',
    idKeyFn,
    toolbarFilters
  )
  const toolbarActions = useCollectionsActions()
  const rowActions = useCollectionActions()
  const showFeaturedCollections = view.itemCount === 0 && Object.keys(view.filters).length === 0
  return (
    <PageLayout>
      <PageHeader
        title={t('Collections')}
        description={t(
          'Collections are a distribution format for Ansible content that can include playbooks, roles, modules, and plugins.'
        )}
        titleHelpTitle={t('Collections')}
        titleHelp={t(
          'Collections are a distribution format for Ansible content that can include playbooks, roles, modules, and plugins.'
        )}
        titleDocLink="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html"
      />
      {showFeaturedCollections && <FeaturedCollections />}
      <PageTable<Collection>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        emptyStateDescription={t('To get started, upload a collection.')}
        emptyStateButtonText={t('Upload collection')}
        emptyStateButtonClick={() => navigate(RouteE.UploadCollection)}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  )
}

function FeaturedCollections() {
  const { t } = useTranslation()
  return (
    <>
      <PageSection>
        <Card isFlat isRounded isLarge>
          <CardHeader>
            <CardTitle>{t('Featured Collections')}</CardTitle>
          </CardHeader>
          <CardBody>
            <Gallery>
              {new Array(3).fill(0).map((_, index) => (
                <GalleryItem key={index}>
                  <Card isPlain isCompact>
                    <CardHeader>
                      <Stack hasGutter style={{ width: '100%' }}>
                        <Split hasGutter>
                          <SplitItem isFilled>
                            <CardHeaderMain>
                              <RedhatIcon size="xl" />
                            </CardHeaderMain>
                          </SplitItem>
                          <SplitItem>
                            <Button variant="secondary">{t('Sync')}</Button>
                          </SplitItem>
                        </Split>
                        <Split hasGutter>
                          <CardTitle>
                            <Button component={Link} variant="link" isInline>
                              {t('Amazing Collection')}
                            </Button>
                          </CardTitle>
                        </Split>
                      </Stack>
                    </CardHeader>
                    <CardBody>{t('This is the description of the collection.')}</CardBody>
                    <CardFooter>
                      <LabelGroup>
                        <Label icon={<CircleIcon />} color="blue" isCompact>
                          {t('Certified')}
                        </Label>
                        <Label icon={<CheckCircleIcon />} color="green" isCompact>
                          {t('Signed')}
                        </Label>
                        <Label color="grey" isCompact>
                          {t('Unsynced')}
                        </Label>
                      </LabelGroup>
                    </CardFooter>
                  </Card>
                </GalleryItem>
              ))}
            </Gallery>
          </CardBody>
          <CardFooter>
            <Split>
              <SplitItem isFilled />
              <Button
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                component={Link}
                variant="link"
                isInline
              >
                {t('Browse all certified collections')}
              </Button>
            </Split>
          </CardFooter>
        </Card>
      </PageSection>
      <Divider />
    </>
  )
}
