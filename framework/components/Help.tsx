import { Button, Icon, Popover, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IconButton } from './IconButton';

export function Help(props: {
  title?: string;
  help?: string | string[] | ReactNode;
  docLink?: string;
}) {
  const { help, title, docLink } = props;
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
                type="button"
              >
                {translations.documentation}
              </Button>
            </StackItem>
          )}
        </Stack>
      }
    >
      <IconButtonStyled type="button">
        <Icon size="sm">
          <OutlinedQuestionCircleIcon />
        </Icon>
      </IconButtonStyled>
    </Popover>
  );
}

const IconButtonStyled = styled(IconButton)`
  margin-left: 4px;
`;
