"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { AuthProviderEnhanced } from './use-auth-enhanced';
import { useNetworkStatus } from './use-network-status';

// Combined provider for auth and network status
export default function AuthProviderWithNetwork({ children }: { children: ReactNode }) {
  return (
    <AuthProviderEnhanced>
      {children}
    </AuthProviderEnhanced>
  );
}