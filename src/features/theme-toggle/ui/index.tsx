import type { FC } from 'react';
import { cdnify } from 'shared/lib/themes';
import { HiddenText, ThemeIcon, ToggleButton } from './styled';

export const ThemeToggle: FC = () => {
  const handleToggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';

    root.dataset.theme = next;

    try {
      localStorage.setItem('theme', next);
    } catch {
      return;
    }
  };

  return (
    <ToggleButton type="button" title="Toggle theme" onClick={handleToggle}>
      <ThemeIcon $theme="light" $icon={cdnify('/static/images/common/moon.svg')} />
      <ThemeIcon $theme="dark" $icon={cdnify('/static/images/common/sun.svg')} />
      <HiddenText>Toggle theme</HiddenText>
    </ToggleButton>
  );
};
