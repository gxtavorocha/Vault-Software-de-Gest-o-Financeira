import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { FinanceProvider } from "./context/FinanceContext";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
