const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onValueCreated, onValueUpdated} = require("firebase-functions/v2/database");
const {initializeApp} = require("firebase-admin/app");
const {getDatabase} = require("firebase-admin/database");
const {getMessaging} = require("firebase-admin/messaging");

// Initialize Firebase Admin
initializeApp();

/**
 * Cloud Function to send push notifications
 * Triggered when a new notification is added to the database
 */
exports.sendNotification = onValueCreated("/notifications/{notificationId}", async (event) => {
  const notificationId = event.params.notificationId;
  const notificationData = event.data.val();

  console.log(`Processing notification ${notificationId}:`, notificationData);

  try {
    // Get database reference
    const db = getDatabase();
    const messaging = getMessaging();

    // Get users to send notification to
    let targetUsers = [];
    
    if (notificationData.sendToAll) {
      // Get all users with FCM tokens and notifications enabled
      const usersSnapshot = await db.ref("users").once("value");
      const users = usersSnapshot.val() || {};
      
      targetUsers = Object.entries(users)
        .filter(([userId, user]) => {
          return user.fcmToken && 
                 user.fcmToken.trim() !== "" && 
                 user.notificationSettings?.enabled !== false;
        })
        .map(([userId, user]) => ({
          userId,
          fcmToken: user.fcmToken,
          name: user.name || "User"
        }));
    } else if (notificationData.selectedUsers && notificationData.selectedUsers.length > 0) {
      // Get specific users
      const userPromises = notificationData.selectedUsers.map(async (userId) => {
        const userSnapshot = await db.ref(`users/${userId}`).once("value");
        const user = userSnapshot.val();
        
        if (user && user.fcmToken && user.fcmToken.trim() !== "" && 
            user.notificationSettings?.enabled !== false) {
          return {
            userId,
            fcmToken: user.fcmToken,
            name: user.name || "User"
          };
        }
        return null;
      });
      
      const userResults = await Promise.all(userPromises);
      targetUsers = userResults.filter(user => user !== null);
    }

    if (targetUsers.length === 0) {
      console.log("No valid users to send notification to");
      await db.ref(`notifications/${notificationId}`).update({
        status: "failed",
        error: "No valid recipients found",
        processedAt: Date.now()
      });
      return;
    }

    console.log(`Sending notification to ${targetUsers.length} users`);

    // Prepare FCM message
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.body
      },
      data: {
        type: notificationData.type || "general_announcement",
        notificationId: notificationId,
        timestamp: Date.now().toString()
      },
      android: {
        notification: {
          icon: "ic_notification",
          color: "#8000ff",
          sound: "default"
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1
          }
        }
      }
    };

    // Send notifications in batches
    const batchSize = 500; // FCM limit
    const batches = [];
    
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      batches.push(batch);
    }

    let totalSent = 0;
    let totalFailed = 0;
    const failedTokens = [];

    for (const batch of batches) {
      try {
        const tokens = batch.map(user => user.fcmToken);
        const multicastMessage = {
          ...message,
          tokens: tokens
        };

        const response = await messaging.sendEachForMulticast(multicastMessage);
        
        console.log(`Batch sent: ${response.successCount} successful, ${response.failureCount} failed`);
        
        totalSent += response.successCount;
        totalFailed += response.failureCount;

        // Handle failed tokens
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const failedUser = batch[idx];
              failedTokens.push({
                userId: failedUser.userId,
                token: failedUser.fcmToken,
                error: resp.error?.code || "Unknown error"
              });

              // If token is invalid, remove it from user profile
              if (resp.error?.code === "messaging/registration-token-not-registered" ||
                  resp.error?.code === "messaging/invalid-registration-token") {
                console.log(`Removing invalid token for user ${failedUser.userId}`);
                db.ref(`users/${failedUser.userId}/fcmToken`).remove();
              }
            }
          });
        }
      } catch (error) {
        console.error("Error sending batch:", error);
        totalFailed += batch.length;
        
        batch.forEach(user => {
          failedTokens.push({
            userId: user.userId,
            token: user.fcmToken,
            error: error.message
          });
        });
      }
    }

    // Update notification status
    const updateData = {
      status: totalSent > 0 ? "sent" : "failed",
      processedAt: Date.now(),
      recipientCount: targetUsers.length,
      successCount: totalSent,
      failureCount: totalFailed
    };

    if (failedTokens.length > 0) {
      updateData.failedTokens = failedTokens;
    }

    await db.ref(`notifications/${notificationId}`).update(updateData);

    console.log(`Notification ${notificationId} processed: ${totalSent} sent, ${totalFailed} failed`);

  } catch (error) {
    console.error("Error processing notification:", error);
    
    // Update notification with error status
    await getDatabase().ref(`notifications/${notificationId}`).update({
      status: "failed",
      error: error.message,
      processedAt: Date.now()
    });
  }
});

/**
 * Callable function to send immediate notifications
 * Can be called from admin interface for testing
 */
