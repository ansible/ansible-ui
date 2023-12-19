import { Button, Popover, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

export function Help(props: {
  title?: string;
  help?: string | string[] | ReactNode;
  docLink?: string;
  marginLeft?: string;
}) {
  const { help, title, docLink, marginLeft } = props;
  const [translations] = useFrameworkTranslations();
  if (!help) return <></>;
  return (
    <Popover
      headerContent={title}
      bodyContent={
        <Stack hasGutter>
          {Array.isArray(help) ? (
            help.map((help, index) => <StackItem key={index}>{help}</StackItem>)
          ) : (
            <StackItem>{help}</StackItem>
          )}
          {docLink && (
            <StackItem>
              <Button
                icon={<ExternalLinkAltIcon />}
                variant="link"
                onClick={() => window.open(docLink, '_blank')}
                isInline
              >
                {translations.documentation}
              </Button>
            </StackItem>
          )}
        </Stack>
      }
    >
      <Button
        variant="plain"
        style={{ padding: 0, marginLeft: marginLeft || '8px', verticalAlign: 'middle' }}
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  );
}
