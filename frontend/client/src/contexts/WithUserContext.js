import React from 'react';
import { UserProvider } from './contexts/UserContext';

const WithUserProvider = ({ children }) => {
  return <UserProvider>{children}</UserProvider>;
};

export default WithUserProvider;