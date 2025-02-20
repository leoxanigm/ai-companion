import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import './globals.css';
import { ProModal } from '@/components/pro-modal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'companion.ai',
  description: 'Chat with famous people as AI companions'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl='/'>
      <html lang='en' suppressHydrationWarning>
        <body
          className={cn(
            'bg-secondary',
            `${geistSans.variable} ${geistMono.variable} antialiased`
          )}>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            {children}
            <ProModal />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
