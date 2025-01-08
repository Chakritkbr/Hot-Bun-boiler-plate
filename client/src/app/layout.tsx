import type { Metadata } from 'next';
import './globals.css';
import Nav from './components/Nav';

export const metadata: Metadata = {
  title: 'Hotbun',
  description: 'The best Online bakery in The world',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='bg-bg-nav'>
        <Nav />
        {children}
      </body>
    </html>
  );
}
