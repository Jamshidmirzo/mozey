'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import {
  Building2,
  Landmark,
  MapPin,
  Users,
  ScrollText,
  Bell,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { getStoredAdmin, isSuperAdmin } from '@/lib/auth';
import { useLogout } from '@/lib/hooks/use-auth';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  superadminOnly?: boolean;
}

function useNavItems(): NavItem[] {
  const t = useTranslations('nav');
  return [
    { href: ROUTES.REGIONS, label: t('regions'), icon: MapPin },
    { href: ROUTES.MUSEUMS, label: t('museums'), icon: Building2 },
    { href: ROUTES.HISTORICAL_PLACES, label: t('historicalPlaces'), icon: Landmark },
    { href: ROUTES.NOTIFICATIONS, label: t('notifications'), icon: Bell },
    { href: ROUTES.ADMINS, label: t('admins'), icon: Users, superadminOnly: true },
    { href: ROUTES.AUDIT_LOG, label: t('auditLog'), icon: ScrollText, superadminOnly: true },
  ];
}

function SidebarContent({ collapsed, onCollapse }: { collapsed: boolean; onCollapse?: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();
  const navItems = useNavItems();
  const admin = getStoredAdmin();
  const superAdmin = isSuperAdmin();
  const logout = useLogout();

  const filteredItems = navItems.filter(
    (item) => !item.superadminOnly || superAdmin
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <Link href={ROUTES.MUSEUMS} className="flex items-center gap-3 ios-press">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 ios-shadow-sm">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-[17px] font-bold tracking-tight">
              {t('common.appName')}
            </span>
          )}
        </Link>
        {onCollapse && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 rounded-lg"
            onClick={onCollapse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 pt-4">
        {filteredItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-200 ease-ios ios-press',
                isActive
                  ? 'bg-primary/10 text-primary ios-shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-[22px] w-[22px] shrink-0', isActive && 'text-primary')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl bg-secondary/50 px-3 py-3',
            collapsed && 'justify-center bg-transparent'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-bold text-primary">
            {admin?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold">{admin?.email}</p>
              <p className="truncate text-xs text-muted-foreground">
                {admin?.role === 'superadmin'
                  ? t('admins.superadmin')
                  : t('admins.editor')}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
              onClick={() => logout.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        'hidden glass transition-all duration-300 ease-ios lg:block border-r-0',
        collapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 glass border-r-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
