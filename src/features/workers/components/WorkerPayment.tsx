import { useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ListBox } from "primereact/listbox";
import { paymentStatusChoices } from "@/config/constants";
import { useWorkerDozens } from "../hooks/useWorkerDozens";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/es";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";

dayjs.locale("es");
dayjs.extend(isoWeek);

const WorkerPayment = ({
  selectedWorker,
  workerHistory,
  isPaymentDialogOpen,
  setIsPaymentDialogOpen,
  processWorkerPayment,
}) => {
  const { isLoading, updateWorkerDozen } = useWorkerDozens();
  const [selectedDozen, setSelectedDozen] = useState(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [pay, setPay] = useState(0);
  const toast = useRef(null);

  const handleSelectionPayment = (e) => {
    setSelectedDozen(e.value);

    setIsPayDialogOpen(true);
  };

  const isoWeekText = (day) => {
    const fecha = dayjs(day);

    const startOfWeek = fecha.startOf("isoWeek"); // lunes
    const endOfWeek = fecha.endOf("isoWeek"); // domingo

    return `Desde <strong>${startOfWeek.format(
      "D [de] MMMM",
    )}</strong> hasta <strong>${endOfWeek.format("D [de] MMMM")}</strong>`;
  };

  const makeFullPayment = async () => {
    // pagar todo
    try {
      await updateWorkerDozen(selectedDozen.id, {
        status: paymentStatusChoices.PAGADO,
        paid_at: selectedDozen.total_amount,
      });

      setSelectedDozen(null);

      setPay(0);

      processWorkerPayment();

      toast.current.show({
        severity: "success",
        summary: "Aviso",
        detail: "¡Acción realizada con éxito! 💪",
        life: 6000,
      });
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al pagar, intentelo nuevamente",
        life: 6000,
      });
    }

    setIsPayDialogOpen(false);
  };

  const makePartialPayment = async () => {
    // pagar una parte

    if (pay === "") {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "El monto a pagar no puede ser vacío",
        life: 6000,
      });
      return;
    }

    if (pay === 0) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "El monto a pagar no puede ser 0",
        life: 6000,
      });
      return;
    }

    if (pay > selectedDozen.total_amount) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "El monto a pagar no puede ser mayor al total",
        life: 6000,
      });
      return;
    }

    if (pay < 0) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "El monto a pagar no puede ser menor a 0",
        life: 6000,
      });
      return;
    }

    if (
      selectedDozen.status === paymentStatusChoices.INCOMPLETO &&
      pay > selectedDozen.total_amount - selectedDozen.paid_at
    ) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "El monto a pagar no puede ser mayor al saldo pendiente",
        life: 6000,
      });
      return;
    }

    let newState =
      selectedDozen.paid_at + pay === selectedDozen.total_amount
        ? paymentStatusChoices.PAGADO
        : paymentStatusChoices.INCOMPLETO;

    try {
      await updateWorkerDozen(selectedDozen.id, {
        status: newState,
        paid_at: selectedDozen.paid_at + pay,
      });

      setSelectedDozen(null);

      setPay(0);

      processWorkerPayment();

      toast.current.show({
        severity: "success",
        summary: "Aviso",
        detail: "¡Acción realizada con éxito! 💪",
        life: 6000,
      });
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al pagar, intentelo nuevamente",
        life: 6000,
      });
    }

    setIsPayDialogOpen(false);
  };

  const getWeekText = (date) => {
    const currentDate = dayjs();
    const d = dayjs(date);
    const startOfWeek = d.startOf("isoWeek");

    const weeksDiff = currentDate.startOf("isoWeek").diff(startOfWeek, "week");

    let title;

    if (weeksDiff === 0) {
      title = "esta semana";
    } else if (weeksDiff === 1) {
      title = "semana pasada";
    } else if (weeksDiff === 2) {
      title = "hace dos semanas";
    } else if (weeksDiff === 3) {
      title = "hace tres semanas";
    } else if (weeksDiff === 4) {
      title = "hace cuatro semanas";
    } else if (weeksDiff > 4 && weeksDiff <= 8) {
      title = "hace más de un mes";
    } else {
      title = "hace más de dos meses";
    }

    return title;
  };

  const listBoxBodySection = (dozen) => {
    const isSelected = selectedDozen && selectedDozen.id === dozen.id;

    return (
      <div className="flex align-items-center">
        <div className="flex gap-4 w-full">
          <Checkbox
            checked={isSelected}
            onChange={() => {
              setSelectedDozen(isSelected ? null : dozen);
            }}
            className="mt-1"
          />
          <div className="w-full">
            <h3 className="text-gray-600 font-bold text-md first-letter-uppercase">
              {getWeekText(dozen.created_at)}
            </h3>
            <p
              className="text-gray-700 pb-2"
              dangerouslySetInnerHTML={{
                __html: isoWeekText(dozen.created_at),
              }}
            ></p>
            <div className="grid grid-cols-3 gap-3">
              <span className="col-span-2">Cantidad de docenas:</span>
              <span className="col-span-1 text-right text-black text-s">
                x{dozen.dozens_per_week.length}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <span className="col-span-2">Total:</span>
              <span className="col-span-1 text-right text-green-500 text-lg">
                S/. {dozen.total_amount}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <span className="col-span-2">Pagado:</span>
              <span className="col-span-1 text-right text-green-500 text-lg">
                S/. {dozen.paid_at}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <span className="col-span-2">Estado de Pago:</span>
              {dozen.status === paymentStatusChoices.PAGADO ? (
                <Tag icon="pi pi-check" severity="success" value="Pagado" />
              ) : dozen.status === paymentStatusChoices.POR_PAGAR ? (
                <Tag
                  icon="pi pi-info-circle"
                  value="Por pagar"
                  style={{ backgroundColor: "var(--blue-500)" }}
                />
              ) : (
                <Tag
                  icon="pi pi-exclamation-triangle"
                  value="Incompleto"
                  style={{ backgroundColor: "var(--yellow-500)" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem" }} />
      </div>
    );
  }

  return (
    <>
      <Dialog
        header={
          <h3 className="font-bold text-gray-700">Pagar al trabajador</h3>
        }
        maximized
        position="bottom"
        visible={isPaymentDialogOpen}
        onHide={() => {
          if (!isPaymentDialogOpen) return;
          setIsPaymentDialogOpen(false);
        }}
        footer={
          <Button
            label="Cerrar"
            icon="pi pi-times"
            severity="secondary"
            outlined
            onClick={() => setIsPaymentDialogOpen(false)}
          />
        }
        closable={false}
      >
        <h2 className="text-gray-600">Resumen por semana</h2>

        {workerHistory?.dozens?.length > 0 && (
          <ListBox
            className="w-full md:w-14rem pau-list-box"
            options={workerHistory?.data}
            itemTemplate={listBoxBodySection}
            listStyle={{ maxHeight: "none" }}
            onChange={handleSelectionPayment}
            optionDisabled={(item) =>
              item.status === paymentStatusChoices.PAGADO
            }
          />
        )}
      </Dialog>

      <Dialog
        header={
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Realizar Pago</h3>
            <Button
              icon="pi pi-times"
              onClick={() => setIsPayDialogOpen(false)}
              severity="secondary"
              outlined
            />
          </div>
        }
        position="bottom"
        style={{ width: "94vw" }}
        maskStyle={{ backdropFilter: "blur(4px)" }}
        visible={isPayDialogOpen}
        onHide={() => {
          if (!isPayDialogOpen) return;
          setIsPayDialogOpen(false);
        }}
        closable={false}
      >
        <small
          className="text-gray-500 font-medium flex items-center gap-1 mb-1"
          style={{ fontSize: "1rem" }}
        >
          <i className="pi pi-check-circle" />
          <div>
            El pago es de{" "}
            <strong className="text-green-500">
              {getWeekText(selectedDozen?.created_at)}
            </strong>
            .
          </div>
        </small>
        <small
          className="text-gray-500 font-medium flex items-center gap-1 mb-1"
          style={{ fontSize: "1rem" }}
        >
          <i className="pi pi-check-circle" />
          <div>
            Se realizará el pago al trabajador{" "}
            <strong className="text-green-500">{selectedWorker?.name}</strong>.
          </div>
        </small>
        <small
          className="text-gray-500 font-medium flex items-center gap-1 mb-1"
          style={{ fontSize: "1rem" }}
        >
          <i className="pi pi-check-circle" />
          <div>
            Realizo{" "}
            <strong className="text-green-500">
              x{selectedDozen?.dozens_per_week?.length}
            </strong>{" "}
            docenas en esta Semana.
          </div>
        </small>
        {selectedDozen?.status === paymentStatusChoices.POR_PAGAR && (
          <small
            className="text-gray-500 font-medium flex items-center gap-1 mb-1"
            style={{ fontSize: "1rem" }}
          >
            <i className="pi pi-check-circle" />
            <div>
              El monto a pagar es{" "}
              <strong className="text-green-500">
                S/. {selectedDozen?.total_amount}
              </strong>
              .
            </div>
          </small>
        )}
        {selectedDozen?.status === paymentStatusChoices.INCOMPLETO && (
          <small
            className="text-gray-500 font-medium flex items-start gap-1 mb-1"
            style={{ fontSize: "1rem" }}
          >
            <i className="pi pi-check-circle mt-1" />
            <div>
              El monto a pagar es el <strong>saldo pendiente</strong> de{" "}
              <strong className="text-green-500">
                S/. {selectedDozen?.total_amount - selectedDozen?.paid_at}
              </strong>
              .
            </div>
          </small>
        )}
        <Divider />

        <Accordion activeIndex={0}>
          <AccordionTab header="Pagar Todo">
            {selectedDozen?.status === paymentStatusChoices.POR_PAGAR && (
              <small className="text-gray-500 mb-2 block">
                Se pagara todo el monto de la semana{" "}
                <strong>S/. {selectedDozen?.total_amount}</strong>.
              </small>
            )}
            {selectedDozen?.status === paymentStatusChoices.INCOMPLETO && (
              <small className="text-gray-500 mb-2 block">
                Se pagará todo el <strong>saldo pendiente</strong> de{" "}
                <strong>
                  S/. {selectedDozen?.total_amount - selectedDozen?.paid_at}
                </strong>
                .
              </small>
            )}
            <Button
              label="Pagar Todo"
              icon="pi pi-check-circle"
              disabled={!selectedDozen}
              onClick={makeFullPayment}
              style={{
                width: "100%",
                display: "block",
                backgroundColor: "var(--green-500)",
              }}
            />
          </AccordionTab>
          <AccordionTab header="Pagar Una Parte">
            <div className="flex flex-col gap-2">
              <label htmlFor="pay">Monto a pagar</label>
              <InputNumber
                inputId="currency-peru"
                value={pay}
                onChange={(e) => setPay(e.value)}
                mode="currency"
                currency="PEN"
                currencyDisplay="code"
                locale="es-PE"
                minFractionDigits={0}
                maxFractionDigits={0}
              />
              {selectedDozen?.status === paymentStatusChoices.POR_PAGAR && (
                <small id="pay-help">
                  El monto a pagar debe ser menor o igual al{" "}
                  <strong>total</strong> de{" "}
                  <strong>S/. {selectedDozen?.total_amount}</strong>
                </small>
              )}
              {selectedDozen?.status === paymentStatusChoices.INCOMPLETO && (
                <small className="mb-2 block">
                  El monto a pagar debe ser menor o igual al{" "}
                  <strong>saldo pendiente</strong> de{" "}
                  <strong>
                    S/. {selectedDozen?.total_amount - selectedDozen?.paid_at}
                  </strong>
                </small>
              )}
              <div className="py-1" />
              <Button
                label="Pagar una parte"
                icon="pi pi-check-circle"
                disabled={!selectedDozen}
                onClick={makePartialPayment}
                style={{
                  width: "100%",
                  display: "block",
                  backgroundColor: "var(--green-500)",
                }}
              />
            </div>
          </AccordionTab>
        </Accordion>
      </Dialog>

      <Toast ref={toast} position="top-center" />
    </>
  );
};

export default WorkerPayment;
