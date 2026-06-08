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
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { getStoredAdmin, isSuperAdmin } from '@/lib/auth';
import { useLogout } from '@/lib/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4">
        <Link href={ROUTES.MUSEUMS} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">
              {t('common.appName')}
            </span>
          )}
        </Link>
        {onCollapse && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={onCollapse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User info + logout */}
      <div className="p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2',
            collapsed && 'justify-center'
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {admin?.email?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{admin?.email}</p>
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
              className="h-8 w-8 shrink-0"
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
        'hidden border-r bg-card transition-all duration-300 lg:block',
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
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
