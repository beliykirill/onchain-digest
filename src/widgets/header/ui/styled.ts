import Link from 'next/link';
import styled from 'styled-components';
import { color, media, MediaType } from 'shared/lib/themes';
import { MainText } from 'shared/ui/text';

export const Layout = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid ${color('surfaceStroke', 0.7)};
  background: ${color('surfaceBackground', 0.82)};
  backdrop-filter: saturate(1.4) blur(12px);
  -webkit-backdrop-filter: saturate(1.4) blur(12px);
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
  min-height: 64px;
  margin: 0 auto;
  padding: 10px 24px;

  ${media(MediaType.MOBILE)} {
    flex-wrap: wrap;
    padding: 10px 16px;
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

export const SearchContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  min-width: 0;

  ${media(MediaType.MOBILE)} {
    flex-basis: 100%;
    order: 3;
  }
`;
