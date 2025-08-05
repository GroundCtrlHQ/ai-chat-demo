import './globals.css';

export const metadata = {
  title: 'Rorie Marketing Expert',
  description: 'OpenRouter + Vercel AI SDK chat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
