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
} from "lucide-react"

export default function Sidebar({ selectedItem, onSelectItem }) {

  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const menuItems = [
    {
      category: "CLINICAL",
      items: [
        { name: "Patients", icon: <Users className="w-4 h-4" />, path: "patients" },
        { name: "Prescriptions", icon: <FileText className="w-4 h-4" />, path: "prescription" },
        { name: "Patient Documents", icon: <File className="w-4 h-4" />, path: "patient-documents" },
        { name: "Documents", icon: <File className="w-4 h-4" />, path: "documents" },
      ],
    },
    {
      category: "TELEMEDICINE",
      items: [
        { name: "Appointments", icon: <Calendar className="w-4 h-4" />, path: "schedule" },
        { name: "Patient Appointments", icon: <Calendar className="w-4 h-4" />, path: "patient-appointments" },
        { name: "PatientDash", icon: <BarChart2 className="w-4 h-4" />, path: "search" },
        { name: "Finance", icon: <DollarSign className="w-4 h-4" />, path: "finance" },
      ],
    },
    {
      category: "STAFF",
      items: [{ name: "Roles", icon: <UserCheck className="w-4 h-4" />, path: "roles" }],
    },
    {
      category: "FEEDBACK",
      items: [
        { name: "Feedback", icon: <MessageSquare className="w-4 h-4" />, path: "feedback" },
        { name: "View Feedback", icon: <FileText className="w-4 h-4" />, path: "feedback/doctor" },
      ],
    }
  ]

  const bottomItems = [
    { name: "Settings", icon: <Settings className="w-4 h-4" />, path: "settings" },
    { name: "Customer Support", icon: <HelpCircle className="w-4 h-4" />, path: "support" },
  ]

  return (
    <aside className="w-1/6 bg-white border-r border-gray-200 flex-shrink-0 h-screen overflow-y-auto flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center px-4 py-3 h-[50px] border-b border-gray-200">
        <div className="w-5 h-5 bg-[#2563eb] rounded flex items-center justify-center mr-2">
          <span className="text-white font-bold text-xs">+</span>
        </div>
        <span className="font-bold text-[#2563eb] text-sm">HealthFlow</span>
      </Link>

      {/* User Profile */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-[#ffedd5] rounded-full flex items-center justify-center mr-2">
            <span className="text-[#9a3412] font-medium text-xs">DS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">Darrell Steward</span>
            <span className="text-[10px] text-gray-500">Super admin</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((category) => (
          <div key={category.category} className="mb-2">
            <div className="px-4 py-1.5">
              <span className="text-[10px] text-gray-500 font-medium">{category.category}</span>
            </div>
            {category.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center w-full px-4 py-2 text-xs ${
                  isActive(item.path)
                    ? "bg-[#eef6ff] text-[#2563eb] font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onSelectItem(item.name)}
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
        {bottomItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center w-full px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-100"
            onClick={() => onSelectItem(item.name)}
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
  )
}