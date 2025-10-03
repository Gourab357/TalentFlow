import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { makeServer } from "./server";

// Start the mock server in dev and production preview
if (typeof window !== 'undefined' && !window.__MIRAGE__) {
  makeServer({ environment: "development" });
  window.__MIRAGE__ = true;
}

createRoot(document.getElementById("root")).render(<App />);
