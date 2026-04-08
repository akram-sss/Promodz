import React, { useState } from 'react';
import './Registration.css';
import Step1 from './RegistrationSteps/Step1';
import Step2 from './RegistrationSteps/Step2';
import Step3 from './RegistrationSteps/Step3';
import { useNavigate } from 'react-router-dom';

export default function Registration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'USER',
  });
  const navigate = useNavigate();

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="registration-container">
      <div className="registration-left">
        <div className="registration-image">
          <div className="overlay-content">
            <h2>Join Us Today!</h2>
            <p>Create your account and start your journey</p>
            <div className="features-list">
              <div className="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>Easy & Quick Setup</div>
              </div>
              <div className="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>Secure & Private</div>
              </div>
              <div className="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="registration-right">
        <div className="registration-form">
          <div className="form-header">
            <h1>Create Account</h1>
            <p className="subtitle">Get started in just a few steps</p>
          </div>

          {/* Stepper */}
          <div className="stepper">
            <div className="step-item">
              <div className={`step-circle ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                {step > 1 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : '1'}
              </div>
              <span className="step-label">Personal</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className="step-item">
              <div className={`step-circle ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                {step > 2 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : '2'}
              </div>
              <span className="step-label">Verify</span>
            </div>
            <div className={`step-line ${step === 3 ? 'active' : ''}`}></div>
            <div className="step-item">
              <div className={`step-circle ${step === 3 ? 'active' : ''}`}>3</div>
              <span className="step-label">Interests</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="step-content">
            {step === 1 && <Step1 onNext={nextStep} formData={formData} updateFormData={updateFormData} />}
            {step === 2 && <Step2 onBack={prevStep} onNext={nextStep} formData={formData} />}
            {step === 3 && <Step3 onBack={prevStep} formData={formData} />}
          </div>

          <div className="signin-prompt">
            <span>Already have an account? </span>
            <button
              type="button"
              className="signin-link"
              onClick={() => navigate('/connection')}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
