import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Pagination, Role } from "../../types";
import { formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { Input } from "../../components/ui/Field";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  researcherProfile?: { handle: string } | null;
  organization?: { name: string; isVerified: boolean } | null;
}

const ROLES: Array<Role | "ALL"> = ["ALL", "RESEARCHER", "ORGANIZATION", "ADMIN"];

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<{ items: AdminUser[]; pagination: Pagination }>({
    queryKey: ["admin-users", page, role, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (role !== "ALL") params.set("role", role);
      if (q) params.set("q", q);
      return (await api.get(`/api/admin/users?${params}`)) as { items: AdminUser[]; pagination: Pagination };
    },
  });

  async function toggleSuspend(user: AdminUser) {
    setPendingId(user.id);
    try {
      await api.patch(`/api/admin/users/${user.id}/suspend`, { suspended: !user.isSuspended });
      toast.success(user.isSuspended ? "User unsuspended" : "User suspended");
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
        <h1 className="text-2xl font-bold text-ink">Users</h1>
        <p className="text-sm text-ink-dim">Manage platform accounts</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input className="pl-9" placeholder="Search name or email..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={
                role === r
                  ? "rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                  : "rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-dim hover:border-border-strong hover:text-ink"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title="All users" />
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} retry={() => void refetch()} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-faint">
                      <th className="pb-3 pr-4 font-medium">User</th>
                      <th className="pb-3 pr-4 font-medium">Role</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Joined</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.items.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-surface-2/50">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-ink">{u.name}</p>
                          <p className="text-xs text-ink-faint">{u.email}</p>
                        </td>
                        <td className="py-3 pr-4"><StatusBadge status={u.role} /></td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={u.isSuspended ? "REJECTED" : "ACTIVE"} />
                            {u.organization && <span className="text-xs text-ink-faint">{u.organization.isVerified ? "Org verified" : "Org unverified"}</span>}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-ink-dim">{formatDate(u.createdAt)}</td>
                        <td className="py-3">
                          <Button
                            variant={u.isSuspended ? "secondary" : "danger"}
                            size="sm"
                            loading={pendingId === u.id}
                            onClick={() => void toggleSuspend(u)}
                          >
                            {u.isSuspended ? "Unsuspend" : "Suspend"}
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
