import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Poojas from './pages/Poojas';
import Devotees from './pages/Devotees';
import Staff from './pages/Staff';
import Expenses from './pages/Expenses';
import NotFound from './pages/NotFound';
import PoojaList from './pages/PoojaList';

const App = () => (
  <Router>
    <Navbar />
    <div className="container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
        <Route path="/poojas" element={<ProtectedRoute><Poojas /></ProtectedRoute>} />
        <Route path="/AllPoojas" element={<ProtectedRoute><PoojaList /></ProtectedRoute>} />
        <Route path="/devotees" element={<ProtectedRoute><Devotees /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    <Footer />
  </Router>
);

export default App;
