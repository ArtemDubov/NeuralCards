import React from "react";
import ReactDOM from "react-dom/client";
import { QueryProvider } from "./providers/QueryProvider";
import App from "./App";
import "./styles/main.css";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <QueryProvider>
    <App />
  </QueryProvider>
);
