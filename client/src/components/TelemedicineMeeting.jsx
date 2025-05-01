import { useState } from "react"
import { ArrowLeft, Mic, Video, FileText } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react"
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react"

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;

const Basics = ({ appointmentId, patientName, appointmentDate }) => {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [calling, setCalling] = useState(true);

  // Get tracks for local user
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  
  // Join the channel
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

  const handleEndMeeting = () => {
    setCalling(false);
    navigate('/account/schedule');
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-blue-600 font-medium text-lg">Telemedicine Meeting</h1>
        <div className="h-0.5 w-44 bg-blue-600"></div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left section - Meeting area and Documents */}
        <div className="flex-1 max-w-4xl">
          {/* Meeting area */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
            {/* Patient info */}
            <div className="flex items-center mb-6">
              <button className="mr-4" onClick={() => navigate('/account/schedule')}>
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h2 className="font-medium text-gray-800">{patientName}</h2>
                <p className="text-sm text-gray-500">{appointmentDate}</p>
              </div>
            </div>

            {/* Video screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 justify-center">
              {/* Local user video */}
              <div className="w-[400px] h-[300px] rounded-lg overflow-hidden bg-gray-100">
                <LocalUser
                  audioTrack={localMicrophoneTrack}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  videoTrack={localCameraTrack}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remote user video */}
              {remoteUsers.map((user) => (
                <div key={user.uid} className="w-[400px] h-[300px] rounded-lg overflow-hidden bg-gray-100">
                  <RemoteUser user={user} className="w-full h-full object-cover">
                    <span className="hidden">{user.uid}</span>
                  </RemoteUser>
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

            {/* White rounded box below buttons */}
            <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 text-center">Meeting ID: appointment-{appointmentId}</p>
            </div>
          </div>

          {/* Documents section */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6">
            <div className="mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Documents</span>
            </div>
            <div className="h-40 flex items-center justify-center text-gray-400">
              <FileText className="h-12 w-12 opacity-20" />
            </div>
          </div>
        </div>

        {/* Right section - Patient info */}
        <div className="mt-4 md:mt-0 md:w-80 bg-white border border-gray-200 rounded-3xl p-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full mr-3"></div>
            <div>
              <p className="text-sm text-gray-500">Patient Name</p>
              <p className="font-medium">{patientName}</p>
            </div>
          </div>
          <div className="h-96"></div>
        </div>
      </div>
    </div>
  )
}

export default function TelemedicineMeeting() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);

  // Create Agora client
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <Basics 
        appointmentId={appointmentId}
        patientName={appointment?.firstName ? `${appointment.firstName} ${appointment.lastName}` : 'Patient'}
        appointmentDate={appointment?.time ? new Date(appointment.time).toLocaleDateString() : ''}
      />
    </AgoraRTCProvider>
  );
}