// src/app/layout.tsx
import { ClerkProvider, UserButton, OrganizationSwitcher } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className="bg-slate-950 text-slate-100 antialiased">
            <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-white">StockPulse SaaS</span>
                    <OrganizationSwitcher
                        appearance={{
                            elements: {
                                organizationSwitcherTrigger:
                                    'bg-slate-800 text-slate-200 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm',
                            },
                        }}
                    />
                </div>
                {/* Fix: Removed afterSignOutUrl prop */}
                <UserButton />
            </nav>
            {children}
            </body>
            </html>
        </ClerkProvider>
    );
}