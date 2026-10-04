import { StrictMode, useEffect } from "react";
import { useThemeStore } from "./store/themeStore";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./assets/styles/globals.scss";
import { setupPrimeReactLocale } from "./config/primeReactLocale";
import App from "./App";

setupPrimeReactLocale();

function Root() {
  const { dark } = useThemeStore();

  useEffect(() => {
    const link = document.getElementById("theme-link") as HTMLLinkElement;
    if (link) {
      link.href = dark
        ? "/themes/lara-dark-indigo/theme.css"
        : "/themes/lara-light-indigo/theme.css";
    }
  }, [dark]);

  return (
    <StrictMode>
      <BrowserRouter>
        <PrimeReactProvider value={{ ripple: true }}>
          <App />
        </PrimeReactProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
