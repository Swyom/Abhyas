const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendHabitReminders = functions.pubsub.schedule('0 9,18 * * *').onRun(async (context) => {
  const db = admin.firestore();
  
  // Format today's date as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const dayIndex = new Date().getDay();

  const usersSnapshot = await db.collection('users').get();
  
  const messages = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    // Skip users without an FCM token
    if (!userData.fcmToken) continue;

    // Get user's habits
    const habitsSnapshot = await db.collection(`users/${userDoc.id}/habits`).get();
    
    let hasIncompleteHabits = false;
    
    for (const habitDoc of habitsSnapshot.docs) {
      const habit = habitDoc.data();
      
      // Check if habit is scheduled for today
      const isScheduledToday = !habit.frequencyDays || habit.frequencyDays.length === 0 || habit.frequencyDays.includes(dayIndex);
      
      if (isScheduledToday) {
        const isCompleted = habit.history && habit.history[today] === true;
        if (!isCompleted) {
          hasIncompleteHabits = true;
          break; // One incomplete habit is enough to trigger the reminder
        }
      }
    }

    if (hasIncompleteHabits) {
      messages.push({
        token: userData.fcmToken,
        notification: {
          title: 'Abhyas Habit Tracker',
          body: 'Complete your habits',
        },
        android: {
          notification: {
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
      });
    }
  }

  if (messages.length > 0) {
    // Send in batches of 500 (FCM limit)
    for (let i = 0; i < messages.length; i += 500) {
      const batch = messages.slice(i, i + 500);
      try {
        const response = await admin.messaging().sendAll(batch);
        console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);
      } catch (error) {
        console.error('Error sending batched messages:', error);
      }
    }
  } else {
    console.log('No reminders to send at this time.');
  }

  return null;
});
