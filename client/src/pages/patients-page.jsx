import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Filter, ChevronDown } from "lucide-react"
import Button from "../components/ui/button"
import Input from "../components/ui/input"
import Badge from "../components/ui/badge"
import Avatar from "../components/ui/avatar"
import { useHoverPanel } from "../context/HoverPanelContext"
import { useRecordContext } from "../context/RecordContext"
import CreatePatientForm from "../components/record/CreatePatientForm"
import HoverPanel from "../components/ui/hover-panel"

export default function PatientsPage() {
  const { records, loading, error, getRecordsByDoctor, deleteRecord } = useRecordContext();
  const navigate = useNavigate();
  const { openPanel } = useHoverPanel()
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getRecordsByDoctor();
  }, [getRecordsByDoctor])

  const handleAddPatient = () => {
    openPanel("[PatientsPage]Add New Patient", <CreatePatientForm onSuccess={handlePatientAdded} />)
  }

  const handleRowClick = (id) => {
    navigate(`${id}`);
  };

  const handlePatientAdded = () => {
    console.log("[PatientsPage]Patient added successfully")
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click when clicking delete button
    try {
      await deleteRecord(id);
      getRecordsByDoctor(); // Refresh the records after deletion
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>
      case "Scheduled":
        return <Badge variant="primary">Scheduled</Badge>
      case "Inactive":
        return <Badge variant="default">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading patient records...</div>
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Patients</h1>

          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-4">
            <div className="h-full flex items-center [&>*]:mb-0">
      <Input
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<Search className="w-4 h-4 text-gray-400" />}
        className="h-full w-96"
      />
    </div>
              <Button variant="secondary" icon={<Filter className="w-4 h-4" />} className="h-full">
                Filter
              </Button>
            </div>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddPatient} className="h-full">
              New Patient
            </Button>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-6 bg-gray-100 rounded">No patient records found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>NAME</span>
                      <ChevronDown size={16} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>CONTACT</span>
                      <ChevronDown size={16} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>DOB</span>
                      <ChevronDown size={16} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>GENDER</span>
                      <ChevronDown size={16} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(patient._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          initials={patient.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                          size="sm"
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{patient.fullName}</div>
                          <div className="text-sm text-gray-500">{patient.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dateOfBirth}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="link"
                        onClick={(e) =>
                          handleDelete(patient._id, e)}>
                          Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HoverPanel />
    </>
  )
}

