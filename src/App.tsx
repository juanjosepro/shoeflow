import AppRouter from "@/router";
import { Toast } from "primereact/toast";
import { toastRef } from "@/shared/lib/toast";

function App() {
  return (
    <>
      <Toast ref={toastRef} />
      <AppRouter />
    </>
  );
}

export default App;
