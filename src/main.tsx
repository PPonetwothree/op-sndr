import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App";
import { applyUrlState, startUrlSync } from "./store/urlSync";

// Restore a shared link before the first render, then keep the URL in step with the view.
applyUrlState();
startUrlSync();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
