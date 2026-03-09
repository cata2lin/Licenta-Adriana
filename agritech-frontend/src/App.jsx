import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import CreateListing from './pages/CreateListing';
import Orders from './pages/Orders';
import Contracts from './pages/Contracts';
import Logistics from './pages/Logistics';
import Disputes from './pages/Disputes';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/market" element={<Market />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Toast />
      </AppProvider>
    </BrowserRouter>
  );
}
