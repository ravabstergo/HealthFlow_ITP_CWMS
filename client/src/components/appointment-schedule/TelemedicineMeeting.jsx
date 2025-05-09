import { useState, useEffect } from "react"
import { ArrowLeft, Mic, Video, FileText, UserIcon, AlertCircle, Download, Eye } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
  useClientEvent,
  useRTCClient
} from "agora-rtc-react"
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react"
import { getAppointmentWithPatientData } from "../../services/patientService"
import DocumentService from "../../services/DocumentService"
import { useAuthContext } from "../../context/AuthContext"

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;

const PatientProfileSection = ({ patientData }) => {
  if (!patientData) return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
      <p className="text-gray-400 text-center">Patient medical data not available</p>
    </div>
  );

  return (
    <div className="mt-4 overflow-y-auto">
      {/* Medical Allergies */}
      {patientData.allergies && patientData.allergies.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-red-600 mb-1">Allergies</h3>
          <div className="space-y-1">
            {patientData.allergies.map((allergy, index) => (
              <div key={index} className="py-1 px-2 bg-red-50 rounded-md">
                <p className="text-sm font-medium">{allergy.allergenName}</p>
                <p className="text-xs text-gray-500">{allergy.manifestation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Conditions */}
      {patientData.pastMedicalHistory && patientData.pastMedicalHistory.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Medical History</h3>
          <div className="space-y-1">
            {patientData.pastMedicalHistory.map((condition, index) => (
              <div key={index} className="py-1 px-2 bg-blue-50 rounded-md flex justify-between">
                <div>
                  <p className="text-sm font-medium">{condition.condition}</p>
                  <p className="text-xs text-gray-500">Since: {condition.onset}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  condition.clinicalStatus === 'Active' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {condition.clinicalStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Medications */}
      {patientData.regularMedications && patientData.regularMedications.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-green-600 mb-1">Current Medications</h3>
          <div className="space-y-1">
            {patientData.regularMedications.map((medication, index) => (
              <div key={index} className="py-1 px-2 bg-green-50 rounded-md">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{medication.medicationName}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    medication.status === 'Ongoing' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {medication.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{medication.dosage} ({medication.form}) - {medication.route}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Surgeries */}
      {patientData.pastSurgicalHistory && patientData.pastSurgicalHistory.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Surgical History</h3>
          <div className="space-y-1">
            {patientData.pastSurgicalHistory.map((surgery, index) => (
              <div key={index} className="py-1 px-2 bg-purple-50 rounded-md">
                <p className="text-sm font-medium">{surgery.procedureName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(surgery.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immunizations */}
      {patientData.immunizations && patientData.immunizations.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-teal-600 mb-1">Immunizations</h3>
          <div className="space-y-1">
            {patientData.immunizations.map((vaccine, index) => (
              <div key={index} className="py-1 px-2 bg-teal-50 rounded-md">
                <p className="text-sm font-medium">{vaccine.vaccineName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(vaccine.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {patientData.behavioralRiskFactors && patientData.behavioralRiskFactors.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-orange-600 mb-1">Risk Factors</h3>
          <div className="space-y-1">
            {patientData.behavioralRiskFactors.map((risk, index) => (
              <div key={index} className="py-1 px-2 bg-orange-50 rounded-md">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{risk.riskFactorName}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    risk.status === 'Active' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {risk.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{risk.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Risk Assessment */}
      {patientData.healthRiskAssessment && patientData.healthRiskAssessment.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-amber-600 mb-1">Risk Assessment</h3>
          <div className="space-y-1">
            {patientData.healthRiskAssessment.map((assessment, index) => (
              <div key={index} className="py-1 px-2 bg-amber-50 rounded-md">
                <p className="text-sm font-medium">{assessment.assessmentType}</p>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                  </p>
                  <span className="text-xs font-medium">{assessment.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Basics = ({ appointmentId, patientName, appointmentDate, patientProfile, documents }) => {
  const navigate = useNavigate();
  const { currentUser, activeRole } = useAuthContext();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [calling, setCalling] = useState(false);
  const [hasJoinedMeeting, setHasJoinedMeeting] = useState(false);

  // Get tracks for local user only when joined meeting
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(hasJoinedMeeting && micOn);
  const { localCameraTrack } = useLocalCameraTrack(hasJoinedMeeting && cameraOn);
  
  // Get reference to the RTC client
  const client = useRTCClient();
  
  // Join the channel only when user clicks join
  useJoin(
    {
      appid: APP_ID,
      channel: `appointment-${appointmentId}`,
      token: null // In production, you should get this from your token server
    },
    calling
  );

  // Publish tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Get remote users
  const remoteUsers = useRemoteUsers();

  const handleJoinMeeting = () => {
    setHasJoinedMeeting(true);
    setCalling(true);
  };

  const handleEndMeeting = async () => {
    try {
      setCalling(false);
      setHasJoinedMeeting(false);
      navigate('/account/schedule');
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (localMicrophoneTrack) {
        localMicrophoneTrack.close();
      }
      if (localCameraTrack) {
        localCameraTrack.close();
      }
      setCalling(false);
      setHasJoinedMeeting(false);
    };
  }, [localMicrophoneTrack, localCameraTrack]);

  return (
    <div className="w-full mx-auto p-0 h-full">
      {/* Header */}
      <div className="border-b border-gray-200 mb-4 bg-white">
        <div className="p-4 pb-0">
          <h1 className="text-blue-600 font-medium text-sm">Telemedicine Meeting</h1>
        </div>
        <div className="h-0.5 w-44 bg-blue-600 mt-2"></div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] min-w-[1200px] max-w-[1550px] mx-auto p-0 h-full p-2">
        {/* Left section - Meeting area and Documents */}
        <div className="flex-1 flex flex-col min-w-[300px]">
          {/* Meeting area */}
          <div className="bg-white rounded-3xl p-4 shadow-sm mb-2 flex-1 flex-grow-[3]">
            {/* Patient info */}
            <div className="flex items-center mb-4">
              <button className="mr-4" onClick={() => navigate('/account/schedule')}>
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h2 className="font-medium text-gray-800">{patientName}</h2>
                <p className="text-sm text-gray-500">{appointmentDate}</p>
              </div>
            </div>

            {!hasJoinedMeeting ? (
              <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-2xl">
                <button 
                  onClick={handleJoinMeeting}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Join Meeting Now
                </button>
                <p className="mt-3 text-sm text-gray-500">Click to join the video consultation</p>
              </div>
            ) : (
              <>
                {/* Video screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 justify-center">
                  {/* Local user video */}
                  <div className="w-full h-[300px] rounded-2xl overflow-hidden bg-gray-100 relative">
                    {cameraOn ? (
                      <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        videoTrack={localCameraTrack}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-10 w-10 text-gray-500" />
                          </div>
                          <p className="mt-3 text-gray-600">Camera Off</p>
                        </div>
                        
                        {/* Audio still works when camera is off */}
                        <div className="hidden">
                          <LocalUser
                            audioTrack={localMicrophoneTrack}
                            cameraOn={false}
                            micOn={micOn}
                            videoTrack={null}
                          />
                        </div>
                      </div>
                    )}
                    {!micOn && (
                      <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                        Muted
                      </div>
                    )}
                  </div>

                  {/* Remote user video */}
                  {remoteUsers.map((user) => (
                    <div key={user.uid} className="w-full h-[300px] rounded-2xl overflow-hidden bg-gray-100 relative">
                      <RemoteUser user={user} className="w-full h-full object-cover rounded-2xl">
                        <span className="hidden">{user.uid}</span>
                      </RemoteUser>
                      {!user.hasAudio && (
                        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                          Muted
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Meeting controls */}
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setMicOn(!micOn)}
                    className={`p-2 rounded-full ${micOn ? "text-gray-700" : "bg-gray-200 text-gray-500"}`}
                  >
                    <Mic className="h-5 w-5" />
                  </button>

                  <button 
                    onClick={handleEndMeeting}
                    className="bg-red-400 text-white px-6 py-2 rounded-full font-medium"
                  >
                    End Meeting
                  </button>

                  <button
                    onClick={() => setCameraOn(!cameraOn)}
                    className={`p-2 rounded-full ${cameraOn ? "text-gray-700" : "bg-gray-200 text-gray-500"}`}
                  >
                    <Video className="h-5 w-5" />
                  </button>
                </div>

                {/* Meeting ID box */}
                <div className="mt-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-500 text-center">Meeting ID: appointment-{appointmentId}</p>
                </div>
              </>
            )}
          </div>

          {/* Documents section - reduced height */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 flex-1 flex-grow-[1] min-h-[120px] overflow-y-auto">
            <div className="mb-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Documents</span>
            </div>
            {documents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <FileText className="h-12 w-12 opacity-20" />
                <p className="text-gray-400 ml-2">No documents available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{doc.documentName}</p>
                        <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={async () => {
                          try {
                            const downloadInfo = await DocumentService.downloadDocument(doc._id);
                            const link = document.createElement('a');
                            link.href = downloadInfo.url;
                            link.setAttribute('download', downloadInfo.filename);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } catch (error) {
                            console.error('Download failed:', error);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => {
                          const extension = doc.documentUrl?.split('.').pop().toLowerCase();
                          if (extension === 'pdf') {
                            window.open(doc.documentUrl, '_blank');
                          } else if (['doc', 'docx'].includes(extension)) {
                            const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.documentUrl)}`;
                            window.open(viewerUrl, '_blank');
                          } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
                            window.open(doc.documentUrl, '_blank');
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="View"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right section - Patient info - increased width */}
        <div className="md:ml-2 mt-2 md:mt-0 w-full md:w-[420px] min-w-[340px] bg-white border border-gray-200 rounded-3xl p-4 overflow-y-auto">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center overflow-hidden">
              {patientProfile?.name?.firstName && (
                <span className="text-gray-700 font-medium">
                  {patientProfile?.name?.firstName[0]}{patientProfile?.name?.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient Name</p>
              <p className="font-medium">
                {patientProfile?.name 
                  ? `${patientProfile.name.firstName} ${patientProfile.name.lastName}` 
                  : patientName}
              </p>
            </div>
          </div>

          {/* Patient demographics */}
          {patientProfile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="font-medium">{patientProfile.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium">{patientProfile.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIC</p>
                  <p className="font-medium">{patientProfile.nic}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="font-medium">{patientProfile.phone}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Medical history section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-medium text-gray-800 mb-3">Medical Profile</h3>
            <PatientProfileSection patientData={patientProfile} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TelemedicineMeeting() {
  const { appointmentId } = useParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const { currentUser } = useAuthContext();

  // Create Agora client
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // Fetch appointment and patient data only once when component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAppointmentWithPatientData(appointmentId);
        if (!isMounted) return;

        // Update the data handling to match the API response structure
        setAppointmentData(data.appointment);
        setPatientProfile(data.patientData);

        // Only fetch documents if we have patient data
        if (data.patientData?._id) {
          try {
            const docs = await DocumentService.getDocumentsByPatientId(data.patientData._id);
            if (!isMounted) return;
            setDocuments(docs);
          } catch (docError) {
            console.error('Error fetching documents:', docError);
            // Don't set error state here, as documents are not critical
            setDocuments([]);
          }
        }

        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching appointment data:', err);
        setError(err.message || 'Failed to load appointment data');
        setLoading(false);
      }
    };

    if (appointmentId && currentUser?.id) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [appointmentId, currentUser?.id]); // Only re-run if appointmentId or currentUser.id changes

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-500">
      <p>{error}</p>
    </div>
  );

  return (
    <AgoraRTCProvider client={client}>
      <Basics 
        appointmentId={appointmentId}
        patientName={`${patientProfile?.name?.firstName || ''} ${patientProfile?.name?.lastName || ''}`}
        appointmentDate={appointmentData?.time ? new Date(appointmentData.time).toLocaleDateString() : ''}
        patientProfile={patientProfile}
        documents={documents}
      />
    </AgoraRTCProvider>
  );
}