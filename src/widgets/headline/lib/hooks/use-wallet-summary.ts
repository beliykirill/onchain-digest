import { useQuery } from '@tanstack/react-query';
import { walletAPI } from 'shared/lib/api';
import { useWalletParams } from 'shared/lib/hooks';

export const useWalletSummary = () => {
  const { address, period } = useWalletParams();

  return useQuery({
    queryKey: ['wallet', address, 'summary', period],
    queryFn: ({ signal }) => walletAPI.getSummary({ address: address ?? '' }, { period }, signal),
    enabled: Boolean(address),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === address ? previous : undefined,
  });
};
