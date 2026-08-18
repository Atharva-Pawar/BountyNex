import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAccount, useWriteContract } from "wagmi";
import { encodeFunctionData } from "viem";
import { ExternalLink, Play, Plus, Rocket, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Bounty, Pagination } from "../../types";
import { formatDate, weiToEth } from "../../lib/utils";
import { CONTRACT_ADDRESS } from "../../lib/wagmi";
import abi from "../../lib/escrow-abi.json";
import { useCreateBountyOnChain, useFundBounty } from "../../hooks/useEscrow";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/State";
import { PaginationBar } from "../../components/ui/PaginationBar";
import { ConfirmDialog } from "../../components/ui/Modal";
import { TxHashLink } from "../../components/wallet/TxHashLink";
import { PageHeader } from "../../components/ui/PageHeader";

const ESCROW_ABI = abi as unknown as Parameters<typeof encodeFunctionData>[0]["abi"];

interface BountyListResponse {
  items: Bounty[];
  pagination: Pagination;
}

export function ManageBounties() {
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Bounty | null>(null);
  const { address } = useAccount();

  const { create: createOnChain } = useCreateBountyOnChain();
  const { fund } = useFundBounty();
  const { writeContractAsync: setOnChainStatus } = useWriteContract();

  const { data, isLoading, isError, error, refetch } = useQuery<BountyListResponse>({
    queryKey: ["manage-bounties", page],
    queryFn: async () => (await api.get(`/api/bounties?mine=true&limit=10&page=${page}`)) as BountyListResponse,
  });

  const recordTx = useCallback(
    async (txHash: string, payload: Record<string, string>) => {
      await api.post("/api/transactions/record", { txHash, ...payload });
    },
    [],
  );

  async function deployAndFund(bounty: Bounty) {
    if (!address) {
      toast.error("Connect a wallet first");
      return;
    }
    setPendingId(bounty.id);
    setPendingAction("fund");
    try {
      let onChainId = bounty.onChainId;
      if (!onChainId) {
        const res = (await api.post(`/api/bounties/${bounty.id}/onchain`)) as { onChainId: string };
        onChainId = res.onChainId;
      }

      const deadlineSeconds = BigInt(Math.floor(new Date(bounty.deadline).getTime() / 1000));
      const createHash = await createOnChain(BigInt(onChainId), address, deadlineSeconds);
      await recordTx(createHash, { type: "BOUNTY_CREATE", bountyId: bounty.id });

      const fundHash = await fund(BigInt(onChainId), BigInt(bounty.rewardAmountWei));
      await recordTx(fundHash, {
        type: "BOUNTY_FUND",
        bountyId: bounty.id,
        amountWei: bounty.rewardAmountWei,
      });

      toast.success("Bounty deployed and funded on-chain");
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPendingId(null);
      setPendingAction("");
    }
  }

  async function changeStatus(bounty: Bounty, status: "ACTIVE" | "PAUSED" | "CLOSED") {
    setPendingId(bounty.id);
    setPendingAction("status");
    try {
      if (bounty.onChainId && CONTRACT_ADDRESS) {
        const statusCode = status === "ACTIVE" ? 1 : status === "PAUSED" ? 2 : 3;
        const hash = await setOnChainStatus({
          address: CONTRACT_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "setBountyStatus",
          args: [BigInt(bounty.onChainId), statusCode],
        });
        await recordTx(hash, { type: "BOUNTY_STATUS_CHANGE", bountyId: bounty.id });
      }

      const res = (await api.patch(`/api/bounties/${bounty.id}/status`, { status })) as { bounty: Bounty };
      toast.success(`Bounty ${status.toLowerCase()}`);
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPendingId(null);
      setPendingAction("");
    }
  }

  async function removeDraft() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/bounties/${deleteTarget.id}`);
      toast.success("Draft deleted");
      setDeleteTarget(null);
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Workspace"
          title="My bounties"
          subtitle="Fund, activate, and manage your programs"
        />
        <Link to="/organization/create">
          <Button>
            <Plus className="h-4 w-4" /> Create bounty
          </Button>
        </Link>
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState message="Unable to load bounties. Please try again." retry={() => void refetch()} />
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="p-10">
              <EmptyState
                title="No bounty programs"
                description="Create your first program to get started."
                action={
                  <Link to="/organization/create">
                    <Button size="sm">Create bounty</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <div className="divide-y divide-graphite">
                {data?.items.map((b) => (
                  <div key={b.id} className="px-5 py-4 first:pt-5 last:pb-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link to={`/organization/bounties/${b.id}/reports`} className="font-medium tracking-tight text-paper transition-colors duration-150 hover:text-bone">
                            {b.title}
                          </Link>
                          <StatusBadge status={b.status} />
                          {b.isFunded && (
                            <span className="font-mono text-[11px] uppercase tracking-wider text-pulse-green">funded</span>
                          )}
                        </div>
                        <p className="mt-1.5 font-mono text-[11px] text-ash">
                          BNX-{b.id.slice(0, 6)} · {b._count?.bugReports ?? 0} reports · deadline {formatDate(b.deadline)}
                          {b.onChainId ? ` · on-chain #${b.onChainId}` : " · not on-chain yet"}
                        </p>
                        <p className="mt-1.5 font-mono text-sm font-medium text-acid-lime">{weiToEth(b.rewardAmountWei)} ETH total</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {b.fundingTxHash && <TxHashLink hash={b.fundingTxHash} />}

                        {!b.isFunded && (
                          <Button
                            size="sm"
                            loading={pendingId === b.id && pendingAction === "fund"}
                            disabled={!address}
                            title={address ? undefined : "Connect wallet to fund"}
                            onClick={() => void deployAndFund(b)}
                          >
                            <Rocket className="h-4 w-4" /> {b.onChainId ? "Fund" : "Deploy & fund"}
                          </Button>
                        )}

                        {b.isFunded && b.status === "DRAFT" && (
                          <Button size="sm" loading={pendingId === b.id && pendingAction === "status"} onClick={() => void changeStatus(b, "ACTIVE")}>
                            <Play className="h-4 w-4" /> Activate
                          </Button>
                        )}

                        {b.status === "ACTIVE" && (
                          <Button size="sm" variant="secondary" loading={pendingId === b.id && pendingAction === "status"} onClick={() => void changeStatus(b, "PAUSED")}>
                            Pause
                          </Button>
                        )}
                        {b.status === "PAUSED" && (
                          <Button size="sm" variant="secondary" loading={pendingId === b.id && pendingAction === "status"} onClick={() => void changeStatus(b, "ACTIVE")}>
                            Resume
                          </Button>
                        )}
                        {(b.status === "ACTIVE" || b.status === "PAUSED") && (
                          <Button size="sm" variant="danger" loading={pendingId === b.id && pendingAction === "status"} onClick={() => void changeStatus(b, "CLOSED")}>
                            Close
                          </Button>
                        )}

                        <Link to={`/organization/bounties/${b.id}/reports`}>
                          <Button size="sm" variant="secondary">
                            <ExternalLink className="h-4 w-4" /> Submissions
                          </Button>
                        </Link>

                        {b.status === "DRAFT" && (
                          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(b)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-graphite px-5 py-3">
                <PaginationBar pagination={data?.pagination} onPage={setPage} />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void removeDraft()}
        title="Delete draft bounty?"
        description="This action cannot be undone. Only drafts can be deleted."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}