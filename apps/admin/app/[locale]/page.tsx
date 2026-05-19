import { redirect } from 'next/navigation';

interface DashboardPageProps {
  params: { locale: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  redirect(`/${params.locale}/museums`);
}
