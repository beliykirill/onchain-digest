import type { FC } from 'react';
import { LOCAL_STORAGE } from 'shared/constants';
import { cdnify } from 'shared/lib/themes';
import { HiddenText, ThemeButton, ThemeIcon } from './styled';

export const ThemeToggle: FC = () => {
  const handleToggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';

    root.dataset.theme = next;

    try {
      localStorage.setItem(LOCAL_STORAGE.THEME, next);
    } catch {
      return;
    }
  };

  return (
    <ThemeButton type="button" title="Toggle theme" onClick={handleToggle}>
      <ThemeIcon $type="light" $icon={cdnify('/static/images/common/moon.svg')} />
      <ThemeIcon $type="dark" $icon={cdnify('/static/images/common/sun.svg')} />
      <HiddenText>Toggle theme</HiddenText>
    </ThemeButton>
  );
};
