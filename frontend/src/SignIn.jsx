import React, { useEffect } from 'react';
import './SignIn.css';

const SignIn = ({ onCredentialResponse }) => {
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: onCredentialResponse
    });
    
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'outline', size: 'large' }
    );
  }, [onCredentialResponse]); // Add onCredentialResponse to dependency array

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1>BVRIT Weekly Reports</h1>
        <p>Sign in to continue</p>
        <div id="googleSignInButton"></div>
      </div>
    </div>
  );
};

export default SignIn;
