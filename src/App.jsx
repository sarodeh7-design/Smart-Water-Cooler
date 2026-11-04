import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import KioskPage from './pages/KioskPage';
import AdminPage from './pages/AdminPage';
import Toast from './components/Toast';

// Using HashRouter for maximum compatibility with static hosts
// (GitHub Pages, Netlify _redirects-free, file:// protocol).
// Switch to BrowserRouter + a catch-all redirect if you have server control.

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Toast />
        <Routes>
          <Route path="/" element={<KioskPage />} />
          <Route path="/station/:id" element={<KioskPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}
