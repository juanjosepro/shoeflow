import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import api from "@/shared/lib/axios";
import type { Model } from "../types/model";
import type { Category, Size } from "@/shared/types";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  code_prefix: z.string().min(2, "El prefijo del código es obligatorio"),
  description: z.string().optional(),
  category: z.number({ message: "Seleccione una categoría" }),
  variants: z.record(z.string(), z.number().min(0)),
});

type FormData = z.infer<typeof schema>;

interface Props {
  model?: Model | null;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export const ModelForm = ({
  model = null,
  visible,
  onHide,
  onSubmit,
  isLoading,
}: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code_prefix: "",
      description: "",
      category: undefined,
      variants: {},
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [catsRes, sizesRes] = await Promise.all([
          api.get<Category[]>("catalog/categories/?no_pagination=true"),
          api.get<Size[]>("catalog/sizes/?no_pagination=true"),
        ]);
        setCategories(catsRes.data);
        setSizes(sizesRes.data);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (model) {
      reset({
        name: model.name,
        code_prefix: model.code_prefix,
        description: model.description,
        category: model.category.id,
        variants: model.variants.reduce(
          (acc, v) => {
            acc[String(v.size.id)] = parseFloat(v.standard_price);
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    } else {
      reset({
        name: "",
        code_prefix: "",
        description: "",
        category: undefined,
        variants: {},
      });
    }
  }, [model, reset]);

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
        severity={model ? "warning" : "success"}
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
      header={model ? "Editar Modelo" : "Nuevo Modelo"}
      footer={footer}
      closable={!isLoading}
      className="p-fluid sf-dialog"
      style={{ width: "40vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      {loadingData ? (
        <div
          className="flex align-items-center justify-content-center"
          style={{ minHeight: "200px" }}
        >
          <i
            className="pi pi-spin pi-spinner"
            style={{ fontSize: "2rem", color: "var(--clay)" }}
          />
        </div>
      ) : (
        <div className="flex flex-column gap-3 pt-2">
          {/* Categoría */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Línea de Calzado</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={categories}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione una línea"
                  invalid={!!errors.category}
                  className="w-full"
                />
              )}
            />
            {errors.category && (
              <small className="p-error">{errors.category.message}</small>
            )}
          </div>

          {/* Nombre */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Nombre</label>
            <InputText
              {...register("name")}
              invalid={!!errors.name}
              className="uppercase"
              placeholder="Ej. AIR MAX"
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          {/* Codigo de serie */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Codigo de serie</label>
            <Controller
              name="code_prefix"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  invalid={!!errors.code_prefix}
                  className="uppercase"
                  placeholder="Ej. AM"
                />
              )}
            />
            {errors.code_prefix && (
              <small className="p-error">{errors.code_prefix.message}</small>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-column gap-1">
            <label className="font-bold">Descripción</label>
            <InputText
              {...register("description")}
              invalid={!!errors.description}
              className="uppercase"
              placeholder="Ej. Línea clásica con cámara de aire"
            />
            {errors.description && (
              <small className="p-error">{errors.description.message}</small>
            )}
          </div>

          {/* Variantes por talla */}
          <div className="flex flex-column gap-2">
            <label className="font-bold">Precios por serie</label>
            {sizes.map((size) => (
              <div key={size.id} className="flex flex-column gap-1">
                <label>
                  <em>
                    {size.name} — {size.description}
                  </em>
                </label>
                <Controller
                  name={`variants.${size.id}`}
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      mode="currency"
                      currency="PEN"
                      currencyDisplay="code"
                      locale="es-PE"
                      minFractionDigits={0}
                      maxFractionDigits={0}
                      min={0}
                    />
                  )}
                />
              </div>
            ))}
            {errors.variants && (
              <small className="p-error">Revisa los precios</small>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};
