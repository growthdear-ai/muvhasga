'use client';

import React from 'react';
import './globals.css';
import { DealRoomProvider } from '@/hooks/useDealRoom';
import { Navigation } from '@/components/Navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>DealRoom - AI Deal Desk Agent</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <DealRoomProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <div className="flex-1 pl-64 min-h-screen w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </DealRoomProvider>
      </body>
    </html>
  );
}
