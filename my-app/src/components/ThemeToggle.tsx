'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
      title="Toggle dark/light mode"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-white" />
      ) : (
        <Moon className="h-4 w-4 text-white" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
