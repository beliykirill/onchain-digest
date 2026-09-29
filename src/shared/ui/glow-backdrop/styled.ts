import styled, { keyframes } from 'styled-components';
import { color, media, MediaType } from 'shared/lib/themes';

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
`;

const rotateAnimation = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

const breatheAnimation = keyframes`
  0% {
    opacity: 0.55;
    transform: translate3d(-10%, -4%, 0) scale(0.9);
  }

  50% {
    opacity: 1;
    transform: translate3d(8%, 6%, 0) scale(1.12);
  }

  100% {
    opacity: 0.7;
    transform: translate3d(-4%, 10%, 0) scale(1);
  }
`;

export const GlowBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  animation: ${fadeInAnimation} 1.2s ease-out both;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    border-radius: 50%;
    will-change: transform, opacity;
  }

  &::before {
    top: -38vmax;
    width: 96vmax;
    height: 96vmax;
    margin-left: -48vmax;
    background: conic-gradient(
      ${color('positive', 0.38)},
      ${color('accent', 0.34)},
      ${color('negative', 0.3)},
      ${color('accent', 0.2)},
      ${color('positive', 0.38)}
    );
    filter: blur(80px);
    mask-image: radial-gradient(circle, #000 25%, transparent 70%);
    animation: ${rotateAnimation} 16s linear infinite;
  }

  &::after {
    top: -6vmax;
    width: 48vmax;
    height: 48vmax;
    margin-left: -8vmax;
    background: radial-gradient(
      circle,
      ${color('negative', 0.26)} 0%,
      ${color('accent', 0.14)} 45%,
      transparent 70%
    );
    animation: ${breatheAnimation} 9s ease-in-out infinite alternate;
  }

  ${media(MediaType.MOBILE)} {
    &::before {
      top: -28vmax;
    }

    &::after {
      top: 10vmax;
      margin-left: -30vmax;
    }
  }
`;
