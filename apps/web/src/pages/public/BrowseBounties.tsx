import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Bounty, Pagination } from "../../types";
import { BountyCard } from "../../components/bounty/BountyCard";
import { BountyFilters, type BountyFiltersState } from "../../components/bounty/BountyFilters";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";

interface ListResponse {
  items: Bounty[];
  pagination: Pagination;
}

export function BrowseBounties() {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BountyFiltersState>({
    q: params.get("q") ?? "",
    severity: params.get("severity") ?? "",
    sort: params.get("sort") ?? "newest",
    status: params.get("status") ?? "",
  });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const query = new URLSearchParams({
    q: filters.q,
    severity: filters.severity,
    sort: filters.sort,
    page: String(page),
    limit: "9",
  });
  if (filters.status) query.set("status", filters.status);

  const { data, isLoading, isError, error, refetch } = useQuery<ListResponse>({
    queryKey: ["bounties", query.toString()],
    queryFn: async () => (await api.get(`/api/bounties?${query.toString()}`)) as ListResponse,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Browse bounties</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Public programs funded with testnet ETH. Find a target and start hunting.
        </p>
      </div>

      <BountyFilters filters={filters} onChange={setFilters} />

      <div className="mt-8">
        {isLoading ? (
          <Spinner label="Loading bounties..." />
        ) : isError ? (
          <ErrorState message={(error as Error).message} retry={() => void refetch()} />
        ) : !data ? (
          <ErrorState message="Failed to load bounties" retry={() => void refetch()} />
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No bounties found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((b) => (
                <BountyCard key={b.id} bounty={b} />
              ))}
            </div>
            <PaginationBar pagination={data.pagination} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
