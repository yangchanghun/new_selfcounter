import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home.tsx";
import Cart from "./page/Cart.tsx";
import ItemAddPage from "./page/ItemAddPage.tsx";
import ItemListPage from "./page/ItemListPage.tsx";
import PayPage from "./page/PayPage.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/itemadd" element={<ItemAddPage />} />
        <Route path="/itemlist" element={<ItemListPage />} />
      </Routes>
    </BrowserRouter>
  </>,
);
