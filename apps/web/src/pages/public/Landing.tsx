import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bug,
  Crosshair,
  FileSearch,
  Fingerprint,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Bounty } from "../../types";
import { weiToEth } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { BountyCard } from "../../components/bounty/BountyCard";
import { AnimatedSection } from "../../components/ui/AnimatedSection";

function HeroTerminal() {
  return (
    <div className="hidden lg:block w-full max-w-sm">
      <div className="overflow-hidden rounded-lg border border-graphite bg-surface">
        <div className="flex items-center justify-between border-b border-graphite px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-smoke" />
            <span className="h-2 w-2 rounded-full bg-smoke" />
            <span className="h-2 w-2 rounded-full bg-ash" />
          </div>
          <span className="font-mono text-[10px] text-ash">BountyNex Escrow</span>
        </div>
        <div className="p-4 font-mono text-xs leading-6">
          <div className="flex justify-between border-b border-graphite pb-2">
            <span className="text-ash">program</span>
            <span className="text-mist">BNX-0072</span>
          </div>
          <div className="flex justify-between border-b border-graphite py-2">
            <span className="text-ash">network</span>
            <span className="text-pulse-green">sepolia</span>
          </div>
          <div className="flex justify-between border-b border-graphite py-2">
            <span className="text-ash">escrow</span>
            <span className="text-mist">5.000000 ETH</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-ash">contract</span>
            <span className="text-fog">0x9f..a441</span>
          </div>
        </div>
        <div className="border-t border-graphite px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-acid-lime/20 bg-acid-lime/5 px-2 py-0.5 font-mono text-[10px] text-acid-lime">
            <span className="h-1 w-1 rounded-full bg-acid-lime" />
            escrow funded
          </span>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const { data } = useQuery({
    queryKey: ["landing-bounties"],
    queryFn: async () => (await api.get("/api/bounties?limit=3&status=ACTIVE")) as { items: Bounty[] },
    staleTime: 60_000,
  });

  const featured = data?.items ?? [];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-graphite to-transparent" />
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:grid-cols-[1fr_auto] lg:pt-32">
          <div className="max-w-xl">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] text-fog"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-acid-lime" />
              Crowdsourced security infrastructure
            </motion.div>

            <motion.h1
              className="text-5xl font-medium leading-[1.04] tracking-[-0.022em] text-paper sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Crowdsourced security, built for the open web.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-md text-base leading-relaxed text-mist"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              BountyNex is decentralized bug bounty infrastructure. Organizations fund programs
              on-chain; researchers hunt vulnerabilities and get paid in ETH the moment a report is
              approved. No middlemen, no fees withheld.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/register">
                <Button size="lg">
                  Start hunting <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/bounties">
                <Button size="lg" variant="secondary">
                  Browse bounties
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-graphite pt-6 font-mono text-[11px] text-ash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <span>100% on-chain escrow</span>
              <span>Ethereum Sepolia</span>
              <span>Signed wallet binding</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <HeroTerminal />
          </motion.div>
        </div>
      </section>

      {/* ── Featured programs ─────────────────────────────── */}
      {featured.length > 0 && (
        <AnimatedSection>
          <section className="border-y border-graphite bg-carbon/40">
            <div className="mx-auto max-w-[1200px] px-6 py-16">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Live programs</p>
                  <h2 className="mt-1 text-2xl font-medium tracking-tight text-paper sm:text-3xl">
                    Hunt on active bounties
                  </h2>
                </div>
                <Link
                  to="/bounties"
                  className="group inline-flex items-center gap-1 text-[13px] font-medium text-mist transition-colors duration-150 hover:text-paper"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((b, i) => (
                  <AnimatedSection key={b.id} delay={i * 0.08}>
                    <BountyCard bounty={b} />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── How it works ──────────────────────────────────── */}
      <AnimatedSection delay={0.05}>
        <section id="how-it-works" className="mx-auto max-w-[1200px] px-6 py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Workflow</p>
            <h2 className="mt-1 text-3xl font-medium tracking-tight text-paper sm:text-4xl">
              Under the hood
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-mist">
              A hybrid architecture. Day-to-day operations run on a conventional stack while
              trust-critical reward handling lives on Ethereum — so neither the platform nor anyone
              else can withhold a payout.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-graphite bg-graphite lg:grid-cols-3">
            {[
              {
                icon: <Bug className="h-4 w-4" />,
                index: "01",
                title: "Launch a program",
                body: "Define scope, rules and severity-based rewards. Funding is locked into a smart-contract escrow before a program goes live.",
              },
              {
                icon: <FileSearch className="h-4 w-4" />,
                index: "02",
                title: "Hunt and report",
                body: "Researchers connect a wallet, submit vulnerability reports with evidence, and track status in real time from SUBMITTED to REWARDED.",
              },
              {
                icon: <Lock className="h-4 w-4" />,
                index: "03",
                title: "Rewards on-chain",
                body: "On approval, the escrow contract releases ETH directly to the researcher's wallet. Duplicate payouts are impossible.",
              },
            ].map((s) => (
              <div key={s.index} className="bg-surface p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-obsidian text-fog">
                    {s.icon}
                  </span>
                  <span className="font-mono text-[11px] text-ash">{s.index}</span>
                </div>
                <h3 className="mt-5 text-[15px] font-medium text-paper">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ── Security / trust ──────────────────────────────── */}
      <AnimatedSection delay={0.05}>
        <section id="security" className="border-y border-graphite bg-carbon/40">
          <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-24">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Architecture</p>
              <h2 className="mt-1 text-3xl font-medium tracking-tight text-paper sm:text-4xl">
                Engineered for trust
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-mist">
                Security is applied at every layer — from signed wallet binding to a permission model
                enforced on each endpoint.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Lock className="h-4 w-4" />,
                  title: "On-chain escrow",
                  body: "Rewards are held by the BountyEscrow contract, not by the platform.",
                },
                {
                  icon: <Fingerprint className="h-4 w-4" />,
                  title: "Signed wallet binding",
                  body: "Every wallet is verified with a cryptographic signature before use.",
                },
                {
                  icon: <ShieldCheck className="h-4 w-4" />,
                  title: "Role-based access",
                  body: "JWT auth with strict per-role authorization on every endpoint.",
                },
                {
                  icon: <Crosshair className="h-4 w-4" />,
                  title: "Sepolia testnet",
                  body: "Everything runs on testnet ETH. No real money, ever.",
                },
              ].map((s) => (
                <div key={s.title} className="p-5">
                  <span className="text-fog">{s.icon}</span>
                  <h3 className="mt-3 text-sm font-medium text-paper">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fog">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CTA ───────────────────────────────────────────── */}
      <AnimatedSection delay={0.05}>
        <section className="mx-auto max-w-[1200px] px-6 py-20 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-medium tracking-tight text-paper sm:text-4xl">
              Ready to get paid in ETH for finding bugs?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-mist">
              Create an account, bind your wallet, and start hunting on live programs today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg">Create free account</Button>
              </Link>
              <Link to="/bounties">
                <Button size="lg" variant="ghost">
                  Explore bounties
                </Button>
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] text-ash">
              {weiToEth("1000000000000000000")} ETH minimum escrow per program
            </p>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}