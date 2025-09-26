import { Routes, Route, Link, Router } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import PrivacyPolicyTerraControl from './components/PrivacyTerms/PrivacyPolicyTerraControl';
import DeleteAccountPage from './components/DeleteAccount/DeleteAccountPage';
import './App.css';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/terms' element={<PrivacyPolicyTerraControl/>}/>
        <Route path='/delete' element={<DeleteAccountPage/>} />
      </Routes>
  );
}

export default App;
