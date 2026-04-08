import React from 'react';
import './AdminMain.css'; // Assuming you have a CSS file for styling
import DachboardAdmin from './Dashboard/DachboardAdmin';


function AdminMain() {
  return (

        <div className="app">
            <div className="main">
                <DachboardAdmin />
            </div>
        </div>
  );
}

export default AdminMain;