import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Tariffs from './pages/Tariffs';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Blog from './pages/Blog';
import Help from './pages/Help';
import BalconySolar from './pages/BalconySolar';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Subscribe from './pages/Subscribe';
import CompareSystemsPage from './pages/CompareSystemsPage';
import SavedCalculations from './pages/SavedCalculations';
import SystemTracker from './pages/SystemTracker';
import TestHealth from './pages/TestHealth';
import Products from './pages/Products';
import Roadmap from './pages/Roadmap';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookieInformation from './pages/CookieInformation';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="payback-calculator" element={<Calculator />} />
          <Route path="tariff-compare" element={<Tariffs />} />
          <Route path="balcony-solar" element={<BalconySolar />} />
          <Route path="dashboard" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Dashboard - Coming Soon</h1></div>} />
          <Route path="connect" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Connect - Coming Soon</h1></div>} />
          <Route path="history" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">History - Coming Soon</h1></div>} />
          <Route path="recommendations" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Recommendations - Coming Soon</h1></div>} />
          <Route path="load-shift-planner" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Load Shift Planner - Coming Soon</h1></div>} />
          <Route path="alerts" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Alerts - Coming Soon</h1></div>} />
          <Route path="learn/smart-tariffs" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Smart Tariffs Guide - Coming Soon</h1></div>} />
          <Route path="learn/balcony-solar" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Balcony Solar UK Guide - Coming Soon</h1></div>} />
          <Route path="learn/glossary" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Glossary - Coming Soon</h1></div>} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="help" element={<Help />} />
          <Route path="auth" element={<Auth />} />
          <Route path="account" element={<Account />} />
          <Route path="admin" element={<Admin />} />
          <Route path="subscribe" element={<Subscribe />} />
          <Route path="compare" element={<CompareSystemsPage />} />
          <Route path="saved" element={<SavedCalculations />} />
          <Route path="tracker" element={<SystemTracker />} />
          <Route path="test" element={<TestHealth />} />
          <Route path="products" element={<Products />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="cookies" element={<CookieInformation />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;