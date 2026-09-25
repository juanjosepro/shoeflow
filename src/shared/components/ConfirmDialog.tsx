import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

export const ConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, isLoading }) => {
  const footerContent = (
    <div className="flex justify-content-end">
      <Button
        size="small"
        severity="secondary"
        outlined
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button
        size="small"
        severity="success"
        onClick={onConfirm}
        disabled={isLoading}
      >
        Desactivar
      </Button>
    </div>
  );

  return (
    <Dialog
      visible={open}
      onHide={() => { if (isLoading) return; onOpenChange(false); }}
      header={title}
      footer={footerContent}
    >
      <p className="m-0">
        {description}
      </p>
    </Dialog>
  )
}