import ReactDOM from "react-dom/client";
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import ApartPage from './ApartTable/ApartPage';
import Koren from './Koren';
import BalancePage from './Balance/BalancePage';
import HistoryPage from './History/HistoryPage';
import MessageTable from "./Test";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement); 

export const HOSTLINK = 'http://localhost:8000';
export const ASIDELINK = 'http://localhost:3000';

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Koren />} />
      <Route path="/aparts" element={<ApartPage />} />
      <Route path="/balance" element={<BalancePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/test" element={<MessageTable />} />
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
