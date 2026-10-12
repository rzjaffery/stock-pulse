// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'StockPulse | Royal Emerald Logistics',
    description: 'Enterprise Inventory Management System',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#020805] text-slate-100 antialiased`}>
        {children}
        </body>
        </html>
    );
}