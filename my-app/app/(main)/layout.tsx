import { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ds-shell flex min-h-screen flex-col bg-[var(--bg-main)]">
      <Navbar />
      <main className="app-fade-in flex-1">{children}</main>
      <Footer />
    </div>
  );
}
