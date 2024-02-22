import { Icon } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import { t } from 'i18next';

export function ExpandIcon(props: {
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
}) {
  return (
    <Icon size="md">
      <AngleRightIcon
        data-cy="expandable"
        style={{
          transform: props.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          alignSelf: 'center',
        }}
        onClick={() => props.setExpanded(!props.isExpanded)}
        aria-label={props.isExpanded ? t('Collapse') : t('Expand')}
      />
    </Icon>
  );
}
