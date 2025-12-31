# Student Academic Portal (Modern V2)

A modern full-stack web application built with **Next.js 14+**, **Tailwind CSS**, and **Firebase**.
Refactored from a legacy static site to a dynamic serverless architecture.

## 🚀 Technology Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Framer Motion
-   **Icons**: Lucide React
-   **Backend**: Next.js Server Actions
-   **Database**: Google Cloud Firestore
-   **Auth**: Firebase Authentication (with Custom Claims for RBAC)
-   **Email**: Nodemailer

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory with your Firebase and SMTP credentials:

```bash
# Firebase Client SDK (Get these from Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Get these from Service Accounts tab)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# SMTP Configuration (For email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM="Student Portal <no-reply@studentportal.com>"
# Optional: Admin Email to receive application notifications
ADMIN_EMAIL=admin@example.com
```

### 2. Installation Add Dependencies

```bash
npm install
```

### 3. Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 📂 Project Structure

-   `src/app`: App Router pages and layouts.
    -   `(auth)`: Login/Signup pages.
    -   `admin`: Admin Dashboard and management pages.
    -   `message`: Forum pages.
    -   `apply-mentor`: Multi-step application form.
-   `src/components`: Reusable UI components.
    -   `ui`: Basic elements (Navbar, Footer, etc).
    -   `auth`: RoleGuard and Auth logic.
-   `src/lib`: Configuration (Firebase, Mail).
-   `src/actions`: Server Actions (Backend logic).

## 🔐 Roles & Permissions

-   **User**: Default role. Can view admissions, scholarships, and post in forum.
-   **Mentor**: Can reply in forum (highlighted role). Approved via application.
-   **Admin**: Full access. Can manage admissions, scholarships, and approve mentors.

## 📝 Key Features

1.  **Admissions & Scholarships**: Searchable grid views with Admin CRUD.
2.  **Real-time Forum**: Live updates using Firestore `onSnapshot`.
3.  **Mentor Workflow**: Application form -> Email Notification -> Admin Approval -> Role Update -> Welcome Email.
