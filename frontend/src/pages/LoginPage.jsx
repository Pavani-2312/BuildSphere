import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import SignIn from '../SignIn'; // Import the SignIn component

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCredentialResponse = (response) => {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    // Mock user data - in production, send credential to backend for verification
    const userData = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: 'faculty', // Default role
      department: 'CSE(AI&ML)' // Default department
    };
    
    login(userData, credential);
    toast.success('Login successful');
    navigate('/dashboard');
  };

  return (
    <SignIn onCredentialResponse={handleCredentialResponse} />
  );
};

export default LoginPage;
