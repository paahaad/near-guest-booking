window.global ||= window;
import { Buffer } from "buffer";
global.Buffer = Buffer;
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { WalletSelectorContextProvider } from "./context/WalletSelectorContext";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
       <WalletSelectorContextProvider >
      <App />
  </WalletSelectorContextProvider>
  </React.StrictMode>
);
