'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './sidebar';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

interface HeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  const t = useTranslations('header');
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass border-b-0 px-5 sm:px-6">
      <MobileSidebar />

      <div className="flex-1">
        {title && (
          <div className="animate-ios-fade-in">
            <h1 className="text-[17px] font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-[13px] text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {children}

        <LocaleSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 ease-ios dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 ease-ios dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('theme')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card min-w-[160px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t('theme')}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-lg">
              <Sun className="mr-2 h-4 w-4 text-amber-500" />
              {t('light')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-lg">
              <Moon className="mr-2 h-4 w-4 text-indigo-400" />
              {t('dark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-lg">
              <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('system')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
