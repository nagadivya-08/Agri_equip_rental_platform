import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
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
import './App.css';

// Root redirect handler: / -> /dashboard if logged in, /equipment if visitor/logged out
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading session...</p>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/equipment" replace />;
};

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="content-wrapper">
        <Routes>
          {/* Default entry */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Public Equipment Routes */}
          <Route path="/equipment" element={<BrowseEquipment />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />

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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/equipment" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
