/**
 * Enhanced Swapin Backend - Firebase Cloud Functions
 * Advanced features: Real-time notifications, ratings, analytics, disputes, payments
 */

import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Enhanced middleware with rate limiting and better error handling
// @ts-ignore
async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({ error: "Unauthorized", code: "AUTH_REQUIRED" });
    return;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ error: "Invalid token", code: "INVALID_TOKEN" });
  }
}

// Rate limiting middleware
// @ts-ignore
function rateLimit(requestsPerMinute = 60) {
  const requests = new Map();
  return (req, res, next) => {
    //@ts-ignore
    const uid = req.user?.uid || req.ip;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!requests.has(uid)) {
      requests.set(uid, []);
    }
    
    const userRequests = requests.get(uid);
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= requestsPerMinute) {
      res.status(429).send({ error: "Rate limit exceeded", code: "RATE_LIMIT" });
      return;
    }
    
    recentRequests.push(now);
    requests.set(uid, recentRequests);
    next();
  };
}

setGlobalOptions({ maxInstances: 10 });

// Enhanced error handling with logging and structured responses
function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`Error in ${req.path}:`, error);
      const errorResponse = {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      };
      res.status(500).send(errorResponse);
    }
  };
}

// Real-time notification helper
async function sendRealTimeNotification(userId, notification) {
  try {
    await db.collection("users").doc(userId).collection("notifications").add({
      ...notification,
      isRead: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send push notification if user has FCM token
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    if (userData?.fcmToken) {
      await admin.messaging().send({
        token: userData.fcmToken,
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          type: notification.type,
          itemId: notification.itemId || ''
        }
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// --- ENHANCED USER MANAGEMENT ---

// Create or update user profile with enhanced fields
// @ts-ignore
export const createUserProfile = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { uid, displayName, email, photoURL } = req.user;
    const { phoneNumber, address, preferences, fcmToken } = req.body;
    
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    const userData = {
      uid,
      displayName,
      email,
      photoURL,
      phoneNumber,
      address,
      preferences: preferences || {},
      fcmToken,
      rating: 0,
      totalRatings: 0,
      totalSwaps: 0,
      isVerified: false,
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (!userDoc.exists) {
      userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      await userRef.set(userData);
    } else {
      await userRef.update({ 
        ...userData, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      });
    }
    
    res.status(200).send({ success: true, user: userData });
  });

// Get user profile with enhanced data
// @ts-ignore
export const getUserProfile = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { userId } = req.query;
    //@ts-ignore
    const uid = userId || req.user.uid;
    
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).send({ error: "User not found", code: "USER_NOT_FOUND" });
    
    const userData = userDoc.data();
    
    // Get user's recent activity
    const recentItems = await db.collection("items")
      .where("ownerId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    
    const recentSwaps = await db.collection("swaps")
      .where("offeredByUserId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    
    const response = {
      ...userData,
      recentItems: recentItems.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      recentSwaps: recentSwaps.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
    
    res.status(200).send(response);
  }));

// --- ENHANCED ITEM MANAGEMENT ---

// List an item with enhanced validation and analytics
// @ts-ignore
export const listItem = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { title, description, images, category, price, condition, tags, location } = req.body;
    //@ts-ignore
    const ownerId = req.user.uid;
    
    // Enhanced validation
    if (!title || title.length < 3) return res.status(400).send({ error: "Title must be at least 3 characters", code: "INVALID_TITLE" });
    if (!price || price < 1000) return res.status(400).send({ error: "Price must be at least ₹1000", code: "INVALID_PRICE" });
    if (!category) return res.status(400).send({ error: "Category is required", code: "MISSING_CATEGORY" });
    
    const item = {
      ownerId,
      title,
      description,
      images: images || [],
      category,
      price,
      condition: condition || "good",
      tags: tags || [],
      location,
      status: "active",
      views: 0,
      likes: 0,
      offers: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await db.collection("items").add(item);
    
    // Send notification to followers/category watchers
    await sendRealTimeNotification(ownerId, {
      type: "item_listed",
      title: "Item Listed Successfully",
      message: `Your item "${title}" has been listed for ₹${price}`,
      itemId: ref.id,
      itemTitle: title
    });
    
    res.status(200).send({ id: ref.id, ...item });
  });

// Update an item
// @ts-ignore
export const updateItem = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId, ...updates } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    const itemRef = db.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) return res.status(404).send({ error: "Item not found" });
    //@ts-ignore
    if (itemDoc.data().ownerId !== uid) return res.status(403).send({ error: "Forbidden" });
    await itemRef.update({ ...updates, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(200).send({ success: true });
  }));

