import styled, { keyframes } from 'styled-components';
import { prop } from 'styled-tools';
import { color } from 'shared/lib/themes';

const shimmer = keyframes`
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
`;

export const Skeleton = styled.span<{ $width?: string; $height: string; $radius?: string }>`
  display: block;
  flex-shrink: 0;
  width: ${prop('$width', '100%')};
  height: ${prop('$height')};
  border-radius: ${prop('$radius', '8px')};
  background: linear-gradient(
    90deg,
    ${color('surfaceSkeleton')} 0%,
    ${color('surfaceSkeleton', 0.5)} 50%,
    ${color('surfaceSkeleton')} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;
