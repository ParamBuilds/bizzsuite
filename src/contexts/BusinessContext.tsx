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

    try {
      // Fetch profile (use maybeSingle to handle case where profile doesn't exist yet)
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no profile exists, create one with a new business
      if (!profileData) {
        console.log('No profile found, creating business and profile for user');
        
        // Create a new business
        const { data: newBusiness, error: bizError } = await supabase
          .from('businesses')
          .insert({ name: 'My Business' })
          .select()
          .single();

        if (bizError) {
          console.error('Error creating business:', bizError);
          setLoading(false);
          return;
        }

        // Create profile linked to the new business
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            business_id: newBusiness.id,
            full_name: user.email?.split('@')[0] || 'User',
            role: 'owner'
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          setLoading(false);
          return;
        }

        profileData = newProfile;
        setBusiness(newBusiness as Business);
        setProfile(newProfile as Profile);
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      // Fetch business if profile has business_id
      if (profileData.business_id) {
        const { data: businessData } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', profileData.business_id)
          .maybeSingle();

        if (businessData) {
          setBusiness(businessData as Business);
        }
      } else {
        // Profile exists but no business - create one
        const { data: newBusiness, error: bizError } = await supabase
          .from('businesses')
          .insert({ name: 'My Business' })
          .select()
          .single();

        if (!bizError && newBusiness) {
          // Update profile with new business_id
          await supabase
            .from('profiles')
            .update({ business_id: newBusiness.id })
            .eq('user_id', user.id);

          setBusiness(newBusiness as Business);
        }
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
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