// Delete an item
// @ts-ignore
export const deleteItem = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    const itemRef = db.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) return res.status(404).send({ error: "Item not found" });
    //@ts-ignore
    if (itemDoc.data().ownerId !== uid) return res.status(403).send({ error: "Forbidden" });
    await itemRef.delete();
    res.status(200).send({ success: true });
  }));

// Get all items (optionally filter by owner)
// @ts-ignore
export const getItems = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { ownerId } = req.query;
    let query = db.collection("items");
    //@ts-ignore
    if (ownerId) query = query.where("ownerId", "==", ownerId);
    const itemsSnap = await query.get();
    // @ts-ignore
    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(items);
  }));

// Get available items (not owned by user)
// @ts-ignore
export const getAvailableItems = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const itemsSnap = await db.collection("items").where("ownerId", "!=", uid).where("status", "==", "active").get();
    // @ts-ignore
    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(items);
  }));

// Enhanced search with filters, sorting, and pagination
// @ts-ignore
export const searchItems = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { q, category, minPrice, maxPrice, condition, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 20 } = req.query;
    //@ts-ignore
    const uid = req.user.uid;
    
    let query = db.collection("items").where("status", "==", "active");
    
    // Apply filters
    if (category) {
      //@ts-ignore
      query = query.where("category", "==", category);
    }
    if (minPrice) {
      //@ts-ignore
      query = query.where("price", ">=", parseInt(minPrice));
    }
    if (maxPrice) {
      //@ts-ignore
      query = query.where("price", "<=", parseInt(maxPrice));
    }
    if (condition) {
      //@ts-ignore
      query = query.where("condition", "==", condition);
    }
    
    // Apply sorting
    //@ts-ignore
    query = query.orderBy(sortBy, sortOrder);
    
    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    //@ts-ignore
    query = query.limit(parseInt(limit));
    
    const itemsSnap = await query.get();
    //@ts-ignore
    let items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Text search (client-side for now, can be enhanced with Algolia)
    if (q) {
      //@ts-ignore
      const qLower = q.toLowerCase();
      //@ts-ignore
      items = items.filter(item =>
        //@ts-ignore
        (item.title && item.title.toLowerCase().includes(qLower)) ||
        //@ts-ignore
        (item.description && item.description.toLowerCase().includes(qLower)) ||
        //@ts-ignore
        (item.category && item.category.toLowerCase().includes(qLower)) ||
        //@ts-ignore
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(qLower)))
      );
    }
    
    // Remove user's own items
    //@ts-ignore
    items = items.filter(item => item.ownerId !== uid);
    
    // Get total count for pagination
    const totalQuery = db.collection("items").where("status", "==", "active");
    const totalSnap = await totalQuery.get();
    const total = totalSnap.size;
    
    res.status(200).send({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }));

// Track item view
// @ts-ignore
export const trackItemView = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    
    const itemRef = db.collection("items").doc(itemId);
    await itemRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    // Record view analytics
    await db.collection("analytics").add({
      type: "item_view",
      itemId,
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).send({ success: true });
  }));

// --- ENHANCED SWAP MANAGEMENT ---

