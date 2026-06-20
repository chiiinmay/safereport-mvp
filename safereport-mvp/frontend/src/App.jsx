import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Track from './pages/Track';
import Admin from './pages/Admin';
import WhatsAppMock from './pages/WhatsAppMock';
import { LanguageProvider } from './i18n/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="submit" element={<Submit />} />
          <Route path="track" element={<Track />} />
          <Route path="whatsapp" element={<WhatsAppMock />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </LanguageProvider>
  );
}

export default App;

