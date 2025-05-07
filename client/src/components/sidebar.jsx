import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Button from "./ui/button";
import {
  Users,
  FileText,
  File,
  Calendar,
  BarChart2,
  DollarSign,
  UserCheck,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { logout, permissions, currentUser, activeRole, switchRole } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRoles, setUserRoles] = useState([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const handleRoleSwitch = async (roleId) => {
    try {
      await switchRole(roleId);
      setShowRoleMenu(false);
      // Reload the current page to refresh permissions
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch role:", error);
    }
  };

  useEffect(() => {
    // Fetch user roles when the component mounts
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();
        setUserRoles(data.user.roles || []);
      } catch (error) {
        console.error("Failed to fetch user roles:", error);
      }
    };

    fetchRoles();
  }, []);

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRoleMenu && !event.target.closest('.role-switcher')) {
        setShowRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoleMenu]);

  const menuItems = [
    {
      category: "CLINICAL",
      items: [
        { 
          name: "Patients", 
          icon: <Users className="w-4 h-4" />, 
          path: "patients",
          requiredPerm: "record:view:own"
        },
        { 
          name: "Past Appointments", 
          icon: <Calendar className="w-4 h-4" />, 
          path: "patient/appointment-history",
          requiredPerm: "record:view:linked"
        },
        { 
          name: "Prescriptions", 
          icon: <FileText className="w-4 h-4" />, 
          path: "prescription",
          requiredPerm: "prescription:view:own"
        },
        { 
          name: "Documents", 
          icon: <File className="w-4 h-4" />, 
          path: "documents",
          requiredPerm: "document:view:own"
        },
      ],
    },
    {
      category: "TELEMEDICINE",
      items: [
        { 
          name: "Appointments", 
          icon: <Calendar className="w-4 h-4" />, 
          path: "schedule",
          requiredPerm: "appointment:view:linked"
        },
        { 
          name: "Patient Appointments", 
          icon: <Calendar className="w-4 h-4" />, 
          path: "patient-appointments",
          requiredPerm: "appointment:view:own"
        },
        { 
          name: "PatientDash", 
          icon: <BarChart2 className="w-4 h-4" />, 
          path: "search",
          requiredPerm: "appointment:view:own"
        },
        { 
          name: "Finance", 
          icon: <DollarSign className="w-4 h-4" />, 
          path: "finance",
          requiredPerm: "appointment:view:linked"
        },
        { name: "Doctor Chat", icon: <MessageSquare className="w-4 h-4" />, path: "doctor-chat", requiredPerm: "appointment:view:linked" },
        { name: "Chat with Doctor", icon: <MessageSquare className="w-4 h-4" />, path: "patient-chat", requiredPerm: "appointment:create:own" },
      ],
    },
    {
      category: "STAFF",
      items: [
        { 
          name: "Roles", 
          icon: <UserCheck className="w-4 h-4" />, 
          path: "staff",
          requiredPerm: "role:view:own"
        }
      ],
    },
    {
      category: "FEEDBACK",
      items: [
        { 
          name: "Feedback", 
          icon: <MessageSquare className="w-4 h-4" />, 
          path: "feedback",
          requiredPerm: "feedback:view:own"
        },
        { 
          name: "View Feedback", 
          icon: <FileText className="w-4 h-4" />, 
          path: "feedback/doctor",
          requiredPerm: "feedback:view:own"
        },
      ],
    },
    {
      category: "ADMIN",
      items: [
        { 
          name: "Role Management", 
          icon: <UserCheck className="w-4 h-4" />, 
          path: "roles",
          requiredPerm: "role:view"
        },
      ],
    },
  ];


  const bottomItems = [
    { 
      name: "Settings", 
      icon: <Settings className="w-4 h-4" />, 
      path: "settings",
      requiredPerm: "settings:manage"
    },
    { 
      name: "Customer Support", 
      icon: <HelpCircle className="w-4 h-4" />, 
      path: "support" 
      // No permission required for support
    },
  ];

  // Helper function to check permissions
  const hasPermission = (requiredPerm) => {
    if (!requiredPerm) return true;
    
    // Check if any permission matches the required permission
    return permissions.some(perm => {
      // Check if permission object has entity, action, and scope properties
      if (perm.entity && perm.action) {
        const permString = perm.scope && perm.scope !== 'all' 
          ? `${perm.entity}:${perm.action}:${perm.scope}`
          : `${perm.entity}:${perm.action}`;
        
        return requiredPerm === permString || 
               // Also match if the item requires a specific scope but user has 'all' scope
               requiredPerm.startsWith(`${perm.entity}:${perm.action}:`) && perm.scope === 'all';
      }
      
      // If permissions are already in string format
      return perm === requiredPerm;
    });
  };

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.map(category => {
    const filteredItems = category.items.filter(item => 
      !item.requiredPerm || hasPermission(item.requiredPerm)
    );
    
    return {
      ...category,
      items: filteredItems
    };
  }).filter(category => category.items.length > 0);

  // Filter bottom items based on user permissions
  const filteredBottomItems = bottomItems.filter(item => 
    !item.requiredPerm || hasPermission(item.requiredPerm)
  );

  return (
    <aside className="w-1/6 bg-white border-r border-gray-200 flex-shrink-0 h-screen overflow-y-auto flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center px-4 py-3 h-[50px] border-b border-gray-200">
        <div className="w-5 h-5 bg-[#2563eb] rounded flex items-center justify-center mr-2">
          <span className="text-white font-bold text-xs">+</span>
        </div>
        <span className="font-bold text-[#2563eb] text-base">HealthFlow</span>
      </Link>

      {/* User Profile and Role Switcher */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#ffedd5] rounded-full flex items-center justify-center mr-2">
            <span className="text-[#9a3412] font-medium text-sm">
              {currentUser?.name?.split(" ").map(n => n[0]).join("") || "U"}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{currentUser?.name || "User"}</span>
              <div className="relative role-switcher">
                <button
                  type="button"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span>{activeRole?.name || "No role"}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showRoleMenu && userRoles.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                    {userRoles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSwitch(role.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          role.id === activeRole?.id
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredMenuItems.map((category) => (
          <div key={category.category} className="mb-2">
            <div className="px-4 py-1.5">
              <span className="text-sm text-gray-500 font-medium">{category.category}</span>
            </div>
            {category.items.map((item) => (
              <Link
                key={item.name}
                to={`${item.path}`}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  isActive(item.path)
                    ? "bg-[#eef6ff] text-[#2563eb] font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Items */}
      <div className="border-t border-gray-200">
        {filteredBottomItems.map((item) => (
          <Link
            key={item.name}
            to={`/${item.path}`}
            className={`flex items-center w-full px-4 py-2.5 text-sm ${
              isActive(item.path)
                ? "bg-[#eef6ff] text-[#2563eb] font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}

        <div className="flex justify-start pb-4 px-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="px-4 py-2.5"
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}