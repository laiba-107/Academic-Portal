const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendMail } = require('./helpers/mail');

admin.initializeApp();
const db = admin.firestore();

/**
 * Firestore trigger: when a new mentor application is submitted.
 * Notifies the admin via email.  The application document must contain
 * at least the applicant's UID (`uid`), full name, experience and a
 * status field (default `pending`).
 */
exports.onMentorApplicationCreate = functions.firestore
  .document('mentorApplications/{appId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const uid = context.params.appId;
    const adminEmail = process.env.ADMIN_EMAIL;
    const fullName = data.fullName || uid;
    const message = `A new mentor application has been submitted by ${fullName} (UID: ${uid}).\n\n` +
      `Experience: ${data.experience || 'N/A'}\n` +
      `Additional Info: ${data.additionalInfo || 'N/A'}\n`;

    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: 'New Mentor Application',
        text: message,
      });
    }
    // Log the event
    await db.collection('logs').add({
      type: 'mentorApplicationCreated',
      uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

/**
 * Firestore trigger: when a mentor application is updated.  If the status
 * changes to `approved` or `rejected`, update custom claims and notify
 * the applicant by email.
 */
exports.onMentorApplicationUpdate = functions.firestore
  .document('mentorApplications/{appId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const uid = context.params.appId;

    if (before.status === after.status) {
      return null; // status unchanged
    }

    const status = after.status;
    const userDocRef = db.collection('users').doc(uid);
    const userSnapshot = await userDocRef.get();
    const userData = userSnapshot.exists ? userSnapshot.data() : {};
    const email = userData.email || after.email;
    const nickname = userData.nickname || '';

    if (status === 'approved') {
      // Set custom claim role = mentor
      await admin.auth().setCustomUserClaims(uid, { role: 'mentor' });
      // Update Firestore user role field
      await userDocRef.set({ role: 'mentor' }, { merge: true });
      // Notify the applicant
      if (email) {
        await sendMail({
          to: email,
          subject: 'Mentor Application Approved',
          text: `Hello ${nickname || ''},\n\nYour mentor application has been approved! ` +
            `You can now log in using your existing account and access the mentor dashboard.\n\n` +
            `Thank you for volunteering to help students.\n`,
        });
      }
    } else if (status === 'rejected') {
      // Remove mentor claim by setting role to user
      await admin.auth().setCustomUserClaims(uid, { role: 'user' });
      // Update Firestore user role field
      await userDocRef.set({ role: 'user' }, { merge: true });
      // Notify the applicant
      if (email) {
        await sendMail({
          to: email,
          subject: 'Mentor Application Rejected',
          text: `Hello ${nickname || ''},\n\nThank you for applying to be a mentor. ` +
            `Unfortunately, your application has not been approved at this time.\n`,
        });
      }
    }

    // Log the status change
    await db.collection('logs').add({
      type: 'mentorApplicationStatusChanged',
      uid,
      status,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return null;
  });

/**
 * Scheduled function: aggregate analytics every hour.  It counts the
 * number of users, mentors, discussions and replies and writes the
 * results to the `analytics/overview` document.  Use Firestore count
 * queries when available for efficiency.
 */
exports.aggregateAnalytics = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    // Use count() aggregate queries
    const usersSnap = await db.collection('users').count().get();
    const mentorsSnap = await db.collection('users').where('role', '==', 'mentor').count().get();
    const discussionsSnap = await db.collection('discussions').count().get();
    // Replies count: iterate discussions and aggregate
    let repliesCount = 0;
    const threadDocs = await db.collection('discussions').listDocuments();
    for (const docRef of threadDocs) {
      const repliesAgg = await docRef.collection('replies').count().get();
      repliesCount += repliesAgg.data().count;
    }
    const analyticsRef = db.collection('analytics').doc('overview');
    await analyticsRef.set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      users: usersSnap.data().count,
      mentors: mentorsSnap.data().count,
      discussions: discussionsSnap.data().count,
      replies: repliesCount,
    }, { merge: true });
    return null;
  });

/**
 * HTTPS callable function: returns aggregated analytics to the caller.  Only
 * admins can invoke this function (enforced via Firebase IAM and custom claims).
 */
exports.getAnalytics = functions.https.onCall(async (data, context) => {
    // Enforce that only admins can call this function
    if (!context.auth || context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only administrators can access analytics.');
    }
    const doc = await db.collection('analytics').doc('overview').get();
    return doc.exists ? doc.data() : {};
});