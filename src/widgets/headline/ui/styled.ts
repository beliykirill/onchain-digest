import styled from 'styled-components';
import { ifProp, prop, switchProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { numericStyle } from 'shared/ui/atoms';
import { Button } from 'shared/ui/button';
import { HeadlineText, SecondaryText } from 'shared/ui/text';

export const Layout = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MetaContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Container = styled.div<{ $isStale: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 150px;
  opacity: ${ifProp('$isStale', 0.55, 1)};
  transition: opacity 0.2s ease;

  ${media(MediaType.MOBILE)} {
    min-height: 124px;
  }
`;

export const SummaryText = styled(HeadlineText)`
  max-width: 900px;
  text-wrap: balance;
`;

export const ChangeText = styled.span<{ $isPositive: boolean }>`
  ${numericStyle};
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.18em;
  color: ${ifProp('$isPositive', color('positive'), color('negative'))};
  transition: color 0.2s ease;
`;

export const ChangeIcon = styled.span<{ $icon: string }>`
  display: inline-block;
  align-self: center;
  width: 0.72em;
  height: 0.72em;
  background: currentColor;
  mask: url(${prop('$icon')}) no-repeat center / contain;
`;

export const PercentText = styled.span`
  margin-left: 0.2em;
  opacity: 0.75;
  white-space: nowrap;
`;

export const BreakdownText = styled(SecondaryText)`
  ${numericStyle};
`;

export const BreakdownValueText = styled.span<{ $trend: number }>`
  color: ${switchProp(
    '$trend',
    {
      1: color('positive'),
      '-1': color('negative'),
    },
    'inherit',
  )};
`;

export const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 150px;

  ${media(MediaType.MOBILE)} {
    min-height: 124px;
  }
`;

export const AddressButton = styled(Button)`
  ${numericStyle};
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
`;

export const AddressIcon = styled.span<{ $icon: string }>`
  width: 14px;
  height: 14px;
  background: currentColor;
  mask: url(${prop('$icon')}) no-repeat center / contain;
`;
