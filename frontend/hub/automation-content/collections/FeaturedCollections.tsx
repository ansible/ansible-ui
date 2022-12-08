import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  Split,
  SplitItem,
  Stack,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CircleIcon,
  ExternalLinkAltIcon,
  RedhatIcon,
} from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function FeaturedCollections(props: { collectionCount?: number }) {
  const { t } = useTranslation();
  return (
    <>
      <Card isFlat isRounded isLarge>
        <CardHeader>
          <CardTitle>{t('Featured Collections')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Grid hasGutter span={12} sm={12} md={12} lg={6} xl={6} xl2={4}>
            {new Array(3).fill(0).map((_, index) => (
              <GridItem key={index}>
                <Card isFlat isRounded isLarge>
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
              </GridItem>
            ))}
          </Grid>
        </CardBody>
        <CardFooter>
          <Split>
            <SplitItem isFilled />
            <Button
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              component={(props: { children: ReactNode }) => (
                <a href="https://galaxy.ansible.com/" target="_blank" rel="noreferrer" {...props}>
                  {props.children}
                </a>
              )}
              variant="link"
              isInline
            >
              {t('Browse all certified collections')}
            </Button>
          </Split>
        </CardFooter>
      </Card>
    </>
  );
}
