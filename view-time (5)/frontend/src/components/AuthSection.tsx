import React from 'react';
import { useAuthStore } from 'utils/auth';
import { GoogleAuthButton } from 'components/GoogleAuthButton';
import { Button } from 'components/Button';
import { Link } from 'react-router-dom';

interface Props {
  className?: string;
}

export function AuthSection({ className = '' }: Props) {
  const { user } = useAuthStore();

  return (
    <div className={`${className} flex items-center gap-4`}>
      {user && (
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      )}
      <GoogleAuthButton size="sm" />
    </div>
  );
}
