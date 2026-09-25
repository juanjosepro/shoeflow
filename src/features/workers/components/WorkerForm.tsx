import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import api from "@/shared/lib/axios";
import type { Worker, Team } from "../types/worker";
import { InputSwitch } from "primereact/inputswitch";

const schema = z.object({
  team_id: z.number({ message: "Seleccione un equipo" }),
  names: z.string().min(1, "El nombre es obligatorio"),
  dni: z.string().min(8, "El DNI es obligatorio"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  worker?: Worker | null;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export const WorkerForm = ({
  worker = null,
  visible,
  onHide,
  onSubmit,
  isLoading,
}: Props) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      team_id: undefined,
      names: "",
      dni: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      is_active: true,
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [teamsRes] = await Promise.all([
          api.get<Team[]>("staff/teams/?no_pagination=true"),
        ]);
        setTeams(teamsRes.data);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (worker) {
      reset({
        team_id: worker.team.id,
        names: worker.names,
        dni: worker.dni,
        phone: worker.phone,
        address: worker.address,
        email: worker.email,
        password: worker.password,
        is_active: worker.is_active,
      });
    } else {
      reset({
        team_id: undefined,
        names: "",
        dni: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        is_active: true,
      });
    }
  }, [worker, reset]);

  const footer = (
    <div className="flex justify-content-end align-items-center">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={isLoading}
      />
      <Button
        label={isLoading ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        severity={worker ? "warning" : "success"}
        loading={isLoading}
        onClick={handleSubmit(onSubmit)}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (isLoading) return;
        onHide();
      }}
      header={worker ? "Editar Trabajador" : "Nuevo Trabajador"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid"
      style={{ width: "40vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      {loadingData ? (
        <div
          className="flex align-items-center justify-content-center"
          style={{ minHeight: "200px" }}
        >
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
        </div>
      ) : (
        <div className="flex flex-column gap-3 pt-2">
          {/* Equipo */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Equipo *</label>
            <Controller
              name="team_id"
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={teams}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione un equipo"
                  invalid={!!errors.team_id}
                  className="w-full"
                />
              )}
            />
            {errors.team_id && (
              <small className="p-error">{errors.team_id.message}</small>
            )}
          </div>

          {/* Nombre */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Nombre *</label>
            <Controller
              name="names"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.names}
                  className="uppercase"
                />
              )}
            />
            {errors.names && (
              <small className="p-error">{errors.names.message}</small>
            )}
          </div>

          {/* DNI */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">N° documento *</label>
            <Controller
              name="dni"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.dni}
                  className="uppercase"
                />
              )}
            />
            {errors.dni && (
              <small className="p-error">{errors.dni.message}</small>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Teléfono</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <InputText {...field} invalid={!!errors.phone} />
              )}
            />
            {errors.phone && (
              <small className="p-error">{errors.phone.message}</small>
            )}
          </div>

          {/* Dirección */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Dirección</label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.address}
                  className="uppercase"
                />
              )}
            />
            {errors.address && (
              <small className="p-error">{errors.address.message}</small>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText {...field} invalid={!!errors.email} />
              )}
            />
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>

          {/* Contraseña */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Contraseña</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  type="password"
                  invalid={!!errors.password}
                />
              )}
            />
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>

          {/* Estado */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Estado</label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <InputSwitch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.value)}
                />
              )}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};
