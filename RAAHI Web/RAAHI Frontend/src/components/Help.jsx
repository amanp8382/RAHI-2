import React from 'react';

const Help = () => {
  return (
    <section id="help" className="page active">
      <div className="container">
        <h1>Help & Support</h1>
        <p>Get help with registration, safety features, and emergency contacts.</p>
        <div className="help-content">
          <div className="help-section">
            <h2>Emergency Numbers</h2>
            <div className="emergency-numbers">
              <div className="emergency-card">
                <h3>Police</h3>
                <a href="tel:100" className="emergency-number">100</a>
              </div>
              <div className="emergency-card">
                <h3>Ambulance</h3>
                <a href="tel:108" className="emergency-number">108</a>
              </div>
              <div className="emergency-card">
                <h3>Fire Service</h3>
                <a href="tel:101" className="emergency-number">101</a>
              </div>
              <div className="emergency-card">
                <h3>Tourist Helpline</h3>
                <a href="tel:1363" className="emergency-number">1363</a>
              </div>
            </div>
          </div>
          <div className="help-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>How do I register as a tourist?</h3>
                <p>Click on "Tourist Registration" in the navigation menu and follow the 4-step process to create your digital ID.</p>
              </div>
              <div className="faq-item">
                <h3>What documents do I need for KYC?</h3>
                <p>You can use your Passport, Aadhaar card, or Voter ID. Upload a clear photo or PDF of the document.</p>
              </div>
              <div className="faq-item">
                <h3>How do safety alerts work?</h3>
                <p>Based on your location and itinerary, you'll receive real-time alerts about safety concerns, weather, traffic, and events.</p>
              </div>
              <div className="faq-item">
                <h3>Is my personal information secure?</h3>
                <p>Yes, we follow strict privacy and security protocols. Your data is encrypted and only used for safety purposes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Help;