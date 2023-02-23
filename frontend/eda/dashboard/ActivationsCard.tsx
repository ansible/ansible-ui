import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../framework';
import { useInMemoryView } from '../../../framework';
import { useGet } from '../../common/useItem';
import { RouteObj } from '../../Routes';
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
import { API_PREFIX } from '../constants';
import { EdaResult } from '../interfaces/EdaResult';

export function ActivationsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: data } = useGet<EdaResult<EdaRulebookActivation>>(`${API_PREFIX}/activations/`);
  const tableColumns = useActivationColumns();
  const view = useInMemoryView<EdaRulebookActivation>({
    items: data?.results ? data.results.slice(-4) : [],
    tableColumns,
    keyFn: (activation: EdaRulebookActivation) => activation.id,
  });
  return (
    <Card style={{ transition: 'box-shadow 0.25s', minHeight: 500 }}>
      <CardTitle>
        <Level>
          <LevelItem>
            <Title headingLevel="h2">{t('Rulebook Activations')}</Title>
          </LevelItem>
          <LevelItem>
            <Button variant="link" onClick={() => navigate(RouteObj.EdaRulebookActivations)}>
              {t('Go to Rulebook Activations')}
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
          onClick={() => navigate(RouteObj.CreateEdaRulebookActivation)}
        >
          {t('Create rulebook activation')}
        </Button>
      </CardFooter>
    </Card>
  );
}
