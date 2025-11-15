import { requireUnAuth } from "@/lib/auth-utils";
import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  await requireUnAuth();
  return <div>{children}</div>;
};

export default Layout;
