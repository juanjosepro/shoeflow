import { Outlet } from 'react-router-dom';
import Header from "./components/Header";

export default function AdminLayout() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', marginTop: '2rem' }} className="px-4 w-full">
        <Outlet />
      </main>
    </>
  );
}