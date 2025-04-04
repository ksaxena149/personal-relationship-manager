import AppLayout from '@/components/layout/AppLayout';

export default function RemindersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
} 