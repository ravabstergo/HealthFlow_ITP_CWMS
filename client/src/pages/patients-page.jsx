import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter } from "lucide-react";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Badge from "../components/ui/badge";
import Avatar from "../components/ui/avatar";

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Sample patient data
  const patients = [
    {
      id: 1,
      name: "Willie Jennie",
      email: "have.unicorn@jennie",
      status: "Active",
      lastVisit: "Mar 15, 2023",
    },
    {
      id: 2,
      name: "Jane Cooper",
      email: "jane.cooper@example.com",
      status: "Scheduled",
      lastVisit: "Apr 2, 2023",
    },
    {
      id: 3,
      name: "Robert Fox",
      email: "robert.fox@example.com",
      status: "Inactive",
      lastVisit: "Jan 10, 2023",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "emily.wilson@example.com",
      status: "Active",
      lastVisit: "Mar 28, 2023",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      status: "Active",
      lastVisit: "Apr 5, 2023",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Scheduled":
        return <Badge variant="primary">Scheduled</Badge>;
      case "Inactive":
        return <Badge variant="default">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button icon={<Plus className="w-4 h-4" />}>Add Patient</Button>
      </div>

      <div className="flex space-x-4 mb-6">
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="max-w-md"
        />
        <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
          Filter
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/account/patients/${patient.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        initials={patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        size="sm"
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(patient.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/account/patients/${patient.id}`);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
