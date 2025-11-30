import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tools from './pages/Tools';
import About from './pages/About';
import Contact from './pages/Contact';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tools" element={<Tools />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            {/* Catch all redirect to home */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;