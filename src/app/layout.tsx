// src/app/layout.tsx
import {
    ClerkProvider,
    OrganizationSwitcher,
    Show,
    SignInButton,
    SignUpButton,
    UserButton,
} from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="bg-slate-950 text-slate-100 antialiased">
        <ClerkProvider>
            <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-white">StockPulse SaaS</span>
                    <Show when="signed-in">
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    organizationSwitcherTrigger:
                                        'bg-slate-800 text-slate-200 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm',
                                },
                            }}
                        />
                    </Show>
                </div>
                <div className="flex items-center gap-3">
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="text-sm text-slate-300 hover:text-white">Sign in</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                                Sign up
                            </button>
                        </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                        <UserButton />
                    </Show>
                </div>
            </nav>
            {children}
        </ClerkProvider>
        </body>
        </html>
    );
}