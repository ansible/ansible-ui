import { Icon } from '@patternfly/react-core';
import { AngleDownIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function ExpandIcon(props: {
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  direction?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}) {
  const { t } = useTranslation();
  return (
    <Icon size={props.size ?? 'md'}>
      <AngleDownIcon
        data-cy="expandable"
        data-testid="expandable"
        style={{
          transform: props.isExpanded
            ? 'rotate(0deg)'
            : props.direction === 'left'
              ? 'rotate(90deg)'
              : 'rotate(-90deg)',
          transition: 'transform 0.2s',
          alignSelf: 'center',
        }}
        onClick={() => props.setExpanded(!props.isExpanded)}
        aria-label={props.isExpanded ? t('Collapse') : t('Expand')}
      />
    </Icon>
  );
}
