import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./providers/AppProviders"; // Импортируем всех провайдеров
import App from "./App";
import "./styles/main.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AppProviders>
    {" "}
    {/* Всё в одном провайдере */}
    <App />
  </AppProviders>
);
