import Card from "../components/ui/card";
import React from "react";
import { useAuthContext } from "../context/AuthContext";


export default function Dashboard() {
  const { currentUser, activeRole, permissions } = useAuthContext();

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
    </div>
  );
}



