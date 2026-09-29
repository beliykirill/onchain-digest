import { type FC, useState } from 'react';
import type { Nullable } from 'shared/types';
import { ChainImage, FallbackText, Layout, TokenImage } from './styled';

interface TokenIconProps {
  symbol: string;
  iconUrl: Nullable<string>;
  chainIconUrl?: Nullable<string>;
  chainName?: string;
  size?: number;
}

export const TokenIcon: FC<TokenIconProps> = ({
  symbol,
  iconUrl,
  chainIconUrl,
  chainName,
  size = 36,
}) => {
  const [failedUrl, setFailedUrl] = useState<Nullable<string>>(null);
  const [failedChainUrl, setFailedChainUrl] = useState<Nullable<string>>(null);

  return (
    <Layout $size={size}>
      {iconUrl && failedUrl !== iconUrl ? (
        <TokenImage
          src={iconUrl}
          alt={symbol}
          width={size}
          height={size}
          unoptimized
          onError={() => setFailedUrl(iconUrl)}
        />
      ) : (
        <FallbackText
          $hue={[...symbol].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 360, 17)}
        >
          {symbol.slice(0, 1)}
        </FallbackText>
      )}
      {chainIconUrl && failedChainUrl !== chainIconUrl && (
        <ChainImage
          src={chainIconUrl}
          alt={chainName ?? ''}
          width={Math.round(size * 0.4)}
          height={Math.round(size * 0.4)}
          unoptimized
          onError={() => setFailedChainUrl(chainIconUrl)}
        />
      )}
    </Layout>
  );
};
