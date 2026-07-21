
import type { ReactNode } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import './Layout.css';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <main className="main">{children}</main>
      <Footer />
    </div>
  );
}