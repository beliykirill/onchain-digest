import type { FC } from 'react';
import { ThemeToggle } from 'features/theme-toggle';
import { Container, Layout, LogoIcon, LogoLink, LogoText } from './styled';

export const Header: FC = () => {
  return (
    <Layout>
      <Container>
        <LogoLink href="/">
          <LogoIcon />
          <LogoText $textTheme="bold">onchain-digest</LogoText>
        </LogoLink>

        <ThemeToggle />
      </Container>
    </Layout>
  );
};
