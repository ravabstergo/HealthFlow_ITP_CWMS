import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorSchedule from './components/DoctorSchedule';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DoctorSchedule />} />
          <Route path="/schedule" element={<DoctorSchedule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

