import styled from 'styled-components';
import { media, MediaType } from 'shared/lib/themes';
import { HeadlineText, SecondaryText } from 'shared/ui/text';

export const Layout = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 72px 0 96px;
  text-align: center;

  ${media(MediaType.MOBILE)} {
    align-items: stretch;
    justify-content: flex-start;
    padding: 32px 0 48px;
    text-align: left;
  }
`;

export const TitleText = styled(HeadlineText)`
  max-width: 720px;
  text-wrap: balance;
`;

export const SubtitleText = styled(SecondaryText)`
  max-width: 520px;
  margin-bottom: 16px;
  text-wrap: pretty;
`;
