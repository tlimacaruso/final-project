import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Help</h4>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/suporte">Support</a></li>
            <li><a href="/termos">Terms&Conditions</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>Email: suporte@reclothes.com</li>
            <li>Phone: +351 213 456 789</li>
            <li>Address: Rua dos Passarinhos 35 | 1500-423, Lisboa, Portugal</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 ReClothes. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;