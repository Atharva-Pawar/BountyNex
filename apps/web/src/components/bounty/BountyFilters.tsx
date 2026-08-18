import { Search } from "lucide-react";
import { Input, Select } from "../ui/Field";
import type { Severity } from "../../types";
import { SEVERITY_ORDER } from "../../lib/utils";

export interface BountyFiltersState {
  q: string;
  severity: string;
  sort: string;
  status?: string;
  minReward?: string;
}

export function BountyFilters({
  filters,
  onChange,
  showStatus,
}: {
  filters: BountyFiltersState;
  onChange: (next: BountyFiltersState) => void;
  showStatus?: boolean;
}) {
  const update = (patch: Partial<BountyFiltersState>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3 border-b border-graphite pb-4 lg:flex-row lg:items-center">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash" />
        <Input
          className="pl-9 font-mono text-[13px]"
          placeholder="Search vulnerabilities..."
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.severity} onChange={(e) => update({ severity: e.target.value })}>
          <option value="">Severity: all</option>
          {SEVERITY_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {showStatus ? (
          <Select value={filters.status ?? ""} onChange={(e) => update({ status: e.target.value })}>
            <option value="">Status: all</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CLOSED">Closed</option>
            <option value="DRAFT">Draft</option>
          </Select>
        ) : (
          <Select value={filters.minReward ?? ""} onChange={(e) => update({ minReward: e.target.value })}>
            <option value="">Reward: any</option>
            <option value="100000000000000000">{"\u2265"} 0.1 ETH</option>
            <option value="500000000000000000">{"\u2265"} 0.5 ETH</option>
            <option value="1000000000000000000">{"\u2265"} 1 ETH</option>
          </Select>
        )}
        <Select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
          <option value="newest">Sort: newest</option>
          <option value="reward_high">Sort: reward high</option>
          <option value="reward_low">Sort: reward low</option>
          <option value="deadline">Sort: ending soon</option>
        </Select>
      </div>
    </div>
  );
}