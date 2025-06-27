import React from 'react';

const RequestDemo = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h2 style={{
            textAlign: 'center',
            fontSize: '1.875rem',
            fontWeight: '800',
            color: '#111827'
          }}>
            Book a Demo
          </h2>
          <p style={{
            marginTop: '0.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Fill out the form below to schedule a demo with our team.
          </p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <iframe
            src="https://docs.google.com/forms/d/e/[FORM_ID]/viewform?embedded=true"
            style={{
              width: '100%',
              height: '500px',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem'
            }}
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="Request a Demo Form"
          >
            Loading…
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default RequestDemo;