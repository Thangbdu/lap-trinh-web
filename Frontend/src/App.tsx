import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerification from './pages/OtpVerification';
import ResetPassword from './pages/ResetPassword';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import PaymentGateway from './pages/PaymentGateway';
import Wishlist from './pages/Wishlist';
import AddressBook from './pages/AddressBook';
import Admin from './pages/Admin';
import Staff from './pages/Staff';
import PaymentListener from './components/PaymentListener';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PaymentListener />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/payment-gateway/:id" element={<PaymentGateway />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/staff" element={<Staff />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

