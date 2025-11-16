import { LoginForm } from "@/features/auth/components/login-form";
import { requireUnAuth } from "@/lib/auth-utils";

async function LoginPage() {
  await requireUnAuth();
  return <LoginForm />;
}

export default LoginPage;
