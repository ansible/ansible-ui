import { Flex, FlexItem } from '@patternfly/react-core';
import { useSettings } from '../Settings';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

export function CapacityCell(props: { format?: string; used: number; capacity: number }) {
  const [translations] = useFrameworkTranslations();
  const settings = useSettings();
  const ratio = props.used / props.capacity;
  if (props.capacity === 0) return <></>;
  const base =
    ratio >= 0.8
      ? 'var(--pf-global--palette--red'
      : ratio >= 0.5
      ? 'var(--pf-global--palette--gold'
      : 'var(--pf-global--palette--green';
  const color1 = settings.activeTheme === 'light' ? `${base}-100)` : `${base}-600)`;
  const color2 = settings.activeTheme === 'light' ? `${base}-400)` : `${base}-200)`;
  const borderColor = settings.activeTheme === 'light' ? `#0002` : `#fff2`;
  return (
    <Flex alignItems={{ default: 'alignItemsBaseline' }} spaceItems={{ default: 'spaceItemsSm' }}>
      {props.capacity > 0 && (
        <FlexItem>
          <div
            style={{
              width: 18,
              height: 25,
              background: color1,
              marginBottom: -9,
              paddingTop: Math.max(
                0,
                Math.min(25, (25 * (props.capacity - props.used)) / props.capacity)
              ),
              borderRadius: 2,
              border: `thin solid ${borderColor}`,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: color2,
                borderRadius: 2,
              }}
            ></div>
          </div>
        </FlexItem>
      )}
      {props.format ? (
        <FlexItem>
          {props.format
            .replace('{used}', props.used.toString())
            .replace('{capacity}', props.capacity.toString())}
        </FlexItem>
      ) : (
        <FlexItem>
          {props.used}
          {` ${translations.ofText} `}
          {props.capacity}
        </FlexItem>
      )}
    </Flex>
  );
}
