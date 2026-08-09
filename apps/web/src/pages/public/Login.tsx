import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Fingerprint, Mail, Lock } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
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
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full">
        <CardBody className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">Log in</h1>
            <p className="mt-1 text-sm text-ink-dim">Access your researcher or organization dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
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
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  className="pl-9"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </Field>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <Fingerprint className="h-4 w-4" /> Log in
            </Button>
          </form>

          <p className="text-center text-sm text-ink-dim">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent hover:underline">
              Register
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
