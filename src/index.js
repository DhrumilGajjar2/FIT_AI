import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
// Function to render the app safely
const renderApp = () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Error: Root element not found. Ensure 'index.html' contains a <div id='root'></div>.");
    return;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Execute the render function
renderApp();
