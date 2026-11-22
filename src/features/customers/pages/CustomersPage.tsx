// [PED] ARCHIVO NUEVO ─ features/customers/pages/CustomersPage.tsx
import { useState } from "react";
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
        openNew={openNew}
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
