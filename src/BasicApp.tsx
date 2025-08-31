// Ultra-basic app to test core components one by one
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Simple test component
const TestLanding = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>🏠 STOLEN App Landing Page</h1>
    <p>Basic routing is working!</p>
    <div style={{ marginTop: '20px' }}>
      <a href="/test-dashboard" style={{ marginRight: '20px' }}>Dashboard</a>
      <a href="/test-marketplace">Marketplace</a>
    </div>
  </div>
);

const TestDashboard = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>📊 Dashboard</h1>
    <p>Dashboard route is working!</p>
    <a href="/">Back to Home</a>
  </div>
);

const TestMarketplace = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>🛒 Marketplace</h1>
    <p>Marketplace route is working!</p>
    <a href="/">Back to Home</a>
  </div>
);

const BasicApp = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TestLanding />} />
      <Route path="/test-dashboard" element={<TestDashboard />} />
      <Route path="/test-marketplace" element={<TestMarketplace />} />
    </Routes>
  </BrowserRouter>
);

export default BasicApp;
