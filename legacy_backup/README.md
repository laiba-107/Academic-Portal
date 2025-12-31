# Student Academic Portal System

This repository contains a full‑stack **Student Academic Portal** built with Firebase (Authentication, Firestore, Storage, Cloud Functions), vanilla HTML/CSS/JavaScript, and Bootstrap.  The portal allows students to learn about admissions and scholarships, participate in a discussion forum, and connect with mentors.  Administrators have the ability to approve mentor applications, manage content, and view analytics.

## 🎯 Features

### Authentication & Roles

* **Email and password sign up:** Users register with their email and a chosen password.  New accounts require email verification before the user can sign in.  Each user also picks a **nickname** to maintain privacy.
* **Role management:** There are three roles—`user`, `mentor`, and `admin`.  Roles are stored as custom claims using the Firebase Admin SDK and enforced via Firestore security rules.  Mentor applicants submit a form; administrators approve or reject these applications.  Approved mentors receive an email notifying them of their status.
* **Admin panel:** Administrators can view and manage mentors, users, discussions, admissions entries and scholarship listings.  They can also review mentor applications and send approval/rejection emails.

### Core Pages

* **Home:** Modern landing page built with Bootstrap.  It highlights admissions, scholarships, mentors and discussions, and contains call‑to‑action buttons for logging in and signing up.
* **Admissions:** Lists university programmes from around the world with filters for country, degree level (Bachelor/Master/PhD), application deadline and funding type.  Admins can create, update and delete admissions entries.
* **Scholarships:** Displays scholarships with details such as funding amount, eligibility criteria and application deadlines.  Entries can be filtered by country, GPA requirement and degree level.  Admins manage this list via a CRUD interface.
* **Discussion Forum:**  Users create threaded discussions with optional file attachments (stored in Firebase Storage).  Mentors reply to questions and users can upvote helpful answers.  Real‑time listeners (`onSnapshot()` from Firestore) update threads live【1355203089240†L1455-L1470】.
* **Dashboards:**  Separate dashboards for users, mentors and admins show relevant information—such as saved scholarships, mentor questions, and system analytics.  Each dashboard includes profile management (change password, update nickname) and notifications for new messages.

### Backend & Cloud Functions

* **Firestore data model:**
  * `users/{uid}` – stores email, nickname and role (`user`, `mentor`, `admin`).
  * `mentorApplications/{uid}` – stores application details and approval status.
  * `scholarships/{id}` – scholarship listings created by admins.
  * `admissions/{id}` – admissions opportunities created by admins.
  * `discussions/{threadId}` – discussion threads with title, content, tags, creator UID and timestamp.
    * `replies/{replyId}` – subcollection containing replies to a discussion.

* **Security rules:** Firestore security rules enforce role‑based access control.  A helper function reads each document’s `roles` map and verifies that the current user’s UID has the appropriate role【820954002773395†L1490-L1569】.

* **Cloud Functions:**  The `/functions` directory contains Node.js functions for:
  * **Mentor application workflow** – when an applicant submits the mentor form, a Cloud Function writes the data into the `mentorApplications` collection and notifies the admin.
  * **Approval/rejection** – when an admin changes an application’s status to `approved`, a function sets a custom claim for that user (`mentor`) and sends an approval email.  Rejected applications trigger a rejection email.  Emails are sent using the `nodemailer` library and an SMTP service or a Firebase extension for Firestore-triggered emails【928754300703334†L1498-L1559】.
  * **Logging and analytics** – functions log activity into a `logs` collection for auditing.  Another function aggregates statistics (total users, mentors, discussions, etc.) and writes them to an `analytics` document that the admin dashboard can read.

## 📂 Project Structure

```
student-portal/
├── README.md               – this file
├── firebase.json           – Firebase Hosting and Functions config
├── firestore.rules         – Firestore security rules
├── storage.rules           – Storage security rules
├── .firebaserc             – project alias configuration
├── public/                 – static frontend served by Firebase Hosting
│   ├── index.html          – landing page
│   ├── login.html          – sign in page
│   ├── signup.html         – sign up page with email verification
│   ├── admissions.html     – admissions list + filters
│   ├── scholarships.html   – scholarships list + filters
│   ├── forum.html          – discussion forum
│   ├── user.html           – user dashboard
│   ├── mentor.html         – mentor dashboard
│   ├── admin.html          – admin dashboard
│   ├── apply‑mentor.html    – mentor application form
│   └── assets/
│       ├── css/
│       │   └── styles.css  – custom styles overriding Bootstrap defaults
│       └── js/
│           ├── firebase‑init.js – Firebase config and initialization
│           ├── auth.js         – authentication logic (signup/login/logout)
│           ├── forum.js        – thread CRUD, real‑time listeners
│           ├── admissions.js   – fetch and render admissions, admin CRUD
│           ├── scholarships.js – fetch and render scholarships, admin CRUD
│           ├── dashboard.js    – logic shared by dashboards
│           └── admin.js        – admin‑specific actions (mentor approvals, analytics)
├── functions/              – Cloud Functions source
│   ├── package.json        – dependencies for functions
│   ├── index.js            – defines Firebase functions
│   └── helpers/
│       └── mail.js         – email helper using nodemailer
└── .env.example            – example environment variables (SMTP credentials)
```

## 🧠 Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <your-fork-url> student-portal
   cd student-portal
   ```

2. **Initialize Firebase:** Install the Firebase CLI if you haven’t already (`npm install -g firebase-tools`) and log in (`firebase login`).  Then run:

   ```bash
   firebase use --add  # select or create your Firebase project and set an alias
   firebase init       # choose Hosting, Firestore, Functions and Storage when prompted
   ```

3. **Configure environment variables:** Copy `.env.example` to `.env` and fill in your SMTP configuration for nodemailer (e.g. SendGrid/Mailgun).  These values will be used by Cloud Functions to send emails.

4. **Install dependencies for functions:**

   ```bash
   cd functions
   npm install
   cd ..
   ```

5. **Deploy:**

   ```bash
   firebase deploy
   ```

   This command builds and deploys the static frontend to Firebase Hosting, deploys Cloud Functions, and applies Firestore and Storage rules.

## 📝 Notes

* This project uses the modular Firebase Web SDK to reduce bundle size.  Imports are scoped to the functions they’re used in.
* Real‑time updates to discussion threads and notifications are implemented using Firestore’s `onSnapshot()` listener【1355203089240†L1455-L1470】.
* The Cloud Functions rely on an SMTP server or a Firebase extension to send emails.  For production you should configure a reputable email provider.

Please refer to individual files for more detailed documentation and comments.