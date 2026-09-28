import type { FC } from 'react';
import { AddressSearch } from 'features/address-search';
import { Layout, SubtitleText, TitleText } from './styled';

export const Intro: FC = () => (
  <Layout>
    <TitleText>What changed in your wallet since yesterday?</TitleText>
    <SubtitleText>
      Paste any EVM or Solana address and get the last 24 hours in five seconds: what moved, why,
      and what you did. Read-only, no wallet connection.
    </SubtitleText>
    <AddressSearch type="hero" />
  </Layout>
);
