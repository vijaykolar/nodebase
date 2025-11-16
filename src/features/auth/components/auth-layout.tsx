import Image from "next/image";
import { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-muted flex justify-center items-center min-h-svh p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          NodeBase.
        </div>
        {children}
      </div>
    </div>
  );
};
