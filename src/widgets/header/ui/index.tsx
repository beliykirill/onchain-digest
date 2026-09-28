import type { FC } from 'react';
import { AddressSearch } from 'features/address-search';
import { ThemeToggle } from 'features/theme-toggle';
import { useWalletParams } from 'shared/lib/hooks';
import { Container, Layout, LogoIcon, LogoLink, LogoText, SearchContainer } from './styled';

export const Header: FC = () => {
  const { rawAddress, address } = useWalletParams();

  return (
    <Layout>
      <Container>
        <LogoLink href="/">
          <LogoIcon />
          <LogoText $textTheme="bold">since yesterday</LogoText>
        </LogoLink>
        {address && (
          <SearchContainer>
            <AddressSearch key={rawAddress} type="compact" />
          </SearchContainer>
        )}
        <ThemeToggle />
      </Container>
    </Layout>
  );
};