// Propose a swap with enhanced validation
// @ts-ignore
export const proposeSwap = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemOfferedId, itemRequestedId, message } = req.body;
    //@ts-ignore
    const offeredByUserId = req.user.uid;
    
    if (!itemOfferedId || !itemRequestedId) {
      return res.status(400).send({ error: "Missing item IDs", code: "MISSING_ITEMS" });
    }
    
    // Validate items exist and are available
    const [itemOfferedDoc, itemRequestedDoc] = await Promise.all([
      db.collection("items").doc(itemOfferedId).get(),
      db.collection("items").doc(itemRequestedId).get()
    ]);
    
    if (!itemOfferedDoc.exists || !itemRequestedDoc.exists) {
      return res.status(404).send({ error: "Item not found", code: "ITEM_NOT_FOUND" });
    }
    
    const itemOffered = itemOfferedDoc.data();
    const itemRequested = itemRequestedDoc.data();
    
    // Validate ownership and status
    if (itemOffered.ownerId !== offeredByUserId) {
      return res.status(403).send({ error: "You don't own the offered item", code: "NOT_OWNER" });
    }
    
    if (itemRequested.ownerId === offeredByUserId) {
      return res.status(400).send({ error: "Cannot swap with yourself", code: "SELF_SWAP" });
    }
    
    if (itemOffered.status !== "active" || itemRequested.status !== "active") {
      return res.status(400).send({ error: "Items must be active", code: "INACTIVE_ITEMS" });
    }
    
    const netAmount = itemRequested.price - itemOffered.price;
    
    const swap = {
      itemOfferedId,
      itemRequestedId,
      offeredByUserId,
      requestedFromUserId: itemRequested.ownerId,
      netAmount,
      message: message || "",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await db.collection("swaps").add(swap);
    
    // Send notification to item owner
    await sendRealTimeNotification(itemRequested.ownerId, {
      type: "swap_proposed",
      title: "New Swap Offer",
      message: `Someone wants to swap "${itemOffered.title}" for your "${itemRequested.title}"`,
      itemId: itemRequestedId,
      itemTitle: itemRequested.title,
      swapId: ref.id
    });
    
    // Update item analytics
    await Promise.all([
      db.collection("items").doc(itemRequestedId).update({
        offers: admin.firestore.FieldValue.increment(1)
      }),
      db.collection("analytics").add({
        type: "swap_proposed",
        swapId: ref.id,
        offeredByUserId,
        requestedFromUserId: itemRequested.ownerId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      })
    ]);
    
    res.status(200).send({ id: ref.id, ...swap });
  });

// Accept swap with enhanced logic
// @ts-ignore
export const acceptSwap = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { swapId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    
    const swapRef = db.collection("swaps").doc(swapId);
    const swapDoc = await swapRef.get();
    
    if (!swapDoc.exists) {
      return res.status(404).send({ error: "Swap not found", code: "SWAP_NOT_FOUND" });
    }
    
    const swap = swapDoc.data();
    if (swap.requestedFromUserId !== uid) {
      return res.status(403).send({ error: "Forbidden", code: "NOT_AUTHORIZED" });
    }
    
    if (swap.status !== "pending") {
      return res.status(400).send({ error: "Swap is not pending", code: "INVALID_STATUS" });
    }
    
    // Update swap status
    await swapRef.update({
      status: "accepted",
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update item statuses
    await Promise.all([
      db.collection("items").doc(swap.itemOfferedId).update({ status: "swapped" }),
      db.collection("items").doc(swap.itemRequestedId).update({ status: "swapped" })
    ]);
    
    // Send notifications
    await Promise.all([
      sendRealTimeNotification(swap.offeredByUserId, {
        type: "swap_accepted",
        title: "Swap Accepted!",
        message: "Your swap offer has been accepted. Proceed with delivery.",
        itemId: swap.itemOfferedId,
        swapId: swapId
      }),
      sendRealTimeNotification(swap.requestedFromUserId, {
        type: "swap_accepted",
        title: "Swap Accepted!",
        message: "You accepted the swap offer. Proceed with delivery.",
        itemId: swap.itemRequestedId,
        swapId: swapId
      })
    ]);
    
    // Create delivery records
    await Promise.all([
      db.collection("deliveries").add({
        swapId,
        itemId: swap.itemOfferedId,
        fromUserId: swap.offeredByUserId,
        toUserId: swap.requestedFromUserId,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }),
      db.collection("deliveries").add({
        swapId,
        itemId: swap.itemRequestedId,
        fromUserId: swap.requestedFromUserId,
        toUserId: swap.offeredByUserId,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    ]);
    
    res.status(200).send({ success: true });
  }));

// Decline a swap
// @ts-ignore
export const declineSwap = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { swapId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    const swapRef = db.collection("swaps").doc(swapId);
    const swapDoc = await swapRef.get();
    if (!swapDoc.exists) return res.status(404).send({ error: "Swap not found" });
    //@ts-ignore
    if (swapDoc.data().requestedFromUserId !== uid) return res.status(403).send({ error: "Forbidden" });
    await swapRef.update({ status: "declined", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(200).send({ success: true });
  }));

// Get swaps for user (as offerer or receiver)
// @ts-ignore
export const getUserSwaps = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const swapsSnap = await db.collection("swaps").where("offeredByUserId", "==", uid).get();
    const swapsSnap2 = await db.collection("swaps").where("requestedFromUserId", "==", uid).get();
    // @ts-ignore
    const swaps = [...swapsSnap.docs, ...swapsSnap2.docs].map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(swaps);
  }));

