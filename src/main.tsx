import { Buffer } from "buffer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppButton from "./components/WhatsAppButton.tsx";
import ReactRouterProvider from "./providers/ReactRouterProvider.tsx";
import { SWRProvider } from "./providers/SWRProvider.tsx";

// Polyfill Buffer for @react-pdf/renderer
window.Buffer = Buffer;

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<SWRProvider>
			<ReactRouterProvider />
			<Toaster />
			<WhatsAppButton />
		</SWRProvider>
	</StrictMode>,
);
