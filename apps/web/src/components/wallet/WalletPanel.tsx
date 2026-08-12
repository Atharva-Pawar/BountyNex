import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CheckCircle2, Link2, ShieldAlert } from "lucide-react";
import { useWalletBinding } from "../../hooks/useWallet";
import { shortAddress } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Card, CardBody, CardHeader } from "../ui/Card";

export function WalletPanel() {
  const { isConnected, address, bindWallet, binding, serverWallet, loadServerWallet } =
    useWalletBinding();

  useEffect(() => {
    if (isConnected) void loadServerWallet();
  }, [isConnected, loadServerWallet]);

  const bound = serverWallet?.isActive && serverWallet.address === address?.toLowerCase();

  return (
    <Card>
      <CardHeader title="Wallet" subtitle="Connect MetaMask and verify ownership" />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-dim">Connected account</p>
            <p className="font-mono text-lg text-ink">{shortAddress(address, 6) || "Not connected"}</p>
          </div>
          <ConnectButton showBalance />
        </div>

        {bound ? (
          <div className="flex items-center gap-2.5 rounded-md border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Wallet verified and bound to your profile ({shortAddress(serverWallet.address, 5)})</span>
          </div>
        ) : isConnected ? (
          <div className="flex flex-col gap-3 rounded-md border border-warn/20 bg-warn/5 px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-warn">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              This wallet is connected but not yet bound to your account.
            </p>
            <Button onClick={() => void bindWallet()} loading={binding}>
              <Link2 className="h-4 w-4" />
              Verify and bind wallet
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-faint">
            Connect a wallet to receive rewards or fund bounties. BountyNex never requests your
            private key or seed phrase.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
