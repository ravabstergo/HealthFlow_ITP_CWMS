import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLinkedRecordContext } from '../context/LinkedRecordContext';
import api from '../services/api';

const PastAppointments = () => {
  const { linkedRecordIds, loading: linkLoading, error: linkError } = useLinkedRecordContext();
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEncountersForRecord = async (recordId) => {
      try {
        const response = await api.get(`${process.env.REACT_APP_API_URL}/encounters/by-record/${recordId}`);
        return response.data;
      } catch (err) {
        console.error(`Error fetching encounters for record ${recordId}:`, err);
        return [];
      }
    };

    const fetchAllEncounters = async () => {
      if (!linkedRecordIds || linkedRecordIds.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch encounters for all linked records in parallel
        const allEncounters = await Promise.all(
          linkedRecordIds.map(recordId => fetchEncountersForRecord(recordId))
        );

        // Combine and sort all encounters by date, newest first
        const combinedEncounters = allEncounters
          .flat()
          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        setEncounters(combinedEncounters);
      } catch (err) {
        setError(err.message || 'Failed to fetch encounters');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEncounters();
  }, [linkedRecordIds]);

  if (linkLoading || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (linkError || error) {
    return <div className="p-4 text-red-600">Error: {linkError || error}</div>;
  }

  if (!linkedRecordIds || linkedRecordIds.length === 0) {
    return <div className="p-4">No linked patient records found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Past Appointments</h1>
      <div className="space-y-4">
        {encounters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-gray-500">
            No past appointments found.
          </div>
        ) : (
          encounters.map((encounter) => (
            <div key={encounter._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{encounter.reasonForEncounter}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(encounter.dateTime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="px-2 py-1 text-sm rounded-full bg-gray-100">
                  Dr. {encounter.provider?.name || 'Unknown'}
                </span>
              </div>
              {encounter.diagnosis && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Diagnosis:</span> {encounter.diagnosis}
                </p>
              )}
              <button
                className="mt-4 w bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={() => navigate('/account/feedback/create', { state: { encounterId: encounter._id } })}
              >
                Give Feedback
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PastAppointments;