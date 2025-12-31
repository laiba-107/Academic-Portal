const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Error: FIREBASE_PRIVATE_KEY not found in .env.local');
    process.exit(1);
}

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
} catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
}

const email = process.argv[2];

if (!email) {
    console.log('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
}

async function makeAdmin(email) {
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });

        // Also update the Firestore document for UI consistency if it exists
        const db = admin.firestore();
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({ role: 'admin' }, { merge: true });

        console.log(`Success! User ${email} is now an Admin.`);
        console.log('They may need to sign out and sign back in for changes to take effect.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

makeAdmin(email);
