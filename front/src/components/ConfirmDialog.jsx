import { useCallback, useState } from "react";
import Modal from "./Modal";

function ConfirmDialog({ confirmLabel = "Delete", description, onCancel, onConfirm, title }) {
  return (
    <Modal onClose={onCancel} size="sm" title={title}>
      {description && <p className="text-sm leading-6 text-slate-300">{description}</p>}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded border border-slate-700 px-4 text-sm font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-500 hover:text-white"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          autoFocus
          className="inline-flex min-h-11 items-center justify-center rounded border border-red-900/60 bg-red-500/10 px-4 text-sm font-semibold uppercase tracking-wide text-red-300 transition hover:border-red-500 hover:bg-red-500/20 hover:text-red-200"
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// Substitui o window.confirm, que destoava do resto da interface. Uso:
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm({ title: "Delete?" }))) return;
//   ...e renderizar {confirmDialog} no JSX do componente.
export function useConfirm() {
  const [request, setRequest] = useState(null);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setRequest({ ...options, resolve })),
    []
  );

  function close(result) {
    request?.resolve(result);
    setRequest(null);
  }

  const confirmDialog = request ? (
    <ConfirmDialog
      confirmLabel={request.confirmLabel}
      description={request.description}
      onCancel={() => close(false)}
      onConfirm={() => close(true)}
      title={request.title}
    />
  ) : null;

  return [confirm, confirmDialog];
}
