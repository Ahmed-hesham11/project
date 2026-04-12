import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md sm:max-w-lg">{children}</div>
    </div>
  );
}
