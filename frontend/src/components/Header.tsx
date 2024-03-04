import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "@/context/AuthContext.tsx";
import {Button} from "@/components/ui/button.tsx";
export const Header = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/");
    }
  return (
      <header className="flex items-center px-4 py-2 border-b justify-between sm:px-6 [& > *]:gap-2">
          <Link className="flex items-center space-x-4" to="/">
            Weather app
          </Link>
          {user ? (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                          <AvatarImage src={user?.avatar} alt="@shadcn" />
                          <AvatarFallback>{user?.sub[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          ) : (
              <div className="flex gap-2">
                  <Link to="/signup">
                        <Button variant="link">Signup</Button>
                  </Link>
              </div>
          )}
      </header>
  );
};