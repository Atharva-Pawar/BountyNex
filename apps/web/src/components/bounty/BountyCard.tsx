import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Bounty } from "../../types";
import { cn, daysLeft, severityColor, weiToEth } from "../../lib/utils";
import { StatusBadge } from "../ui/Badge";

let prefersReduced = false;
if (typeof window !== "undefined") {
  prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const days = daysLeft(bounty.deadline);
  const reward = weiToEth(bounty.rewardAmountWei);

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <Link
        to={`/bounties/${bounty.id}`}
        className="group flex h-full flex-col rounded-lg border border-graphite bg-surface p-5 transition-colors duration-150 hover:border-smoke"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {bounty.severities &&
              bounty.severities.slice(0, 3).map((s) => (
                <span
                  key={s.level}
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium",
                    severityColor(s.level),
                    "bg-obsidian",
                  )}
                >
                  {s.level}
                </span>
              ))}
          </div>
          <StatusBadge status={bounty.status} />
        </div>

        <h3 className="mt-3 truncate text-[15px] font-medium text-paper transition-colors duration-150 group-hover:text-bone">
          {bounty.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-fog">
          <ShieldCheck
            className={cn("h-3 w-3", bounty.organization?.isVerified ? "text-pulse-green" : "text-ash")}
          />
          {bounty.organization?.name ?? "Organization"}
          {bounty.organization?.isVerified && (
            <span className="font-mono text-[10px] text-pulse-green">verified</span>
          )}
        </p>

        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-fog">{bounty.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-sm border border-graphite bg-obsidian px-2 py-0.5 font-mono text-[10px] text-fog">
            sepolia
          </span>
          <span className="rounded-sm border border-graphite bg-obsidian px-2 py-0.5 font-mono text-[10px] text-fog">
            {bounty.scope ? `${bounty.scope}` : "public scope"}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-graphite pt-3.5">
          <div>
            <p className="font-mono text-sm font-medium text-paper">
              {reward} <span className="text-[10px] font-normal text-ash">ETH</span>
            </p>
            <p className="font-mono text-[10px] text-ash">
              {days === 0 ? "expired" : `${days}d left`}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-fog transition-colors duration-150 group-hover:text-acid-lime">
            View bounty
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}