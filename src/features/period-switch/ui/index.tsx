import type { FC } from 'react';
import { useWalletParams } from 'shared/lib/hooks';
import type { Period } from 'shared/types';
import { SegmentedControl } from 'shared/ui/segmented-control';

export const PeriodSwitch: FC = () => {
  const { period, setPeriod } = useWalletParams();

  return (
    <SegmentedControl<Period>
      options={[
        { value: '1d', label: '24h' },
        { value: '7d', label: '7d' },
      ]}
      value={period}
      onChange={setPeriod}
    />
  );
};
