import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { auth } = useAuth();
  const [settings, setSettings] = useState({
    global_order_processing_enabled: 'true',
    global_currency: 'USD'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!auth) return;
    try {
      const res = await api.get('/settings/admin');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch global settings', err);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (auth) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [auth, fetchSettings]);

  const updateSetting = async (newSettings) => {
    try {
      await api.post('/settings/admin', newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (err) {
      console.error('Failed to update settings', err);
      return false;
    }
  };

  const currencySymbol = useMemo(() => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
    };
    return symbols[settings.global_currency] || settings.global_currency || '$';
  }, [settings.global_currency]);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      loading, 
      refreshSettings: fetchSettings, 
      updateSetting,
      currencySymbol 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
