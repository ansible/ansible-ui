import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { ReactNode, CSSProperties, useMemo } from 'react';

interface IProps {
  children: ReactNode;
  'data-cy'?: string;
  href: string;
  variant?: 'default' | 'download' | 'menu' | 'nav';
  target?: string;
  rel?: string;
}

const getIconStyle = (variant: string): CSSProperties => {
  const styles: Record<string, CSSProperties> = {
    nav: { position: 'absolute', right: '32px', top: '22px', fontSize: 'smaller' },
    download: { display: 'none' },
    default: { fontSize: 'smaller' },
    menu: { fontSize: 'smaller' },
  };

  return styles[variant] || styles.default;
};

const classNames = {
  nav: 'pf-c-nav__link',
  menu: 'pf-c-dropdown__menu-item',
  default: undefined,
  download: undefined,
};

export const ExternalLink = ({
  children,
  'data-cy': dataCy,
  href,
  variant = 'default',
}: IProps) => {
  const iconStyle = useMemo(() => getIconStyle(variant), [variant]);
  const className = useMemo(() => classNames[variant] || classNames.default, [variant]);

  // Conditional return after hooks
  if (!href || !children) {
    return null;
  }

  return (
    <a
      className={className}
      data-cy={dataCy}
      href={href}
      rel="nofollow noopener noreferrer"
      target="_blank"
    >
      {children && <ExternalLinkAltIcon style={iconStyle} />}
    </a>
  );
};