// --- WISHLIST ---
// Add to wishlist
// @ts-ignore
export const addToWishlist = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    await db.collection("users").doc(uid).collection("wishlist").doc(itemId).set({ itemId, addedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(200).send({ success: true });
  }));

// Remove from wishlist
// @ts-ignore
export const removeFromWishlist = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    await db.collection("users").doc(uid).collection("wishlist").doc(itemId).delete();
    res.status(200).send({ success: true });
  }));

// Get wishlist
// @ts-ignore
export const getWishlist = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const snap = await db.collection("users").doc(uid).collection("wishlist").get();
    // @ts-ignore
    const wishlist = snap.docs.map(doc => doc.data());
    res.status(200).send(wishlist);
  }));

// --- NOTIFICATIONS ---
// Send notification (internal use)
// @ts-ignore
export const sendNotification = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { toUserId, type, title, message, itemId, itemTitle, priority } = req.body;
    const notif = {
      type, title, message, itemId, itemTitle, priority: priority || "medium", isRead: false, timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("users").doc(toUserId).collection("notifications").add(notif);
    res.status(200).send({ success: true });
  }));

// Get notifications with pagination
// @ts-ignore
export const getNotifications = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    //@ts-ignore
    const uid = req.user.uid;
    
    let query = db.collection("users").doc(uid).collection("notifications")
      .orderBy("timestamp", "desc");
    
    if (unreadOnly === "true") {
      query = query.where("isRead", "==", false);
    }
    
    //@ts-ignore
    query = query.limit(parseInt(limit));
    
    const snap = await query.get();
    //@ts-ignore
    const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get unread count
    const unreadSnap = await db.collection("users").doc(uid)
      .collection("notifications")
      .where("isRead", "==", false)
      .get();
    
    res.status(200).send({
      notifications,
      unreadCount: unreadSnap.size,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  }));

// Mark notification as read
// @ts-ignore
export const markNotificationRead = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { notificationId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    await db.collection("users").doc(uid).collection("notifications").doc(notificationId).update({ isRead: true });
    res.status(200).send({ success: true });
  }));

// Mark all notifications as read
// @ts-ignore
export const markAllNotificationsRead = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    
    const batch = db.batch();
    const unreadSnap = await db.collection("users").doc(uid)
      .collection("notifications")
      .where("isRead", "==", false)
      .get();
    
    unreadSnap.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    
    res.status(200).send({ success: true, updated: unreadSnap.size });
  }));

// --- DELIVERY LOCATIONS ---
// Add or update delivery location
// @ts-ignore
export const saveLocation = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { locationId, ...location } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    const ref = db.collection("users").doc(uid).collection("deliveryLocations").doc(locationId || undefined);
    await ref.set({ ...location, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.status(200).send({ success: true });
  }));

// Get delivery locations
// @ts-ignore
export const getLocations = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const snap = await db.collection("users").doc(uid).collection("deliveryLocations").get();
    // @ts-ignore
    const locations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(locations);
  }));

// Delete delivery location
// @ts-ignore
export const deleteLocation = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { locationId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    await db.collection("users").doc(uid).collection("deliveryLocations").doc(locationId).delete();
    res.status(200).send({ success: true });
  }));

// --- CART ---
// Add item to cart
// @ts-ignore
export const addToCart = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId, quantity = 1 } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    if (!itemId) return res.status(400).send({ error: "Missing itemId" });
    await db.collection("users").doc(uid).collection("cart").doc(itemId).set({ itemId, quantity, addedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.status(200).send({ success: true });
  }));

// Remove item from cart
// @ts-ignore
export const removeFromCart = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    if (!itemId) return res.status(400).send({ error: "Missing itemId" });
    await db.collection("users").doc(uid).collection("cart").doc(itemId).delete();
    res.status(200).send({ success: true });
  }));

