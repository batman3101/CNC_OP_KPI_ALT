import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'CNC KPI 관리 시스템',
  description: 'ALMUS TECH CNC 작업자 KPI 관리 시스템',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
