import React from 'react';
import { useAuthStore } from 'utils/auth';
import { Card, CardContent } from 'components/Card';

interface Props {
  className?: string;
}

export function UserProfile({ className = '' }: Props) {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center gap-4">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-secondary-foreground font-semibold">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium">{user.displayName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
