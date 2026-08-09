import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, UserRound } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { Logo } from "../../components/layout/PublicLayout";
import { cn } from "../../lib/utils";

type AccountType = "RESEARCHER" | "ORGANIZATION";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<AccountType>("RESEARCHER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    researcherHandle: "",
    orgName: "",
    orgWebsite: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await register({
        email: form.email,
        password: form.password,
        name: form.name,
        role: type,
        researcherHandle: type === "RESEARCHER" ? form.researcherHandle : undefined,
        orgName: type === "ORGANIZATION" ? form.orgName : undefined,
        orgWebsite: type === "ORGANIZATION" ? form.orgWebsite || undefined : undefined,
      });
      toast.success("Account created");
      navigate(type === "RESEARCHER" ? "/researcher" : "/organization", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full">
        <CardBody className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-ink-dim">Join as a security researcher or an organization</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { t: "RESEARCHER", label: "Researcher", icon: <UserRound className="h-5 w-5" /> },
                { t: "ORGANIZATION", label: "Organization", icon: <Building2 className="h-5 w-5" /> },
              ] as const
            ).map(({ t, label, icon }) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                  type === t
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-ink-dim hover:border-border-strong",
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Full name">
              <Input required value={form.name} onChange={set("name")} placeholder="Ada Lovelace" />
            </Field>
            <Field label="Email">
              <Input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </Field>
            <Field label="Password" hint="At least 8 characters">
              <Input type="password" required minLength={8} value={form.password} onChange={set("password")} placeholder="••••••••" />
            </Field>

            {type === "RESEARCHER" && (
              <Field label="Researcher handle" hint="Public username for the platform">
                <Input required minLength={3} value={form.researcherHandle} onChange={set("researcherHandle")} placeholder="whitehat_alice" />
              </Field>
            )}

            {type === "ORGANIZATION" && (
              <>
                <Field label="Organization name">
                  <Input required value={form.orgName} onChange={set("orgName")} placeholder="Acme Security" />
                </Field>
                <Field label="Website (optional)">
                  <Input type="url" value={form.orgWebsite} onChange={set("orgWebsite")} placeholder="https://acme.com" />
                </Field>
              </>
            )}

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-ink-dim">
            Already registered?{" "}
            <Link to="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
