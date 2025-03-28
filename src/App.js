import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MainPanel from './pages/MainPanel'; 
import Panel from './pages/Panel';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/main-panel" element={<MainPanel />} />
        <Route path="/panel" element={<Panel />} />
      </Routes>
    </Router>
  );
}

export default App;
