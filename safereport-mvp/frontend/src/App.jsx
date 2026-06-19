import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Track from './pages/Track';
import Admin from './pages/Admin';
import WhatsAppMock from './pages/WhatsAppMock';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="submit" element={<Submit />} />
        <Route path="track" element={<Track />} />
        <Route path="whatsapp" element={<WhatsAppMock />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App;
