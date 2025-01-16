import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import AAPIcon from '../../assets/aap.svg?react';

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

export function CollectionLogo({
  collection,
}: {
  collection: {
    namespace_metadata?: { company: string; avatar_url: string };
    collection_version?: { namespace: string };
  };
}) {
  const { t } = useTranslation();
  return (
    <Logo
      alt={t(
        `${collection.namespace_metadata?.company || collection.collection_version?.namespace} logo`
      )}
      fallbackToDefault
      image={collection.namespace_metadata?.avatar_url ?? null}
      logoSize="48px"
      width="48px"
      flexGrow
    />
  );
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
        <AAPIcon style={{ height: '100%', width: '100%' }} />
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
