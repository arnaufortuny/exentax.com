import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import { registerServiceWorker } from "./lib/register-sw";
import { initSentry } from "./lib/sentry";

initSentry();
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
