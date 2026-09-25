import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EditProfile from './pages/EditProfile';
import Dashboard from './pages/Dashboard';
import BrowseEquipment from './pages/BrowseEquipment';
import EquipmentDetail from './pages/EquipmentDetail';
import MyListings from './pages/MyListings';
import AddEquipment from './pages/AddEquipment';
import EditEquipment from './pages/EditEquipment';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingListings from './pages/AdminPendingListings';
import AdminAllListings from './pages/AdminAllListings';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import MyBookings from './pages/MyBookings';
import OwnerBookings from './pages/OwnerBookings';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="app-layout">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0c231b',
              color: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              fontSize: '0.92rem',
            },
          }}
        />
        <Navbar />

        <main className="content-wrapper">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Dashboard & Profile */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Equipment Routes - Renter Only for Browsing */}
          <Route
            path="/equipment"
            element={
              <ProtectedRoute allowedRoles={['renter']}>
                <BrowseEquipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id"
            element={
              <ProtectedRoute allowedRoles={['renter', 'owner', 'admin']}>
                <EquipmentDetail />
              </ProtectedRoute>
            }
          />

          {/* Owner-Protected Equipment Management Routes */}
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-equipment"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <AddEquipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-equipment/:id"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <EditEquipment />
              </ProtectedRoute>
            }
          />

          {/* Booking Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['renter']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-bookings"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerBookings />
              </ProtectedRoute>
            }
          />

          {/* Admin Moderation Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPendingListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAllListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </ErrorBoundary>
);
}

export default App;
