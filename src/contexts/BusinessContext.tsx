import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Business {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  currency: string;
  gst_enabled: boolean;
  gstin: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  business_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface BusinessContextType {
  business: Business | null;
  profile: Profile | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setBusiness(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);

      // Fetch business
      if (profileData.business_id) {
        const { data: businessData } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', profileData.business_id)
          .single();

        if (businessData) {
          setBusiness(businessData as Business);
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <BusinessContext.Provider value={{ business, profile, loading, refetch: fetchData }}>
      {children}
    </BusinessContext.Provider>
  );
};
