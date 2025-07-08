import React from 'react';
import '../styles/RequestDemo.css';

const RequestDemo = () => {
  return (
    <div className="request-demo-container">
      <div className="request-demo-card">
        <div className="request-demo-header">
          <h2 className="request-demo-title">
            Book a Demo
          </h2>
          <p className="request-demo-subtitle">
            Fill out the form below to schedule a demo with our team.
          </p>
        </div>
        
        <div className="request-demo-form-container">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSepF0QTYV590PdaiGHxLz66MwM1wkTLSZkVPZX909tJ_7oldw/viewform?pli=1"
            className="request-demo-iframe"
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