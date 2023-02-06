import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../framework';
import { useInMemoryView } from '../../../framework';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useActivationColumns } from './hooks/useActivationColumns';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Level,
  LevelItem,
  Title,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function ActivationsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: activations } = useGet<EdaRulebookActivation[]>('/api/activations');
  const tableColumns = useActivationColumns();
  const view = useInMemoryView<EdaRulebookActivation>({
    items: activations?.slice(-4),
    tableColumns,
    keyFn: (activation: EdaRulebookActivation) => activation.id,
  });
  return (
    <Card style={{ transition: 'box-shadow 0.25s', minHeight: 500 }}>
      <CardTitle>
        <Level>
          <LevelItem>
            <Title headingLevel="h2">{t('Activations')}</Title>
          </LevelItem>
          <LevelItem>
            <Button variant="link" onClick={() => navigate(RouteE.EdaRulebookActivations)}>
              {t('Go to activations')}
            </Button>
          </LevelItem>
        </Level>
      </CardTitle>
      <CardBody>
        <PageTable
          tableColumns={tableColumns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading activations')}
          emptyStateTitle={t('No activations yet')}
          {...view}
          defaultSubtitle={t('Activation')}
        />
      </CardBody>
      <CardFooter>
        <Button
          variant="link"
          icon={<PlusCircleIcon />}
          onClick={() => navigate(RouteE.CreateEdaRulebookActivation)}
        >
          {t('Create activation')}
        </Button>
      </CardFooter>
    </Card>
  );
}
