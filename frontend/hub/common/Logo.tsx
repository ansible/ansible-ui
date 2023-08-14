import { useEffect, useState } from 'react';
import { CSSProperties } from 'styled-components';
import { AnsibleTowerIcon } from '@patternfly/react-icons';

interface LogoProps {
  // size should be css length measurment: eg. '100px'
  size: string;
  width?: string;
  image: string | null;
  alt: string;
  className?: string;
  unlockWidth?: boolean;
  fallbackToDefault?: boolean;
  flexGrow?: boolean;
}

export function Logo(props: LogoProps) {
  const { size, width, image, alt, className, unlockWidth, fallbackToDefault, flexGrow } = props;

  const [failed, setFailed] = useState<boolean>(false);

  const [style, setStyle] = useState<CSSProperties>({
    height: size,
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'left',
    width: width,
  });

  useEffect(() => {
    if (flexGrow) {
      setStyle({ ...style, flexGrow: 1 });
    }

    if (unlockWidth) {
      setStyle({ ...style, minWidth: size });
    } else {
      setStyle({ ...style, width: size });
    }
  }, [flexGrow, size, style, unlockWidth]);

  return (
    <div className={className} style={style}>
      {failed || image === null ? (
        <AnsibleTowerIcon />
      ) : (
        <img
          style={{ objectFit: 'contain', maxHeight: size }}
          src={image}
          alt={alt}
          onError={fallbackToDefault ? () => setFailed(true) : () => null}
        />
      )}
    </div>
  );
}
