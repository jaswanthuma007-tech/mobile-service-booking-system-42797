import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import BookingFlow from './pages/BookingFlow';
import BookingConfirmation from './pages/BookingConfirmation';
import AdminDashboard from './pages/AdminDashboard';
import TrackStatus from './pages/TrackStatus';
import StoreLocator from './pages/StoreLocator';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

// PUBLIC_INTERFACE
function App() {
  /** Application entry: sets up routing for landing, booking flow, and admin dashboard. */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/booking" element={<BookingFlow />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />

        <Route path="/track-status" element={<TrackStatus />} />
        <Route path="/store-locator" element={<StoreLocator />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
