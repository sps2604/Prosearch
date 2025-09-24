import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";   
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