// Get user cart
// @ts-ignore
export const getCart = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const snap = await db.collection("users").doc(uid).collection("cart").get();
    //@ts-ignore
    const cart = snap.docs.map(doc => doc.data());
    res.status(200).send(cart);
  }));

// --- RATINGS AND REVIEWS ---

// Add rating and review
// @ts-ignore
export const addRating = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { targetUserId, rating, review, swapId } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    
    if (!targetUserId || !rating || rating < 1 || rating > 5) {
      return res.status(400).send({ error: "Invalid rating", code: "INVALID_RATING" });
    }
    
    // Check if user has already rated
    const existingRating = await db.collection("ratings")
      .where("fromUserId", "==", uid)
      .where("toUserId", "==", targetUserId)
      .where("swapId", "==", swapId)
      .get();
    
    if (!existingRating.empty) {
      return res.status(400).send({ error: "Already rated", code: "ALREADY_RATED" });
    }
    
    const ratingData = {
      fromUserId: uid,
      toUserId: targetUserId,
      swapId,
      rating,
      review: review || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection("ratings").add(ratingData);
    
    // Update user's average rating
    const userRatings = await db.collection("ratings")
      .where("toUserId", "==", targetUserId)
      .get();
    
    const totalRating = userRatings.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
    const averageRating = totalRating / userRatings.docs.length;
    
    await db.collection("users").doc(targetUserId).update({
      rating: Math.round(averageRating * 10) / 10,
      totalRatings: userRatings.docs.length
    });
    
    res.status(200).send({ success: true });
  }));

// Get user ratings
// @ts-ignore
export const getUserRatings = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { userId } = req.query;
    
    const ratingsSnap = await db.collection("ratings")
      .where("toUserId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    //@ts-ignore
    const ratings = ratingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.status(200).send(ratings);
  }));

// --- DISPUTE RESOLUTION ---

// Create dispute
// @ts-ignore
export const createDispute = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { swapId, reason, description, evidence } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    
    const dispute = {
      swapId,
      createdBy: uid,
      reason,
      description,
      evidence: evidence || [],
      status: "open",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await db.collection("disputes").add(dispute);
    
    // Send notification to support team
    await sendRealTimeNotification("support", {
      type: "dispute_created",
      title: "New Dispute Filed",
      message: `Dispute #${ref.id} has been created for swap ${swapId}`,
      disputeId: ref.id
    });
    
    res.status(200).send({ id: ref.id, ...dispute });
  }));

// --- PAYMENT INTEGRATION (Stub for future implementation) ---

// Initialize payment for net amount
// @ts-ignore
export const initializePayment = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { swapId, amount, paymentMethod } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    
    // This would integrate with payment gateway (Razorpay, Stripe, etc.)
    const payment = {
      swapId,
      userId: uid,
      amount,
      paymentMethod,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await db.collection("payments").add(payment);
    
    // Return payment gateway response (stub)
    res.status(200).send({
      paymentId: ref.id,
      gatewayOrderId: `order_${Date.now()}`,
      amount,
      currency: "INR"
    });
  }));

// --- ANALYTICS AND INSIGHTS ---

// Get user analytics
// @ts-ignore
export const getUserAnalytics = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    
    // Get user's items
    const itemsSnap = await db.collection("items").where("ownerId", "==", uid).get();
    const items = itemsSnap.docs.map(doc => doc.data());
    
    // Get user's swaps
    const swapsSnap = await db.collection("swaps")
      .where("offeredByUserId", "==", uid)
      .get();
    const swaps = swapsSnap.docs.map(doc => doc.data());
    
    // Calculate analytics
    const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = items.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalOffers = items.reduce((sum, item) => sum + (item.offers || 0), 0);
    const successfulSwaps = swaps.filter(swap => swap.status === "accepted").length;
    
    const analytics = {
      totalItems: items.length,
      activeItems: items.filter(item => item.status === "active").length,
      totalViews,
      totalLikes,
      totalOffers,
      successfulSwaps,
      averageViews: items.length > 0 ? Math.round(totalViews / items.length) : 0,
      conversionRate: totalOffers > 0 ? Math.round((successfulSwaps / totalOffers) * 100) : 0
    };
    
    res.status(200).send(analytics);
  }));
