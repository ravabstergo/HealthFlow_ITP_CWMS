import Card from "../components/ui/card";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { currentUser, activeRole, permissions } = useAuthContext();
  const [ageGenderData, setAgeGenderData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgeGenderData = async () => {
      try {
        // Retrieve token from localStorage using the correct key
        const authToken = localStorage.getItem('accessToken');

        // Debug: Log token presence
        console.log('Access token:', authToken ? 'Found' : 'Not found');

        if (!authToken) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch('/api/patients/age-gender-distribution', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.male && data.female) {
          setAgeGenderData(data);
        } else {
          setAgeGenderData({ male: { '0-18': 0, '19-30': 0, '31-50': 0, '51+': 0 }, female: { '0-18': 0, '19-30': 0, '31-50': 0, '51+': 0 } });
        }
      } catch (error) {
        console.error('Error fetching age and gender data:', error);
        setError(error.message);
        setAgeGenderData({ male: { '0-18': 0, '19-30': 0, '31-50': 0, '51+': 0 }, female: { '0-18': 0, '19-30': 0, '31-50': 0, '51+': 0 } });
      }
    };

    // Only fetch data if user is authenticated
    if (currentUser) {
      fetchAgeGenderData();
    } else {
      setError('Please log in to view patient demographics.');
    }
  }, [currentUser]);

  const chartData = ageGenderData ? {
    labels: ['0-18', '19-30', '31-50', '51+'],
    datasets: [
      {
        label: 'Male',
        data: [
          ageGenderData.male['0-18'],
          ageGenderData.male['19-30'],
          ageGenderData.male['31-50'],
          ageGenderData.male['51+'],
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Female',
        data: [
          ageGenderData.female['0-18'],
          ageGenderData.female['19-30'],
          ageGenderData.female['31-50'],
          ageGenderData.female['51+'],
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  } : {
    labels: ['0-18', '19-30', '31-50', '51+'],
    datasets: [
      {
        label: 'Male',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Female',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patient Age and Gender Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Patients',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Age Group',
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <Card>
        <h2>Welcome, {currentUser?.name || "User"}!</h2>
        <p>
          <strong>Active Role:</strong> {activeRole?.name}
        </p>
        <p>
          <strong>UserId:</strong> {currentUser?.id}
        </p>
        <h4>Permissions:</h4>
        <ul>
          {permissions.map((perm, index) => (
            <li key={index}>
              {perm.entity} - {perm.action} ({perm.scope})
            </li>
          ))}
        </ul>
      </Card>
      <Card className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Patient Demographics</h3>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </Card>
    </div>
  );
}