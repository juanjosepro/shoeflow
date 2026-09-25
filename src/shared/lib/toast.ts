import type { Toast } from 'primereact/toast';
import { createRef } from 'react';

export const toastRef = createRef<Toast>();

export const toast = {
  success: (message: string) => toastRef.current?.show({ severity: 'success', summary: 'Éxito', detail: message, life: 3000 }),
  error: (message: string) => toastRef.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 }),
  info: (message: string) => toastRef.current?.show({ severity: 'info', summary: 'Info', detail: message, life: 3000 }),
  warn: (message: string) => toastRef.current?.show({ severity: 'warn', summary: 'Aviso', detail: message, life: 3000 }),
};