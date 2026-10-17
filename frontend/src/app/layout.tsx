import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Tracker — Medical Administration Dashboard',
  description: 'Secure administrative web application for managing doctors, patients, and operational analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
