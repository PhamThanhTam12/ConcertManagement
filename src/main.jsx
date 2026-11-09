import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import App from "./App";
import AuthProvider from "./context/AuthProvider";
import ConcertProvider from "./context/ConcertProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConcertProvider>
          <App />
        </ConcertProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
