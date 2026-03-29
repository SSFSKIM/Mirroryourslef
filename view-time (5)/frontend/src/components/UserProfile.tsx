import { useAuthStore } from 'utils/auth';

interface Props {
  className?: string;
}

export function UserProfile({ className = '' }: Props) {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User'}
          className="w-8 h-8 rounded-full ring-1 ring-border"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center ring-1 ring-border">
          <span className="text-secondary-foreground text-sm font-semibold">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </span>
        </div>
      )}
      <div className="leading-tight">
        <p className="font-display text-sm font-medium text-foreground">{user.displayName}</p>
        <p className="text-xs text-ink-soft">{user.email}</p>
      </div>
    </div>
  );
}
