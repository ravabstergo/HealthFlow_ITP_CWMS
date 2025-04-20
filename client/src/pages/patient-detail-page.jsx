import { Mail, MoreVertical, Edit } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { label: "Patient Information", path: "information" },
  { label: "Appointment History", path: "appointments" },
  { label: "Next Treatment", path: "treatment" },
  { label: "Medical Record", path: "record" },
  { label: "Documents", path: "documents" }
];

export default function PatientDetail() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Patient Info Static section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img
                src="/placeholder.svg?height=48&width=48"
                alt="Willie Jennie"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Willie Jennie</h2>
              <div className="flex items-center text-gray-500 text-sm">
                <Mail className="w-4 h-4 mr-1" />
                <span>Have.unicorn@jennie</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Encounter
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(({ label, path }) => (
            <NavLink
              key={path}
              to={`${path}`}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Dynamic tab content */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
