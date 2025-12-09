import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import App from "./App.tsx";
import Borrow from "./pages/Borrow";
import Repay from "./pages/Repay";
import Payroll from "./pages/Payroll";
import Dashboard from "./pages/Dashboard";

// ✅ Import WalletProvider
import { WalletProvider } from "./components/wallet/useWallet";

// -----------------------
// ROUTER SETUP
// -----------------------
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/borrow", element: <Borrow /> },
  { path: "/repay", element: <Repay /> },
  { path: "/payroll", element: <Payroll /> },
  { path: "/dashboard", element: <Dashboard /> },
]);

// -----------------------
// RENDER
// -----------------------
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider>   {/* ⭐ Wrap the entire app */}
      <RouterProvider router={router} />
    </WalletProvider>
  </StrictMode>
);