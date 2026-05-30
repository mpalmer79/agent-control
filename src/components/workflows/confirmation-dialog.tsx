"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

// A small confirmation dialog for governed actions. Renders the trigger, an
// optional body (for example a reason field), and confirm and cancel buttons.
export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  confirmDisabled,
  destructive,
  onConfirm,
  children,
}: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg",
          )}
        >
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant={destructive ? "destructive" : "default"}
              disabled={confirmDisabled || pending}
              onClick={handleConfirm}
            >
              {pending ? "Working..." : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
