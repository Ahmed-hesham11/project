import { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Section className="ds-shell flex min-h-screen items-center justify-center">
      <Container className="app-fade-in w-full max-w-md sm:max-w-lg">{children}</Container>
    </Section>
  );
}
