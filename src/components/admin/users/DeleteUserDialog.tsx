import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userFirstName: string | null;
  userEmail: string;
  isDeleting?: boolean;
  onConfirm: () => void;
}

const DeleteUserDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  userFirstName,
  userEmail,
  isDeleting,
  onConfirm,
}) => {
  const [typed, setTyped] = useState("");
  const expected = (userFirstName || "").trim();
  const matches =
    expected.length > 0 &&
    typed.trim().toLowerCase() === expected.toLowerCase();

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !isDeleting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Excluir usuário permanentemente
          </DialogTitle>
          <DialogDescription className="pt-2">
            Você está prestes a excluir{" "}
            <span className="font-semibold text-foreground">{userEmail}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Esta operação não tem volta.</p>
            <p className="text-destructive/80 text-xs mt-1">
              Todos os vínculos, papéis e dados associados serão removidos
              permanentemente da plataforma. Não será possível recuperar.
            </p>
          </div>
        </div>

        {expected ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-sm">
              Para confirmar, digite o primeiro nome do usuário:{" "}
              <span className="font-semibold text-foreground">{expected}</span>
            </Label>
            <Input
              id="confirm-name"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={expected}
              autoComplete="off"
              disabled={isDeleting}
            />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Este usuário não possui primeiro nome cadastrado. A confirmação por
            digitação será dispensada.
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting || (expected.length > 0 && !matches)}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
