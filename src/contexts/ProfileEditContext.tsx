'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileEditContextType {
  isEditing: boolean;
  editingSection: string | null;
  toggleEdit: () => void;
  startEdit: () => void;
  stopEdit: () => void;
  startEditSection: (section: string) => void;
  stopEditSection: () => void;
}

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(undefined);

export const useProfileEdit = () => {
  const context = useContext(ProfileEditContext);
  if (context === undefined) {
    throw new Error('useProfileEdit must be used within a ProfileEditProvider');
  }
  return context;
};

interface ProfileEditProviderProps {
  children: ReactNode;
}

export const ProfileEditProvider: React.FC<ProfileEditProviderProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const toggleEdit = () => {
    setIsEditing(prev => !prev);
    if (isEditing) {
      setEditingSection(null);
    }
  };

  const startEdit = () => {
    setIsEditing(true);
  };

  const stopEdit = () => {
    setIsEditing(false);
    setEditingSection(null);
  };

  const startEditSection = (section: string) => {
    setEditingSection(section);
  };

  const stopEditSection = () => {
    setEditingSection(null);
  };

  const value = {
    isEditing,
    editingSection,
    toggleEdit,
    startEdit,
    stopEdit,
    startEditSection,
    stopEditSection
  };

  return (
    <ProfileEditContext.Provider value={value}>
      {children}
    </ProfileEditContext.Provider>
  );
};
