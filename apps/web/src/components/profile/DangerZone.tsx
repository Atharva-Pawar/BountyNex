import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Input } from "../ui/Field";

export function DangerZone() {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirmReady = typed.trim().toUpperCase() === "DELETE";

  function close() {
    if (deleting) return;
    setOpen(false);
    setTyped("");
  }

  async function handleConfirm() {
    if (!confirmReady || deleting) return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been deleted.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <>
      <section className="rounded-lg border border-coral-red/30">
        <header className="flex items-center gap-2.5 border-b border-coral-red/20 bg-coral-red/5 px-5 py-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-coral-red/25 bg-coral-red/10 text-coral-red">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-coral-red">Danger Zone</h2>
            <p className="text-xs text-mist">Irreversible account deletion</p>
          </div>
        </header>

        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-paper">Delete account</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ash">
              Delete your account and permanently remove your account data. This action cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={() => setOpen(true)}
            className="w-full shrink-0 sm:w-auto"
          >
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={open}
        onCancel={close}
        onConfirm={handleConfirm}
        title="Delete your account?"
        description={
          <div className="space-y-4">
            <p>
              This action is permanent and cannot be undone. Your account and associated data will be permanently
              deleted.
            </p>
            <label className="block" htmlFor="delete-confirm-typed">
              <span className="text-xs text-mist">
                Type{" "}
                <span className="font-mono font-semibold text-coral-red">DELETE</span> to confirm
              </span>
              <Input
                id="delete-confirm-typed"
                className="mt-1.5"
                placeholder="DELETE"
                autoComplete="off"
                spellCheck={false}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                data-confirm-autofocus
              />
            </label>
          </div>
        }
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        confirmDisabled={!confirmReady || deleting}
      />
    </>
  );
}