import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import ProfileComplete from './pages/ProfileComplete';
import InactiveRoute from './components/InactiveRoute';
import Categories from './pages/Categories';
import Panel from './pages/Panel';
import UsersPanel from './pages/panel/Users';
import ProductsPanel from './pages/panel/Products';
import CreateProduct from './pages/panel/CreateProduct';
import ProductView from './pages/panel/ProductView';
import ProductEdit from './pages/panel/ProductEdit';
import InvoicesPanel from './pages/panel/Invoices';
import PaymentsPanel from './pages/panel/Payments';
import CategoriesPanel from './pages/panel/CategoriesPanel';
import NotificationsPanel from './pages/panel/NotificationsPanel';
import ReportsPanel from './pages/panel/Reports';
import SettingsPanel from './pages/panel/Settings';
import LogsPanel from './pages/panel/Logs';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4CAF50',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#f44336',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:id" element={<Home />} />
                
                {/* Protected Routes */}
                <Route path="/cart" element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                } />
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                } />
                <Route path="/orders" element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                } />
                <Route path="/orders/:id" element={
                  <PrivateRoute>
                    <OrderDetail />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/addresses" element={
                  <PrivateRoute>
                    <Addresses />
                  </PrivateRoute>
                } />
                <Route path="/profile/complete" element={
                  <InactiveRoute>
                    <ProfileComplete />
                  </InactiveRoute>
                } />
                <Route path="/panel/*" element={
                  <PrivateRoute>
                    <Panel />
                  </PrivateRoute>
                }>
                  <Route path="users" element={<UsersPanel />} />
                  <Route path="products" element={<ProductsPanel />} />
                  <Route path="products/view/:id" element={<ProductView />} />
                  <Route path="products/edit/:id" element={<ProductEdit />} />
                  <Route path="products/create" element={<CreateProduct />} />
                  <Route path="invoices" element={<InvoicesPanel />} />
                  <Route path="payments" element={<PaymentsPanel />} />
                  <Route path="categories" element={<CategoriesPanel />} />
                  <Route path="notifications" element={<NotificationsPanel />} />
                  <Route path="reports/*" element={<ReportsPanel />} />
                  <Route path="settings" element={<SettingsPanel />} />
                  <Route path="logs" element={<LogsPanel />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
