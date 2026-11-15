// [PED] ARCHIVO NUEVO ─ features/customers/pages/CustomersPage.tsx
import { useState } from "react";
import { Button } from "primereact/button";
import { toast } from "@/shared/lib/toast";
import { useCustomers } from "../hooks/useCustomers";
import CustomerList from "../components/CustomerList";
import CustomerFormDialog from "../components/CustomerFormDialog";
import type { Customer, CustomerFormData } from "../types/customer";

export const CustomersPage = () => {
  const c = useCustomers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setDialogOpen(true);
  };

  const save = (data: CustomerFormData) =>
    editing ? c.updateCustomer(editing.id, data) : c.addCustomer(data);

  const toggle = async (customer: Customer) => {
    try {
      await c.toggleActive(customer);
      toast.success(
        customer.is_active ? "Cliente desactivado." : "Cliente activado.",
      );
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 pb-4">
        <div>
          <h2 className="m-0">Clientes</h2>
          <small style={{ color: "var(--ink-2)" }}>
            {c.total} {c.total === 1 ? "cliente" : "clientes"}
          </small>
        </div>
        <Button
          label="Nuevo cliente"
          icon="pi pi-plus"
          className="sf-btn--clay text-white p-button-sm"
          onClick={openNew}
        />
      </div>

      <CustomerList
        customers={c.customers}
        loading={c.loading}
        total={c.total}
        page={c.page}
        onPageChange={c.setPage}
        search={c.search}
        onSearchChange={c.setSearch}
        activeFilter={c.activeFilter}
        onFilterChange={c.changeFilter}
        onEdit={openEdit}
        onToggleActive={toggle}
      />

      <CustomerFormDialog
        visible={dialogOpen}
        customer={editing}
        onHide={() => setDialogOpen(false)}
        onSave={save}
      />
    </>
  );
};

export default CustomersPage;
