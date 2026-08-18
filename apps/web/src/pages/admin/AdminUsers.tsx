import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import type { Pagination, Role } from "../../types";
import { formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { Input } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

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
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);

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
      <PageHeader
        eyebrow="Console"
        title="Users"
        subtitle="Manage platform accounts"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
          <Input className="pl-9" placeholder="Search name or email..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={
                role === r
                  ? "rounded-sm border border-acid-lime/30 bg-acid-lime/10 px-3 py-1.5 text-[12px] font-medium text-acid-lime transition-colors duration-150"
                  : "rounded-sm border border-graphite px-3 py-1.5 text-[12px] font-medium text-fog transition-colors duration-150 hover:border-smoke hover:text-paper"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-graphite px-5 py-3.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
            {data?.pagination.total ?? 0} accounts
          </p>
        </div>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message={(error as Error).message} retry={() => void refetch()} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-graphite text-[11px] uppercase tracking-wider text-ash">
                      <th className="px-5 pb-3 pr-4 pt-3 font-medium">User</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Role</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Status</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Joined</th>
                      <th className="pb-3 pr-4 pt-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite">
                    {data?.items.map((u) => (
                      <tr key={u.id} className="transition-colors duration-150 hover:bg-obsidian/60">
                        <td className="px-5 py-3.5 pr-4">
                          <p className="font-medium tracking-tight text-paper">{u.name}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-ash">{u.email}</p>
                        </td>
                        <td className="py-3.5 pr-4"><StatusBadge status={u.role} /></td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={u.isSuspended ? "REJECTED" : "ACTIVE"} />
                            {u.organization && <span className="text-[11px] text-ash">{u.organization.isVerified ? "Org verified" : "Org unverified"}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-mist">{formatDate(u.createdAt)}</td>
                        <td className="py-3.5 pr-4">
                          <Button
                            variant={u.isSuspended ? "secondary" : "danger"}
                            size="sm"
                            loading={pendingId === u.id}
                            onClick={() => (u.isSuspended ? void toggleSuspend(u) : setSuspendTarget(u))}
                          >
                            {u.isSuspended ? "Unsuspend" : "Suspend"}
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

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        onCancel={() => setSuspendTarget(null)}
        onConfirm={() => {
          if (!suspendTarget) return;
          void toggleSuspend(suspendTarget).finally(() => setSuspendTarget(null));
        }}
        title={`Suspend ${suspendTarget?.name ?? "this user"}?`}
        description="Suspended users cannot sign in or use the platform until an admin reinstates them."
        confirmLabel="Suspend user"
        cancelLabel="Cancel"
        variant="danger"
        loading={Boolean(suspendTarget) && pendingId === suspendTarget?.id}
      />
    </div>
  );
}