import { SignupForm } from "@/features/auth/components/signup-form";
import { requireUnAuth } from "@/lib/auth-utils";

export default async function SignUpPage() {
  return (
    <div>
      <SignupForm />
    </div>
  );
}
