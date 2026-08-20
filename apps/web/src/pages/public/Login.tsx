import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Fingerprint, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Logo } from "../../components/layout/PublicLayout";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      const next = params.get("next");
      const dest = next ?? (user.role === "RESEARCHER" ? "/researcher" : user.role === "ORGANIZATION" ? "/organization" : user.role === "ADMIN" ? "/admin" : "/");
      navigate(dest);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-10">
        <Logo />
      </div>

      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-xl font-medium tracking-tight text-paper">Welcome back</h1>
          <p className="mt-1 text-sm text-fog">Log in to continue hunting or managing programs.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
              <Input
                className="pl-9"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </Field>
          <Field label="Password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
              <PasswordInput
                className="pl-9"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </Field>

          {error && (
            <div className="rounded-sm border border-coral-red/20 bg-coral-red/5 px-4 py-3 text-sm text-coral-red">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <Fingerprint className="h-4 w-4" /> Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fog">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-paper hover:text-bone">
            Create one <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </p>
      </div>

      <p className="mt-10 font-mono text-[10px] uppercase tracking-wider text-ash">
        Ethereum Sepolia · Testnet only
      </p>
    </div>
  );
}