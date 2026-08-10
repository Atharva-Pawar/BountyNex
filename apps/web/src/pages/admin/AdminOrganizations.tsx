import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2, Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Pagination } from "../../types";
import { formatDate, shortAddress } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { Input } from "../../components/ui/Field";

interface AdminOrg {
  id: string;
  name: string;
  website: string | null;
  isVerified: boolean;
  onChainAddress: string | null;
  createdAt?: string;
  user: { email: string; isSuspended: boolean };
  _count: { bounties: number; rewards: number };
}

export function AdminOrganizations() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<{ items: AdminOrg[]; pagination: Pagination }>({
    queryKey: ["admin-orgs", page, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (q) params.set("q", q);
      return (await api.get(`/api/admin/organizations?${params}`)) as { items: AdminOrg[]; pagination: Pagination };
    },
  });

  async function toggleVerify(org: AdminOrg) {
    setPendingId(org.id);
    try {
      await api.patch(`/api/admin/organizations/${org.id}/verify`, { verified: !org.isVerified });
      toast.success(org.isVerified ? "Verification removed" : "Organization verified");
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Organizations</h1>
        <p className="text-sm text-ink-dim">Verify organizations running bounty programs</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input className="pl-9" placeholder="Search organizations..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      <Card>
        <CardHeader title="All organizations" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="py-10 text-center text-sm text-ink-faint">No organizations found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                      <th className="pb-3 pr-4 font-medium">Organization</th>
                      <th className="pb-3 pr-4 font-medium">Contact</th>
                      <th className="pb-3 pr-4 font-medium">On-chain</th>
                      <th className="pb-3 pr-4 font-medium">Programs</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.items.map((org) => (
                      <tr key={org.id} className="transition-colors hover:bg-surface-2/50">
                        <td className="py-3 pr-4">
                          <p className="flex items-center gap-2 font-medium text-ink">
                            <Building2 className="h-4 w-4 text-accent-2" /> {org.name}
                          </p>
                          {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="text-xs text-accent-2 hover:underline">{org.website}</a>}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-ink">{org.user.email}</p>
                          <p className="text-xs text-ink-faint">{org.user.isSuspended ? "Account suspended" : "Account active"}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-mono text-xs text-ink-dim">{shortAddress(org.onChainAddress, 4)}</p>
                          <p className="text-xs text-ink-faint">Joined {org.createdAt ? formatDate(org.createdAt) : "—"}</p>
                        </td>
                        <td className="py-3 pr-4 text-ink-dim">
                          {org._count.bounties} bounties · {org._count.rewards} rewards
                        </td>
                        <td className="py-3">
                          <Button
                            variant={org.isVerified ? "secondary" : "primary"}
                            size="sm"
                            loading={pendingId === org.id}
                            onClick={() => void toggleVerify(org)}
                          >
                            {org.isVerified ? "Unverify" : "Verify"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar pagination={data?.pagination} onPage={setPage} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
