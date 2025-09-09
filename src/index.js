import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./assets/css/App.css";
import reportWebVitals from "./reportWebVitals";
import { ErrorProvider } from "./contexts/ErrorContext";
// import suppressAllResizeObserverErrors from "./utils/suppressAllResizeObserverErrors";

// Completely suppress ResizeObserver loop errors - TEMPORARILY DISABLED FOR TESTING
// suppressAllResizeObserverErrors();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorProvider>
      <App />
    </ErrorProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
