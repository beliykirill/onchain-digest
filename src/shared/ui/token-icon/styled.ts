import Image from 'next/image';
import styled from 'styled-components';
import { prop } from 'styled-tools';
import { color } from 'shared/lib/themes';
import { type TextProps, smallTextStyle } from 'shared/ui/text';

export const Layout = styled.span<{ $size: number }>`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: ${prop('$size')}px;
  height: ${prop('$size')}px;
`;

export const TokenImage = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: ${color('surfaceRaised')};
`;

export const FallbackText = styled.span.attrs<TextProps>({ $textTheme: 'bold' })<
  TextProps & { $hue: number }
>`
  ${smallTextStyle};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: hsl(${prop('$hue')} 70% 45% / 0.16);
  color: hsl(${prop('$hue')} 70% 52%);
  text-transform: uppercase;
`;

export const ChainImage = styled(Image)`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  border: 2px solid ${color('surfaceCard')};
  background: ${color('surfaceCard')};
`;
