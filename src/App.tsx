import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import PhotoDiagnosis from './pages/PhotoDiagnosis';
import TreatmentPlans from './pages/TreatmentPlans';
import StartConsultation from './pages/StartConsultation.tsx';
import HealthEducation from './pages/HealthEducation';
import EmergencyGuide from './pages/EmergencyGuide';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { ShoppingProvider } from './contexts/ShoppingContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShoppingProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-medical-light">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="symptoms" element={<SymptomChecker />} />
                <Route path="consultation" element={<StartConsultation />} />
                <Route path="photo-diagnosis" element={<PhotoDiagnosis />} />
                <Route path="treatments" element={<TreatmentPlans />} />
                <Route path="education" element={<HealthEducation />} />
                <Route path="emergency" element={<EmergencyGuide />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </div>
        </Router>
        </ShoppingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;