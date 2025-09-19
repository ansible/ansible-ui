import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertActionLink, Content, ContentVariants } from '@patternfly/react-core';

export interface IndirectRolesAlertProps {
  actionLabel?: string;
  title: ReactNode;
  description: ReactNode;
  style?: React.CSSProperties;
  onOpen: () => void;
}

export function IndirectRolesAlert({
  actionLabel,
  title,
  description,
  style,
  onOpen,
}: IndirectRolesAlertProps) {
  const { t } = useTranslation();
  const actionText = actionLabel || t`View indirectly assigned roles`;
  return (
    <Alert
      isInline
      variant="info"
      style={style}
      title={title}
      actionLinks={<AlertActionLink onClick={onOpen}>{actionText}</AlertActionLink>}
    >
      {description && <Content component={ContentVariants.p}>{description}</Content>}
    </Alert>
  );
}
