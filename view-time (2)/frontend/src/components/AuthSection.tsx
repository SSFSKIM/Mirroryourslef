import React from 'react';
import { useAuthStore } from 'utils/auth';
import { GoogleAuthButton } from 'components/GoogleAuthButton';
import { Button } from 'components/Button';
import { useNavigate } from 'react-router-dom';

interface Props {
  className?: string;
}

export function AuthSection({ className = '' }: Props) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className={`${className} flex items-center gap-4`}>
      {user && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </Button>
      )}
      <GoogleAuthButton size="sm" />
    </div>
  );
}
