import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, UserRound, ArrowRight } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../../components/ui/Button";
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
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-14 sm:py-20">
      <div className="mb-10">
        <Logo />
      </div>

      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-xl font-medium tracking-tight text-paper">Create your account</h1>
          <p className="mt-1 text-sm text-fog">Join as a researcher or an organization.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {(
            [
              { t: "RESEARCHER", label: "Researcher", icon: <UserRound className="h-4 w-4" />, desc: "Find vulnerabilities" },
              { t: "ORGANIZATION", label: "Organization", icon: <Building2 className="h-4 w-4" />, desc: "Launch programs" },
            ] as const
          ).map(({ t, label, icon, desc }) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-sm border px-4 py-3.5 text-left transition-all duration-150",
                type === t
                  ? "border-acid-lime/50 bg-acid-lime/5"
                  : "border-graphite bg-transparent hover:border-smoke",
              )}
            >
              <span className={cn("flex h-4 items-center", type === t ? "text-acid-lime" : "text-fog")}>
                {icon}
              </span>
              <span className={cn("text-sm font-medium", type === t ? "text-paper" : "text-mist")}>{label}</span>
              <span className="text-[11px] text-ash">{desc}</span>
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
            <div className="rounded-sm border border-coral-red/20 bg-coral-red/5 px-4 py-3 text-sm text-coral-red">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fog">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-paper hover:text-bone">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}