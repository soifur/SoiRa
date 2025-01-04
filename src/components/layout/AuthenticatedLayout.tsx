import { Navigation } from "@/components/Navigation";
import { ReactNode } from "react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};