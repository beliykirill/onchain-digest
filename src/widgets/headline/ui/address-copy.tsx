import { type FC, useEffect, useState } from 'react';
import { shortenAddress } from 'shared/lib';
import { useWalletParams } from 'shared/lib/hooks';
import { cdnify } from 'shared/lib/themes';
import { AddressButton, AddressIcon } from './styled';

export const AddressCopy: FC = () => {
  const { rawAddress } = useWalletParams();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timer = setTimeout(() => setIsCopied(false), 1600);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawAddress);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <AddressButton type="button" $type="secondary" title={rawAddress} onClick={handleCopy}>
      {isCopied ? 'Copied' : shortenAddress(rawAddress)}
      <AddressIcon
        $icon={cdnify(
          isCopied ? '/static/images/common/check.svg' : '/static/images/common/copy.svg',
        )}
      />
    </AddressButton>
  );
};
