import { useTranslation } from 'react-i18next';
import { getPatternflyColor, PFColorE } from '../../../../framework';
import { CodeBlock } from '@patternfly/react-core';
import { CollectionImport } from '../../collections/Collection';
import styled from 'styled-components';

const EmptyImportConsole = styled.div`
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

export type ScrollToType = (direction: 'up' | 'down') => void;

export interface ImportConsoleProps {
  collectionImport?: CollectionImport;
  scrollTo?: ScrollToType;
  minMessagesToShowNavigationArrows?: number;
}

export function ImportConsole({
  collectionImport,
  scrollTo,
  minMessagesToShowNavigationArrows = 1,
}: ImportConsoleProps) {
  const { t } = useTranslation();

  return (
    <CodeBlock
      style={{
        backgroundColor: 'var(--pf-v5-global--palette--black-850)',
        position: 'relative',
      }}
      data-cy="import-console"
    >
      {collectionImport ? (
        <>
          {collectionImport.messages &&
            collectionImport.messages?.length >= minMessagesToShowNavigationArrows && (
              <>
                <NavigationArrow direction="down" onClick={() => scrollTo?.('down')} />

                <NavigationArrow direction="up" onClick={() => scrollTo?.('up')} />
              </>
            )}
          {collectionImport.messages?.map((message, index) => (
            <div
              key={index}
              style={{
                color: getColor(message.level),
              }}
            >
              {message.message}
            </div>
          ))}
          <br />
          <ImportConsoleResultStatus state={collectionImport.state} />
        </>
      ) : (
        <EmptyImportConsole>{t`No data`}</EmptyImportConsole>
      )}
    </CodeBlock>
  );
}

function getColor(messageLevel: string) {
  const res = getPatternflyColor(
    messageLevel === 'WARNING'
      ? PFColorE.Warning
      : messageLevel === 'ERROR'
        ? PFColorE.Danger
        : PFColorE.Disabled
  );

  if (messageLevel === 'INFO') {
    return 'white';
  }
  return res;
}

const arrowStyle = `
  color: white;
  &:hover {
    cursor: pointer;
  }
  position: absolute;
  margin-bottom: 10px;
  margin-right: 10px;
  font-size: 120%;
`;

const StyledArrowDown = styled.div`
  ${arrowStyle}
  right: 0; /* Aligns the icon to the right */
  top: 0; /* Aligns the icon to the top */
`;

const StyledArrowUp = styled.div`
  ${arrowStyle}
  right: 0;
  bottom: 0;
`;

function NavigationArrow(props: { direction: 'up' | 'down'; onClick: () => void }) {
  const className = `fa fa-arrow-circle-${props.direction} clickable`;

  const Component = props.direction === 'up' ? StyledArrowUp : StyledArrowDown;

  return (
    <Component>
      <span
        role="button"
        onClick={() => {
          props.onClick();
        }}
        onKeyDown={(event) => {
          // Trigger click on Enter key
          if (event.key === 'Enter') {
            props.onClick();
          }
        }}
        tabIndex={props.direction === 'up' ? 0 : 1} // Make the element focusable
        className={className}
      />
    </Component>
  );
}

const ImportConsoleResultStatus = ({ state }: { state: string }) => {
  const { t } = useTranslation();

  if (!['completed', 'failed'].includes(state)) return <></>;

  const isCompleted = state === 'completed';

  return (
    <div
      key={isCompleted ? 'done' : 'failed'}
      style={{
        color: getPatternflyColor(isCompleted ? PFColorE.Green : PFColorE.Danger),
      }}
    >
      {isCompleted ? t`Done` : t`Failed`}
    </div>
  );
};
