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
    <div className="grid gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          className="pl-9"
          placeholder="Search bounties..."
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>
      <Select value={filters.severity} onChange={(e) => update({ severity: e.target.value })}>
        <option value="">All severities</option>
        {SEVERITY_ORDER.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
        <option value="newest">Newest first</option>
        <option value="reward_high">Highest reward</option>
        <option value="reward_low">Lowest reward</option>
        <option value="deadline">Ending soon</option>
      </Select>
      {showStatus ? (
        <Select value={filters.status ?? ""} onChange={(e) => update({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed</option>
          <option value="DRAFT">Draft</option>
        </Select>
      ) : (
        <Select value={filters.minReward ?? ""} onChange={(e) => update({ minReward: e.target.value })}>
          <option value="">Any reward</option>
          <option value="100000000000000000">≥ 0.1 ETH</option>
          <option value="500000000000000000">≥ 0.5 ETH</option>
          <option value="1000000000000000000">≥ 1 ETH</option>
        </Select>
      )}
    </div>
  );
}
