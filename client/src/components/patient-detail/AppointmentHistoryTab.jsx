import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Search, Plus, Filter } from "lucide-react"
import Button from "../../components/ui/button"
import Input from "../../components/ui/input"
import Badge from "../../components/ui/badge"
import Avatar from "../../components/ui/avatar"
import { useHoverPanel } from "../../context/HoverPanelContext"
import { useEncounterContext } from "../../context/EncounterContext"
import CreateEncounterForm from "../../components/record/CreateEncounterForm"
import HoverPanel from "../../components/ui/hover-panel"

export default function EncountersByRecordPage() {
  const { id: recordId } = useParams();
  const { encounters, loading, error, getEncountersByRecordId, deleteEncounter } = useEncounterContext();
  const navigate = useNavigate();
  const { openPanel } = useHoverPanel();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (recordId) {
      getEncountersByRecordId(recordId);
    }
  }, [getEncountersByRecordId, recordId]);

  const handleAddEncounter = () => {
    openPanel("[EncountersByRecordPage]Add New Encounter", <CreateEncounterForm onSuccess={handleEncounterAdded} />);
  }

  const handleEncounterClick = (encounter) => {
    // Open the hover panel with the encounter details for editing
    openPanel("[EncountersByRecordPage]Edit Encounter", <CreateEncounterForm encounter={encounter} onSuccess={handleEncounterAdded} />);
  };

  const handleEncounterAdded = () => {
    console.log("[EncountersByRecordPage]Encounter added or updated successfully");
    // No need to refresh - the context state is already updated
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent card click when clicking delete button
    try {
      await deleteEncounter(id);
      // No need to refresh - the context state is already updated
    } catch (error) {
      console.error("Error deleting encounter:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Scheduled":
        return <Badge variant="primary">Scheduled</Badge>
      case "Completed":
        return <Badge variant="success">Completed</Badge>
      case "Pending":
        return <Badge variant="default">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading encounter records...</div>
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
  }

  // Filter encounters based on search term if provided
  const filteredEncounters = searchTerm
    ? encounters.filter(encounter => 
        encounter.reasonForEncounter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        encounter.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()))
    : encounters;

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Encounters</h1>

          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-4">
              <div className="h-full flex items-center [&>*]:mb-0">
                <Input
                  placeholder="Search encounters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-full w-96"
                />
              </div>
              <Button variant="secondary" icon={<Filter className="w-4 h-4" />} className="h-full">
                Filter
              </Button>
            </div>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddEncounter} className="h-full">
              New Encounter
            </Button>
          </div>
        </div>
        {filteredEncounters.length === 0 ? (
          <div className="text-center py-6 bg-gray-100 rounded">No encounters found.</div>
        ) : (
          <div className="flex flex-col gap-6 items-center">
            {filteredEncounters.map((encounter) => (
              <div
                key={encounter._id}
                className="w-full max-w-3xl border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleEncounterClick(encounter)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{encounter.reasonForEncounter}</h3>
                  <div>{getStatusBadge(encounter.status)}</div>
                </div>
                <p className="text-gray-500 text-sm">{new Date(encounter.dateTime).toLocaleString()}</p>
                <p className="text-gray-500">{encounter.diagnosis}</p>
                <div className="mt-4 text-right">
                  <Button
                    variant="link"
                    className="text-red-500"
                    onClick={(e) => handleDelete(encounter._id, e)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Make sure the HoverPanel is always rendered */}
      <HoverPanel />
    </>
  );
}