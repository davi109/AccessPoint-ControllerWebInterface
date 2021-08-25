import React from 'react';

import './global.css';

import Routes from './routes';
import { AuthProvider } from './Context/AuthContext';
import Avisos from './pages/Avisos'

function App() {

  return (
    <AuthProvider>
      <Routes />
      <Avisos />
    </AuthProvider>
  );
}

export default App;