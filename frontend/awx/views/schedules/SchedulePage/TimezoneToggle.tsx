import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function TimezoneToggle(props: {
  isLocal: boolean;
  setIsLocal: (b: boolean) => void;
  localTimezone: string;
}) {
  const { isLocal, setIsLocal } = props;
  const { t } = useTranslation();

  return (
    <ToggleGroup isCompact>
      <ToggleGroupItem
        id="toggle-local"
        data-cy="toggle-local"
        aria-label={t('Toggle to {{localTimezone}}', { timezone: props.localTimezone })}
        isSelected={props.isLocal}
        text={props.localTimezone}
        type="button"
        onChange={() => setIsLocal(true)}
      />
      <ToggleGroupItem
        id="toggle-utc"
        data-cy="toggle-utc"
        aria-label={t('Toggle to UTC')}
        isSelected={!isLocal}
        text="UTC"
        type="button"
        onChange={() => setIsLocal(false)}
      />
    </ToggleGroup>
  );
}
