const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { sendMail } = require('./helpers/mail');
require('dotenv').config();

// Initialize Firebase Admin
// On Render, we'll use a service account JSON string in env var
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

// If no service account context (local dev without creds), it might default to implicit auth 
// or fail if relying on it. For now, assume it's provided or configured.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault()
    });
}

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware to verify Firebase ID Token
const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

// --- ROUTES ---

// 1. Submit Mentor Application
// frontend calls: POST /api/applications
app.post('/api/applications', verifyAuth, async (req, res) => {
    try {
        const { fullName, experience, additionalInfo, email } = req.body;
        const uid = req.user.uid;

        const docData = {
            uid,
            fullName: fullName || 'Unknown',
            experience: experience || '',
            additionalInfo: additionalInfo || '',
            email: email || req.user.email,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firestore
        await db.collection('mentorApplications').doc(uid).set(docData);

        // Send email to Admin
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            const message = `A new mentor application has been submitted by ${docData.fullName} (UID: ${uid}).\n\n` +
                `Experience: ${docData.experience}\n` +
                `Additional Info: ${docData.additionalInfo}\n`;

            // sending asynchronously without waiting
            sendMail({
                to: adminEmail,
                subject: 'New Mentor Application',
                text: message,
            }).catch(console.error);
        }

        // Log the event
        await db.collection('logs').add({
            type: 'mentorApplicationCreated',
            uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(201).json({ message: 'Application submitted successfully' });

    } catch (error) {
        console.error('Error submitting application:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Approve/Reject Application (Admin Only)
// frontend calls: PATCH /api/applications/:uid/status
app.patch('/api/applications/:uid/status', verifyAuth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && !req.user.admin) {
            // Double check claims, usually the custom claim is 'role' or 'admin' 
            // We can double check the user doc if we want strict consistency, but claims are standard.
            // For this project, 'role' claim is used.
            const userRec = await admin.auth().getUser(req.user.uid);
            const claims = userRec.customClaims || {};
            if (claims.role !== 'admin') {
                return res.status(403).json({ error: 'Permission denied: Admins only' });
            }
        }

        const { uid } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const appRef = db.collection('mentorApplications').doc(uid);
        const appSnap = await appRef.get();

        if (!appSnap.exists) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Update Application Status
        await appRef.update({ status });

        // Handle Roles and Email
        const userDocRef = db.collection('users').doc(uid);
        const userSnapshot = await userDocRef.get();
        const userData = userSnapshot.exists ? userSnapshot.data() : {};
        const email = userData.email || appSnap.data().email;
        const nickname = userData.nickname || '';

        if (status === 'approved') {
            // Set custom claim role = mentor
            await admin.auth().setCustomUserClaims(uid, { role: 'mentor' });
            await userDocRef.set({ role: 'mentor' }, { merge: true });

            if (email) {
                sendMail({
                    to: email,
                    subject: 'Mentor Application Approved',
                    text: `Hello ${nickname || ''},\n\nYour mentor application has been approved! You can now log in and access the mentor dashboard.\n`,
                }).catch(console.error);
            }
        } else if (status === 'rejected') {
            // Revert to user
            await admin.auth().setCustomUserClaims(uid, { role: 'user' });
            await userDocRef.set({ role: 'user' }, { merge: true });

            if (email) {
                sendMail({
                    to: email,
                    subject: 'Mentor Application Rejected',
                    text: `Hello ${nickname || ''},\n\nUnfortunately, your application has not been approved at this time.\n`,
                }).catch(console.error);
            }
        }

        // Log
        await db.collection('logs').add({
            type: 'mentorApplicationStatusChanged',
            uid,
            status,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.json({ message: `Application ${status}` });

    } catch (error) {
        console.error('Error updating application:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Analytics (Admin Only)
// frontend calls: GET /api/analytics
app.get('/api/analytics', verifyAuth, async (req, res) => {
    try {
        const userRec = await admin.auth().getUser(req.user.uid);
        const claims = userRec.customClaims || {};
        if (claims.role !== 'admin') {
            return res.status(403).json({ error: 'Permission denied: Admins only' });
        }

        // We can calculate on the fly (expensive) or read from the aggregated doc.
        // Let's read from the 'analytics/overview' doc which we can continue to update
        // OR calculate on the fly since we don't have the scheduled trigger anymore.

        // Let's implement on-the-fly aggregation for the API endpoint (Render is powerful enough).
        // Or if we want to be closer to the original, we can update the analytics doc whenever relevant actions happen.
        // But simpler is to just run the count queries here since there's no scheduled task.

        const usersSnap = await db.collection('users').count().get();
        const mentorsSnap = await db.collection('users').where('role', '==', 'mentor').count().get();
        const discussionsSnap = await db.collection('discussions').count().get();

        // Replies is harder to count cheaply without a recursive sum. 
        // For now let's just count discussions, users, mentors.
        // If we really need replies, we'd need to iterate or keep a counter.
        // Let's stick to the high level stats for speed.

        const stats = {
            users: usersSnap.data().count,
            mentors: mentorsSnap.data().count,
            discussions: discussionsSnap.data().count,
        };

        return res.json(stats);

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
