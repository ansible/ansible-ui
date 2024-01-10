import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { TextCell } from '../../../../../framework';
import { Repository } from '../Repository';

export function RepositoryLabels(props: { repository: Repository }) {
  const { t } = useTranslation();
  const { repository } = props;
  if (Object.keys(repository.pulp_labels).length === 0) {
    return <TextCell text={t('None')} />;
  } else {
    return Object.keys(repository.pulp_labels).map((label) =>
      repository.pulp_labels[label] ? (
        <Label readOnly key={label}>
          {label}: {repository.pulp_labels[label]}
        </Label>
      ) : (
        <Label readOnly key={label}>
          {label}
        </Label>
      )
    );
  }
}
