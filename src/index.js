import CssBaseline from "@mui/material/CssBaseline";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// if (process.env.NODE_ENV === "development") {
//   const { worker } = require("./mockData/browser");
//   worker.start();
// }
root.render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>
);
