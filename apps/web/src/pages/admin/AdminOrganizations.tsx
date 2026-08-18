import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2, Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Pagination } from "../../types";
import { formatDate, shortAddress } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { Input } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";

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
      <PageHeader
        eyebrow="Console"
        title="Organizations"
        subtitle="Verify organizations running bounty programs"
      />

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
        <Input className="pl-9" placeholder="Search organizations..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      <Card>
        <div className="border-b border-graphite px-5 py-3.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
            {data?.pagination.total ?? 0} organizations
          </p>
        </div>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="py-10 text-center text-sm text-fog">No organizations found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                      <th className="px-5 pb-3 pr-4 pt-3 font-medium">Organization</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Contact</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">On-chain</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Programs</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Verification</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite">
                    {data?.items.map((org) => (
                      <tr key={org.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                        <td className="px-5 py-3.5 pr-4">
                          <p className="flex items-center gap-2 font-medium tracking-tight text-paper">
                            <Building2 className="h-4 w-4 text-signal-teal" /> {org.name}
                          </p>
                          {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="text-[12px] text-signal-teal transition-colors hover:text-paper">{org.website}</a>}
                        </td>
                        <td className="py-3.5 pr-4">
                          <p className="text-mist">{org.user.email}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-ash">{org.user.isSuspended ? "Account suspended" : "Account active"}</p>
                        </td>
                        <td className="py-3.5 pr-4">
                          <p className="font-mono text-[12px] text-mist">{shortAddress(org.onChainAddress, 4)}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-ash">{org.createdAt ? formatDate(org.createdAt) : "—"}</p>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-[13px] text-mist">
                          {org._count.bounties} bounties · {org._count.rewards} rewards
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusBadge status={org.isVerified ? "ACCEPTED" : "PENDING"} />
                        </td>
                        <td className="py-3.5 pr-4">
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
              <div className="border-t border-graphite px-5 py-3">
                <PaginationBar pagination={data?.pagination} onPage={setPage} />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}