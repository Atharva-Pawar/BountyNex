import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bug,
  Coins,
  FileSearch,
  Fingerprint,
  Globe,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Bounty } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { BountyCard } from "../../components/bounty/BountyCard";
import { AnimatedSection } from "../../components/ui/AnimatedSection";

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(16,185,129,0.03),transparent)]" />
        <div className="absolute right-0 top-0 -z-10 h-px w-1/2 bg-gradient-to-l from-accent/20 to-transparent" />

        <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
          <div className="max-w-2xl">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-ink-dim"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Ethereum Sepolia &middot; Hybrid on-chain escrow
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Crowdsource security.
              <br />
              <span className="text-accent">Reward researchers.</span>
              <br />
              On-chain.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-base text-ink-dim leading-relaxed sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              BountyNex connects organizations with ethical hackers. Programs are created on-chain,
              rewards are held in escrow by a smart contract, and researchers get paid in ETH the
              moment a valid report is approved.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
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
            </motion.div>
          </div>

          {/* Animated stats */}
          <motion.div
            className="mt-16 grid max-w-lg grid-cols-3 gap-8 border-t border-border pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { label: "On-chain escrow", value: "100%" },
              { label: "Median reward", value: `${weiToEth("1000000000000000000")} ETH` },
              { label: "Testnet", value: "Sepolia" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              >
                <p className="font-mono text-xl font-semibold text-ink">{s.value}</p>
                <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured bounties */}
      {featured.length > 0 && (
        <AnimatedSection>
          <section className="border-y border-border bg-surface/30 py-16">
            <div className="mx-auto max-w-5xl px-6">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Featured bounties</h2>
                <Link to="/bounties" className="text-sm font-medium text-accent hover:underline">
                  View all <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((b, i) => (
                  <AnimatedSection key={b.id} delay={i * 0.1}>
                    <BountyCard bounty={b} />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* How it works */}
      <AnimatedSection delay={0.1}>
        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 max-w-xl">
              <h2 className="text-2xl font-semibold text-ink">How it works</h2>
              <p className="mt-2 text-sm text-ink-dim">
                A hybrid architecture. Normal operations live in a classic web stack, while
                trust-critical reward handling runs on Ethereum.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Bug className="h-5 w-5" />,
                  title: "Organizations launch programs",
                  body: "Define scope, rules and severity-based rewards. Fund the bounty into a smart contract escrow before it goes live.",
                },
                {
                  icon: <FileSearch className="h-5 w-5" />,
                  title: "Researchers hunt and report",
                  body: "Connect MetaMask, submit vulnerability reports with evidence. Track status in real time from SUBMITTED to REWARDED.",
                },
                {
                  icon: <Coins className="h-5 w-5" />,
                  title: "Rewards released on-chain",
                  body: "On approval, the escrow contract releases ETH directly to the researcher's wallet. Duplicate payments are impossible.",
                },
              ].map((s, i) => (
                <AnimatedSection key={s.title} delay={i * 0.15}>
                  <div className="group">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 font-mono text-xs font-medium text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-ink-dim">
                        {s.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2 text-sm text-ink-dim leading-relaxed">{s.body}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Security */}
      <AnimatedSection delay={0.2}>
        <section id="security" className="border-y border-border bg-surface/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-10 max-w-xl">
              <h2 className="text-2xl font-semibold text-ink">Built for trust</h2>
              <p className="mt-2 text-sm text-ink-dim">
                Security-first architecture at every layer of the platform.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Lock className="h-4 w-4" />,
                  title: "On-chain escrow",
                  body: "Rewards are held by the BountyEscrow contract, not the platform.",
                },
                {
                  icon: <Fingerprint className="h-4 w-4" />,
                  title: "Signed wallet binding",
                  body: "Wallets are verified with a cryptographic signature before use.",
                },
                {
                  icon: <ShieldCheck className="h-4 w-4" />,
                  title: "Role-based access",
                  body: "JWT auth with strict per-role authorization on every endpoint.",
                },
                {
                  icon: <Globe className="h-4 w-4" />,
                  title: "Sepolia testnet",
                  body: "Everything runs on testnet ETH. No real money, ever.",
                },
              ].map((s) => (
                <AnimatedSection key={s.title}>
                  <div className="bg-surface p-5">
                    <div className="mb-2 text-accent-2">
                      {s.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1.5 text-xs text-ink-dim leading-relaxed">{s.body}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection delay={0.3}>
        <section className="py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Wallet className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-ink">Ready to start hunting?</h2>
            <p className="mt-3 text-ink-dim">
              Create an account, connect your wallet and start earning testnet ETH for finding real
              vulnerabilities.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button size="lg">Create free account</Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
