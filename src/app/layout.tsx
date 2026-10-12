// src/app/layout.tsx
import type { Metadata } from 'next';
import { Libre_Caslon_Condensed, Inter } from 'next/font/google';
import './globals.css';

const libreCaslon = Libre_Caslon_Condensed({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-libre-caslon',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'StockPulse | Enterprise Logistics',
    description: 'Royal Emerald Light Theme Inventory System',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${libreCaslon.variable} ${inter.variable}`}>
        <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
        </body>
        </html>
    );
}