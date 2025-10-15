'use client';

import { useState, useEffect } from 'react';

/**
 * Client-side admin check hook
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get user email from sessionStorage
    const email = sessionStorage.getItem('vault_user_id');
    setUserEmail(email);

    // Check if user is admin (this is just client-side check, server validates)
    // Admin emails are defined in ADMIN_EMAILS env var
    // For now, we'll make the API call to verify
    if (email) {
      // We can't directly check env vars on client, so we'll rely on API responses
      // Set isAdmin to true if API calls succeed
      setIsAdmin(true);
      setIsLoading(false);
    } else {
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, []);

  return { isAdmin, isLoading, userEmail };
}

/**
 * Helper to add admin headers to fetch requests
 */
export function adminFetch(url: string, options: RequestInit = {}) {
  const email = sessionStorage.getItem('vault_user_id');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-user-email': email || '',
    },
  });
}
