import Link from 'next/link';
import styled from 'styled-components';
import { color, media, MediaType } from 'shared/lib/themes';
import { MainText } from 'shared/ui/text';

export const Layout = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 24px 0;

  ${media(MediaType.MOBILE)} {
    padding: 8px 16px 0;
  }
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1072px;
  min-height: 64px;
  margin: 0 auto;
  padding: 8px 8px 8px 16px;
  border: 1px solid ${color('surfaceStroke', 0.6)};
  border-radius: 20px;
  background: ${color('surfaceCard', 0.55)};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: saturate(1.6) blur(20px);
  -webkit-backdrop-filter: saturate(1.6) blur(20px);

  ${media(MediaType.MOBILE)} {
    flex-wrap: wrap;
    gap: 8px 12px;
    padding: 8px 8px 8px 12px;
    border-radius: 16px;
  }
`;

export const LogoLink = styled(Link)`
  display: inline-flex;
  flex-shrink: 0;
  margin-right: auto;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
  transition: opacity 0.15s ease;

  ${media(MediaType.HOVER)} {
    &:hover {
      opacity: 0.8;
    }
  }
`;

export const LogoIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: conic-gradient(
    from 210deg,
    ${color('positive')},
    ${color('accent')},
    ${color('negative')},
    ${color('positive')}
  );
`;

export const LogoText = styled(MainText)`
  letter-spacing: -0.01em;
`;
