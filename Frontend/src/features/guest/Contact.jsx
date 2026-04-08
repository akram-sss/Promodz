import React, { useState } from 'react';
import { feedbackAPI } from '@shared/api';
import './Contact.css';

const faqs = [
  { question: "How do I reset my password?", answer: "To reset your password, go to the login page and click on 'Forgot Password'." },
  { question: "How can I contact support?", answer: "You can contact support using the form above or by emailing support@promodz.com." },
  { question: "What is the response time for support inquiries?", answer: "We typically respond within 24 hours." },
  { question: "Where can I find the user manual?", answer: "The user manual is available in the Help section of our website." },
  { question: "Can I change my subscription plan?", answer: "Yes, you can change your subscription plan from your account settings." },
];

const contactInfo = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
      </svg>
    ),
    title: 'Email Us',
    content: 'support@promodz.com',
    link: 'mailto:support@promodz.com'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Call Us',
    content: '+213 XXX XXX XXX',
    link: 'tel:+213XXXXXXXXX'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Visit Us',
    content: 'Algiers, Algeria',
    link: null
  }
];

export default function Contact() {
  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    message: '',
    role: 'user'
  });
  const [focusedField, setFocusedField] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success'|'error', message }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSubmitStatus(null);
    try {
      await feedbackAPI.sendContact({
        fullName: formData.firstName,
        email: formData.email,
        role: formData.role,
        message: formData.message,
      });
      setSubmitStatus({ type: 'success', message: 'Your message has been sent successfully!' });
      setFormData({ firstName: '', email: '', message: '', role: 'user' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to send message. Please try again.';
      setSubmitStatus({ type: 'error', message: msg });
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <div className="hero-badge">Get In Touch</div>
          <h1 className="contact-hero-title">We'd Love to Hear From You</h1>
          <p className="contact-hero-subtitle">
            Have a question, feedback, or need assistance? Our team is here to help you with anything you need.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, idx) => (
            <div key={idx} className="contact-info-card">
              <div className="contact-info-icon-wrapper">
                {info.icon}
              </div>
              <h3 className="contact-info-title">{info.title}</h3>
              {info.link ? (
                <a href={info.link} className="contact-info-content">{info.content}</a>
              ) : (
                <p className="contact-info-content">{info.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Contact Section */}
      <div className="contact-main">
        <div className="contact-image-wrapper">
          <div className="contact-image-decoration"></div>
          <img 
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f" 
            alt="Contact us" 
            className="contact-image"
          />
          <div className="contact-image-overlay">
            <div className="overlay-content">
              <h3>24/7 Support</h3>
              <p>We're always here to help you find the best deals</p>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-header">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className={`form-label ${focusedField === 'firstName' || formData.firstName ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
                Full Name
              </label>
              <input 
                type="text" 
                name="firstName"
                placeholder="Enter your first name" 
                value={formData.firstName}
                onChange={handleChange}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div className="form-group">
              <label className={`form-label ${focusedField === 'email' || formData.email ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email address" 
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label active" style={{ marginBottom: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
                I am a
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px'
              }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 20px',
                  border: formData.role === 'user' ? '2px solid #8b5cf6' : '2px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: formData.role === 'user' ? '#f3e5f5' : 'white',
                  transition: 'all 0.3s ease',
                  fontWeight: formData.role === 'user' ? '600' : '500',
                  color: formData.role === 'user' ? '#8b5cf6' : '#666',
                  fontSize: '16px'
                }}>
                  <input 
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '8px'
                  }}>
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                  User
                </label>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 20px',
                  border: formData.role === 'company' ? '2px solid #8b5cf6' : '2px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: formData.role === 'company' ? '#f3e5f5' : 'white',
                  transition: 'all 0.3s ease',
                  fontWeight: formData.role === 'company' ? '600' : '500',
                  color: formData.role === 'company' ? '#8b5cf6' : '#666',
                  fontSize: '16px'
                }}>
                  <input 
                    type="radio"
                    name="role"
                    value="company"
                    checked={formData.role === 'company'}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '8px'
                  }}>
                    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
                  </svg>
                  Company
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className={`form-label ${focusedField === 'message' || formData.message ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                  <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
                </svg>
                Message
              </label>
              <textarea 
                name="message"
                placeholder="Type your message here" 
                rows="5"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={sending}>
              <span>{sending ? 'Sending...' : 'Send Message'}</span>
              {!sending && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
              )}
            </button>

            {submitStatus && (
              <div className={`contact-submit-status ${submitStatus.type}`}>
                {submitStatus.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="faq-header">
          <div className="faq-badge">FAQ</div>
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our service</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${openIndex === idx ? 'active' : ''}`}
            >
              <div
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="faq-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="faq-question-text">{faq.question}</span>
                <span className={`faq-toggle ${openIndex === idx ? 'open' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <div className={`faq-answer ${openIndex === idx ? 'open' : ''}`}>
                <div className="faq-answer-content">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}