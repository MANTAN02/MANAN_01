import React, { useEffect, useState } from "react";
import "../styles.css";
import { callBackendFunction, useAuth } from '../AuthContext';

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (authUser) {
          const data = await callBackendFunction('getUserProfile', 'GET');
          setProfile(data);
        }
      } catch (e) {
        setError('Failed to load profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [authUser]);

  if (loading) return <div className="profile-container"><div>Loading...</div></div>;
  if (error) return <div className="profile-container"><div style={{color:'#c00'}}>{error}</div></div>;
  if (!profile) return <div className="profile-container"><div>No profile found.</div></div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || profile.email}`}
             alt="Avatar" className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-name">{profile.displayName || profile.name || 'User'}</div>
          <div className="profile-email">{profile.email}</div>
        </div>
      </div>
      {/* You can add reviews and swaps here if you store them in Firestore */}
      {/* For now, just show basic profile info */}
    </div>
  );
} 
} 