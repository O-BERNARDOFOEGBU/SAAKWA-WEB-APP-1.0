
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-blue-600">Saakwa</span> Laundry
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