exports.sendImmediateNotification = onCall(async (request) => {
  const {title, body, type, userIds} = request.data;

  if (!title || !body) {
    throw new Error("Title and body are required");
  }

  try {
    const db = getDatabase();
    
    // Create notification record
    const notificationData = {
      title,
      body,
      type: type || "general_announcement",
      sendToAll: !userIds || userIds.length === 0,
      selectedUsers: userIds || null,
      sentAt: Date.now(),
      status: "pending",
      source: "immediate"
    };

    const notificationRef = await db.ref("notifications").push(notificationData);
    
    return {
      success: true,
      notificationId: notificationRef.key,
      message: "Notification queued for sending"
    };
  } catch (error) {
    console.error("Error creating immediate notification:", error);
    throw new Error("Failed to send notification: " + error.message);
  }
});

/**
 * Function to clean up old notifications
 * Runs daily to remove notifications older than 30 days
 */
exports.cleanupOldNotifications = onRequest(async (req, res) => {
  try {
    const db = getDatabase();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const snapshot = await db.ref("notifications")
      .orderByChild("sentAt")
      .endAt(thirtyDaysAgo)
      .once("value");
    
    const oldNotifications = snapshot.val();
    
    if (oldNotifications) {
      const deletePromises = Object.keys(oldNotifications).map(notificationId => 
        db.ref(`notifications/${notificationId}`).remove()
      );
      
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${Object.keys(oldNotifications).length} old notifications`);
      res.json({
        success: true,
        deletedCount: Object.keys(oldNotifications).length
      });
    } else {
      res.json({
        success: true,
        deletedCount: 0,
        message: "No old notifications to clean up"
      });
    }
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Function to get notification statistics
 */
exports.getNotificationStats = onCall(async (request) => {
  try {
    const db = getDatabase();
    
    // Get all notifications from last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const snapshot = await db.ref("notifications")
      .orderByChild("sentAt")
      .startAt(thirtyDaysAgo)
      .once("value");
    
    const notifications = snapshot.val() || {};
    const notificationArray = Object.values(notifications);
    
    const stats = {
      total: notificationArray.length,
      sent: notificationArray.filter(n => n.status === "sent").length,
      failed: notificationArray.filter(n => n.status === "failed").length,
      pending: notificationArray.filter(n => n.status === "pending").length,
      totalRecipients: notificationArray.reduce((sum, n) => sum + (n.recipientCount || 0), 0),
      totalSuccessful: notificationArray.reduce((sum, n) => sum + (n.successCount || 0), 0),
      totalFailed: notificationArray.reduce((sum, n) => sum + (n.failureCount || 0), 0),
      byType: {}
    };
    
    // Group by type
    notificationArray.forEach(notification => {
      const type = notification.type || "general_announcement";
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    });
    
    return stats;
  } catch (error) {
    console.error("Error getting notification stats:", error);
    throw new Error("Failed to get notification statistics: " + error.message);
  }
});

/**
 * Function to handle FCM token cleanup
 * Removes invalid tokens from user profiles
 */
exports.cleanupInvalidTokens = onRequest(async (req, res) => {
  try {
    const db = getDatabase();
    const messaging = getMessaging();
    
    // Get all users with FCM tokens
    const usersSnapshot = await db.ref("users").once("value");
    const users = usersSnapshot.val() || {};
    
    const usersWithTokens = Object.entries(users)
      .filter(([userId, user]) => user.fcmToken && user.fcmToken.trim() !== "")
      .map(([userId, user]) => ({userId, token: user.fcmToken}));
    
    console.log(`Checking ${usersWithTokens.length} FCM tokens`);
    
    let removedCount = 0;
    
    // Test tokens in batches
    const batchSize = 100;
    for (let i = 0; i < usersWithTokens.length; i += batchSize) {
      const batch = usersWithTokens.slice(i, i + batchSize);
      
      try {
        const tokens = batch.map(user => user.token);
        const testMessage = {
          tokens: tokens,
          data: {test: "true"},
          dryRun: true // Don't actually send
        };
        
        const response = await messaging.sendEachForMulticast(testMessage);
        
        // Remove invalid tokens
        for (let j = 0; j < response.responses.length; j++) {
          const resp = response.responses[j];
          if (!resp.success) {
            const error = resp.error;
            if (error?.code === "messaging/registration-token-not-registered" ||
                error?.code === "messaging/invalid-registration-token") {
              const user = batch[j];
              await db.ref(`users/${user.userId}/fcmToken`).remove();
              removedCount++;
              console.log(`Removed invalid token for user ${user.userId}`);
            }
          }
        }
      } catch (error) {
        console.error("Error testing token batch:", error);
      }
    }
    
    res.json({
      success: true,
      checkedTokens: usersWithTokens.length,
      removedTokens: removedCount
    });
  } catch (error) {
    console.error("Error cleaning up tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
