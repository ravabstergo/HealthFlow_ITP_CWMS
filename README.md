# HealthFlow - Clinical Workflow Management System

HealthFlow is a comprehensive, full-stack Clinical Workflow Management System (CWMS) designed to streamline healthcare operations. It connects doctors, patients, and administrative staff through a unified platform, facilitating appointment scheduling, telemedicine, electronic health records (EHR) management, and financial reporting.

## Key Features

### For Doctors
- **Dashboard:** Real-time overview of appointments, patient statistics, and income.
- **Appointment Management:** Manage schedules, view upcoming appointments, and set availability slots.
- **Telemedicine:** Integrated video consultations using Agora and real-time chat.
- **Patient Records (EHR):** Create and manage digital patient records, encounters, and prescriptions.
- **AI-Powered Insights:** AI-generated reports on patient feedback and treatment outcomes.
- **Financial Reports:** Track earnings and generate monthly financial statements.

### For Patients
- **Easy Booking:** Search for doctors and book appointments online.
- **Medical History:** Access personal medical records, prescriptions, and documents.
- **Telehealth:** Join video consultations and chat with doctors securely.
- **Feedback:** Rate visits and provide feedback on care quality.

### For Administrators
- **User Management:** Manage doctors, patients, and staff roles.
- **Role-Based Access Control (RBAC):** Granular permission settings for different staff roles.
- **Activity Monitoring:** Track system usage and user activities.

## Tech Stack

### Frontend
- **Framework:** React.js (v19)
- **State Management:** Zustand
- **Styling:** Tailwind CSS, Framer Motion
- **Routing:** React Router DOM
- **Charts:** Recharts, Chart.js
- **Real-time:** Socket.io-client
- **Video/Audio:** Agora RTC React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Caching:** Redis
- **Real-time:** Socket.io
- **Authentication:** JWT, Bcrypt.js
- **File Storage:** Cloudinary
- **Email Service:** Nodemailer
- **AI Integration:** Google Generative AI
- **Payment Gateway:** PayHere Integration

## Folder Structure

```
HealthFlow_ITP_CWMS/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service calls
│   │   ├── store/          # Zustand store
│   │   └── utils/          # Utility functions
│   └── ...
├── server/                 # Express Backend
│   ├── config/             # Database and external service config
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth and upload middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   └── ...
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- Redis Server
- Cloudinary Account
- Agora Account (for video calls)
- Google Gemini API Key (for AI features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ravabstergo/HealthFlow_ITP_CWMS.git
    cd HealthFlow_ITP_CWMS
    ```

2.  **Install Dependencies**
    ```bash
    # Install root dependencies (concurrently)
    npm install

    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Email (Nodemailer)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password

    # Agora (Video Call)
    AGORA_APP_ID=your_agora_app_id
    AGORA_APP_CERTIFICATE=your_agora_certificate

    # AI
    GEMINI_API_KEY=your_gemini_api_key

    # Payment (PayHere)
    PAYHERE_MERCHANT_ID=your_merchant_id
    PAYHERE_MERCHANT_SECRET=your_merchant_secret
    ```

4.  **Run the Application**
    From the root directory, run both client and server concurrently:
    ```bash
    npm run dev
    ```
    - Frontend will run on `http://localhost:3000`
    - Backend will run on `http://localhost:5000`

## Screenshots




