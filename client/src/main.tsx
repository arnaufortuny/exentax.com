import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import { registerServiceWorker } from "./lib/register-sw";
import { initSentry } from "./lib/sentry";

initSentry();
registerServiceWorker();

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

setTimeout(() => {
  if (typeof (window as any).__removeInitialLoader === 'function') {
    (window as any).__removeInitialLoader();
  }
}, 300);
