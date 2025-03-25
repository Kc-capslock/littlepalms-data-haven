
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <nav className="sticky top-0 z-10 border-b bg-background px-4 py-3 md:px-6">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-placeholder.png" alt="Logo" className="h-8 w-8" />
          <span className="hidden font-semibold md:inline-block">Little Palms</span>
        </div>

        <form onSubmit={handleSearch} className="mx-4 flex-1 md:max-w-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="w-full bg-muted pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
