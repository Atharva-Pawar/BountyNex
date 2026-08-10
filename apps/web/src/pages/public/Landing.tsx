import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bug,
  Coins,
  FileSearch,
  Fingerprint,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
  TrendingUp,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Bounty } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { BountyCard } from "../../components/bounty/BountyCard";
import { useAuth } from "../../providers/AuthProvider";

export function Landing() {
  const { data } = useQuery({
    queryKey: ["landing-bounties"],
    queryFn: async () => (await api.get("/api/bounties?limit=3")) as { items: Bounty[] },
    staleTime: 60_000,
  });

  const featured = data?.items ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="grid-bg relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Ethereum Sepolia · Hybrid on-chain escrow
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Crowdsource security with{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              decentralized bounties
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-dim leading-relaxed">
            BountyNex connects organizations with ethical hackers. Programs are created on-chain,
            rewards are held in escrow by a smart contract, and researchers get paid in ETH the
            moment a valid report is approved.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/bounties">
              <Button size="lg">
                Browse active bounties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline">
                Become a researcher
              </Button>
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            {[
              { label: "On-chain escrow", value: "100%", icon: <Lock className="h-4 w-4" /> },
              { label: "Median reward", value: `${weiToEth("1000000000000000000")} ETH`, icon: <Coins className="h-4 w-4" /> },
              { label: "Testnet only", value: "Sepolia", icon: <Globe className="h-4 w-4" /> },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface/80 p-4 backdrop-blur-sm">
                <div className="flex justify-center text-accent mb-2">{s.icon}</div>
                <p className="text-xl font-bold text-ink">{s.value}</p>
                <p className="text-xs text-ink-dim mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured bounties */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">Featured bounties</h2>
              <p className="text-sm text-ink-dim mt-1">Live programs from verified organizations</p>
            </div>
            <Link to="/bounties" className="text-sm font-medium text-accent hover:underline">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-surface/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink">How it works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-ink-dim">
              A hybrid architecture: normal operations live in a classic web stack, while
              trust-critical reward handling runs on Ethereum.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Bug className="h-6 w-6" />,
                title: "Organizations launch programs",
                body: "Define scope, rules and severity-based rewards. Fund the bounty into a smart contract escrow before it goes live.",
              },
              {
                icon: <FileSearch className="h-6 w-6" />,
                title: "Researchers hunt & report",
                body: "Connect MetaMask, submit vulnerability reports with evidence. Track status in real time from SUBMITTED to REWARDED.",
              },
              {
                icon: <Coins className="h-6 w-6" />,
                title: "Rewards released on-chain",
                body: "On approval, the escrow contract releases ETH directly to the researcher's wallet. Duplicate payments are impossible.",
              },
            ].map((s, i) => (
              <div key={s.title} className="rounded-xl border border-border bg-surface p-6 shadow-card transition-all hover:border-accent/20 hover:shadow-elevated">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {s.icon}
                </div>
                <div className="mb-2 text-xs font-semibold text-accent">Step {i + 1}</div>
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-dim leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-ink">Built for trust</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Lock className="h-5 w-5" />,
              title: "On-chain escrow",
              body: "Rewards are held by the BountyEscrow contract, not the platform.",
            },
            {
              icon: <Fingerprint className="h-5 w-5" />,
              title: "Signed wallet binding",
              body: "Wallets are verified with a cryptographic signature before use.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Role-based access",
              body: "JWT auth with strict per-role authorization on every endpoint.",
            },
            {
              icon: <Globe className="h-5 w-5" />,
              title: "Sepolia testnet",
              body: "Everything runs on testnet ETH. No real money, ever.",
            },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-surface p-6 shadow-card transition-all hover:border-accent/20">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                {s.icon}
              </div>
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-dim leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-surface/60 to-bg py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Wallet className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-ink">Ready to start hunting?</h2>
          <p className="mt-3 text-ink-dim text-lg">
            Create an account, connect your wallet and start earning testnet ETH for finding real
            vulnerabilities.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Create free account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
