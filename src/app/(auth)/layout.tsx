import { AuthLayout } from "@/features/auth/components/auth-layout";
import { requireUnAuth } from "@/lib/auth-utils";
import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  await requireUnAuth();
  return <AuthLayout>{children}</AuthLayout>;
};

export default Layout;
