import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  'data-cy'?: string;
  href: string;
  variant?: 'default' | 'download' | 'menu' | 'nav';
}

// variants:
// download - no external link icon (role download)
// menu - top nav question mark menu (Customer Support, Training)
// nav - left side nav (Documentation, Terms of Use)
// default - everywhere else

export const ExternalLink = ({
  children,
  'data-cy': dataCy,
  href,
  variant = 'default',
}: IProps) => {
  if (!href || !children) {
    return null;
  }

  const iconStyle: Record<string, string> = {
    nav: { position: 'absolute', right: '32px', top: '22px' },
    download: { display: 'none' },
  }[variant];
  const className = {
    nav: 'pf-c-nav__link',
    menu: 'pf-c-dropdown__menu-item',
  }[variant];

  return (
    <a
      className={className}
      data-cy={dataCy}
      href={href}
      rel="nofollow noopener noreferrer"
      target="_blank"
    >
      {children} <ExternalLinkAltIcon style={{ fontSize: 'smaller', ...iconStyle }} />
    </a>
  );
};
