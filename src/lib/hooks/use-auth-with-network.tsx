import { useState, useEffect } from 'react';

const useAuthWithNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('offline');

  useEffect(() => {
    const checkAuth = async () => {
      // Simulate authentication check
      const authStatus = await new Promise((resolve) =>
        setTimeout(() => resolve(true), 1000)
      );
      setIsAuthenticated(authStatus);
    };

    const updateNetworkStatus = () => {
      // Simulate network status check
      const status = navigator.onLine ? 'online' : 'offline';
      setNetworkStatus(status);
    };

    checkAuth();
    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return { isAuthenticated, networkStatus };
};

export default useAuthWithNetwork;