import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { DemoDataProvider } from "./demoDataStore";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoDataProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DemoDataProvider>
  </React.StrictMode>,
);
