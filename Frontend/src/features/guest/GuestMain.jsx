import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';

import "./GuestMain.css"

export default function GuestMain() {
  return (
    <div className='LandingPage'>
        <Navbar />
        <Outlet />
        <Footer />
    </div>
  )
}
