import { Fragment } from 'react';
import { Activity } from 'widgets/activity';
import { BalanceChart } from 'widgets/balance-chart';
import { Header } from 'widgets/header';
import { Headline } from 'widgets/headline';
import { Intro } from 'widgets/intro';
import { Movers } from 'widgets/movers';
import { useWalletParams } from 'shared/lib/hooks';
import { ColumnsWrapper, PageContainer, PageLayout } from 'shared/ui/page';

const Home = () => {
  const { rawAddress, address } = useWalletParams();

  return (
    <PageLayout>
      <Header />
      <PageContainer>
        {address ? (
          <Fragment key={address}>
            <Headline />
            <BalanceChart />
            <ColumnsWrapper>
              <Movers />
              <Activity />
            </ColumnsWrapper>
          </Fragment>
        ) : (
          <Intro key={rawAddress} />
        )}
      </PageContainer>
    </PageLayout>
  );
};

export const getServerSideProps = () => ({ props: {} });

export default Home;
