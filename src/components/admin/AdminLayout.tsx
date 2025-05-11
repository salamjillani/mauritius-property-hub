
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  Building,
  Home,
  LogOut,
  Menu,
  X,
  UserCheck,
  User,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is admin
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        toast({
          title: "Authentication required",
          description: "Please log in to access the admin panel",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        
        // Check if user is admin
        if (userData.data.role !== "admin") {
          navigate("/");
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin panel",
            variant: "destructive",
          });
          return;
        }

        setUser(userData.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    checkAuth();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin/dashboard",
    },
    {
      title: "Users",
      icon: <Users size={20} />,
      href: "/admin/users",
    },
    {
      title: "Agents",
      icon: <UserCheck size={20} />,
      href: "/admin/agents",
    },
    {
      title: "Agencies",
      icon: <Building size={20} />,
      href: "/admin/agencies",
    },
    {
      title: "Properties",
      icon: <Home size={20} />,
      href: "/admin/properties",
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile navigation overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-800 text-white flex flex-col z-50",
          collapsed ? "w-16" : "w-64",
          isMobile ? "fixed h-full transition-transform duration-300 ease-in-out" : "relative",
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4">
          {!collapsed && <h1 className="text-lg font-bold">Admin Panel</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-slate-700"
          >
            {isMobile ? <X size={20} /> : collapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>
        
        <Separator className="bg-slate-700" />
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-700",
                    window.location.pathname === item.href
                      ? "bg-slate-700 text-white"
                      : "text-slate-300"
                  )}
                >
                  <span>{item.icon}</span>
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white",
              collapsed ? "px-2" : ""
            )}
            onClick={handleLogout}
          >
            <LogOut size={20} className={collapsed ? "mx-auto" : "mr-2"} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-white border-b h-16 flex items-center px-6 shadow-sm">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
              <Menu size={20} />
            </Button>
          )}
          <div className="flex-1" />
          {user && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-right">
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white">
                <User size={16} />
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
