import styled from 'styled-components';
import { media, MediaType } from 'shared/lib/themes';

export const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100svh;
`;

export const PageContainer = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 24px 64px;

  ${media(MediaType.MOBILE)} {
    gap: 16px;
    padding: 16px 16px 48px;
  }
`;

export const DetailsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 24px;

  ${media(MediaType.MOBILE)} {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
`;
