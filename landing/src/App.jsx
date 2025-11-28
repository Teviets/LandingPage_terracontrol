import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import PrivacyPolicyTerraControl from './components/PrivacyTerms/PrivacyPolicyTerraControl';
import DeleteAccountPage from './components/DeleteAccount/DeleteAccountPage';
import AdminLogin from './components/admin/screens/AdminLogin';
import AdminDashboard from './components/admin/screens/AdminDashboard';
import ProtectedRoute from './components/admin/components/ProtectedRoute';
import './App.css';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/terms' element={<PrivacyPolicyTerraControl/>}/>
        <Route path='/delete' element={<DeleteAccountPage/>} />
        <Route path='/admin' element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<AdminDashboard />} />
        </Route>
      </Routes>
  );
}

export default App;
