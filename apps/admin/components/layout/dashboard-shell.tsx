'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
}

export function DashboardShell({
  children,
  title,
  description,
  headerActions,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} description={description}>
          {headerActions}
        </Header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
