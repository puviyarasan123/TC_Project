import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import TCForm from './pages/TCForm';
import TCPreview from './pages/TCPreview';
import Records from './pages/Records';
import { CollegeProvider } from './context/CollegeContext';
import './App.css';

const App: React.FC = () => (
  <BrowserRouter>
    <CollegeProvider>
      <nav className="app-nav">
        <div className="nav-brand">
          <div className="nav-brand-icon">TC</div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">Transfer Certificate System</span>
            <span className="nav-brand-sub">Palar Agricultural College</span>
          </div>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>＋ New TC</NavLink>
          <NavLink to="/records" className={({ isActive }) => isActive ? 'active' : ''}>☰ Records</NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/"           element={<TCForm />} />
        <Route path="/preview/:id" element={<TCPreview />} />
        <Route path="/records"    element={<Records />} />
      </Routes>
    </CollegeProvider>
  </BrowserRouter>
);

export default App;
