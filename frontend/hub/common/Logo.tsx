import { useEffect, useState } from 'react';
import { CSSProperties } from 'styled-components';
import { AnsibleTowerIcon } from '@patternfly/react-icons';

interface LogoProps {
  // size and width should be css length measurment: eg. '48px'
  logoSize: string;
  width?: string;
  image: string | null;
  alt: string;
  className?: string;
  unlockWidth?: boolean;
  fallbackToDefault?: boolean;
  flexGrow?: boolean;
}

export function Logo(props: LogoProps) {
  const { logoSize, width, image, alt, className, unlockWidth, fallbackToDefault, flexGrow } =
    props;

  const [failed, setFailed] = useState<boolean>(false);

  const [style, setStyle] = useState<CSSProperties>({
    height: logoSize,
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'left',
    width: width,
  });

  useEffect(() => {
    if (flexGrow) {
      setStyle((prevStyle) => ({ ...prevStyle, flexGrow: 1 }));
    }

    if (unlockWidth) {
      setStyle((prevStyle) => ({ ...prevStyle, minWidth: logoSize }));
    } else {
      setStyle((prevStyle) => ({ ...prevStyle, width: logoSize }));
    }
  }, [flexGrow, logoSize, unlockWidth]);

  return (
    <div className={className} style={style}>
      {failed || image === null ? (
        <AnsibleTowerIcon style={{ height: '100%', width: '100%' }} />
      ) : (
        <img
          style={{ objectFit: 'contain', height: logoSize }}
          src={image}
          alt={alt}
          onError={fallbackToDefault ? () => setFailed(true) : () => null}
        />
      )}
    </div>
  );
}
