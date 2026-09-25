import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import MessageInfo from "@/shared/components/MessageInfo";
import DozenByWeeks from "@/features/dozens/components/DozenByWeeks";

const WorkerHistory = ({
  workerHistory,
  isHistoryDialogOpen,
  setIsHistoryDialogOpen,
}) => {
  return (
    <Dialog
      header={
        <>
          <h3 className="font-bold text-gray-700 pb-3">Historial</h3>
          <p
            className="text-gray-600 text-base"
            style={{ fontWeight: "normal" }}
          >
            Todas las docenas realizadas por este trabajador{" "}
            <strong>hasta Hoy</strong>.
          </p>
        </>
      }
      maximized
      contentStyle={{ paddingLeft: "12px", paddingRight: "12px" }}
      visible={isHistoryDialogOpen}
      onHide={() => {
        if (!isHistoryDialogOpen) return;
        setIsHistoryDialogOpen(false);
      }}
      footer={
        <Button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={() => setIsHistoryDialogOpen(false)}
        />
      }
      closable={false}
    >
      {workerHistory?.dozens?.length === 0 && (
        <MessageInfo
          title="Oops... no encontramos nada"
          intro="Actualmente no existen registros que mostrar en esta sección"
        />
      )}
      <DozenByWeeks dozens={workerHistory?.dozens} type="workers_dozens" />
    </Dialog>
  );
};

export default WorkerHistory;
