import { Link } from "react-router-dom";
import { LayoutDashboard, Home, Users, FileText } from "lucide-react";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <Link
          to="/admin/dashboard"
          className="flex items-center p-2 rounded-lg hover:bg-gray-700"
        >
          <LayoutDashboard className="mr-2" size={20} />
          Dashboard
        </Link>
        <Link
          to="/admin/properties"
          className="flex items-center p-2 rounded-lg hover:bg-gray-700"
        >
          <Home className="mr-2" size={20} />
          Properties
        </Link>
        <Link
          to="/admin/users"
          className="flex items-center p-2 rounded-lg hover:bg-gray-700"
        >
          <Users className="mr-2" size={20} />
          Users
        </Link>
        <Link
          to="/admin/requests"
          className="flex items-center p-2 rounded-lg hover:bg-gray-700"
        >
          <FileText className="mr-2" size={20} />
          Requests
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;