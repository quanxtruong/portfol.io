import React from "react";
import ReactDOM from "react-dom/client"; // Use `react-dom/client` for React 18+
import { CourseworkProvider } from "./context/CourseworkContext";
import App from "./App";
import reportWebVitals from './reportWebVitals';

// Create a root element
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the app using the new API
root.render(
  <React.StrictMode>
    <CourseworkProvider>
      <App />
    </CourseworkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
