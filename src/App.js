import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import ModelCardUpload from './components/ModelCardUpload';
import ModelCardDetail from './components/ModelCardDetail';
import ModelMarketplace from './components/ModelCardLibrary';
import ModelCardTemplate from './components/ModelCardTemplate';
import ModelCardEdit from './components/ModelCardEdit';
import Layout from './components/Layout';

function App() {
  return (
    <Router basename="/model-card-demo">
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/modelcardupload" element={<Layout><ModelCardUpload /></Layout>} />
        <Route path="/card/:id" element={<Layout><ModelCardDetail /></Layout>} />
        <Route path="/marketplace" element={<Layout><ModelMarketplace /></Layout>} />
        <Route path="/create" element={<Layout><ModelCardTemplate /></Layout>} />
        <Route path="/edit/:id" element={<Layout><ModelCardEdit /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;

