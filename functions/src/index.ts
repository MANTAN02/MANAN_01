/**
 * Enhanced Swapin Backend - Firebase Cloud Functions
 * Advanced features: Real-time notifications, ratings, analytics, disputes, payments, chat, AI search, verification
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

// Real-time notification helper with push notifications
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
          itemId: notification.itemId || '',
          swapId: notification.swapId || ''
        }
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// AI-powered search helper
function performAISearch(items, query) {
  const qLower = query.toLowerCase();
  const keywords = qLower.split(' ').filter(word => word.length > 2);
  
  return items.filter(item => {
    const titleScore = keywords.reduce((score, keyword) => {
      if (item.title?.toLowerCase().includes(keyword)) score += 3;
      return score;
    }, 0);
    
    const descScore = keywords.reduce((score, keyword) => {
      if (item.description?.toLowerCase().includes(keyword)) score += 2;
      return score;
    }, 0);
    
    const categoryScore = keywords.reduce((score, keyword) => {
      if (item.category?.toLowerCase().includes(keyword)) score += 2;
      return score;
    }, 0);
    
    const tagScore = keywords.reduce((score, keyword) => {
      if (item.tags?.some(tag => tag.toLowerCase().includes(keyword))) score += 1;
      return score;
    }, 0);
    
    return (titleScore + descScore + categoryScore + tagScore) > 0;
  }).sort((a, b) => {
    const aScore = calculateItemScore(a);
    const bScore = calculateItemScore(b);
    return bScore - aScore;
  });
}

// Calculate item relevance score
function calculateItemScore(item) {
  let score = 0;
  score += (item.views || 0) * 0.1;
  score += (item.likes || 0) * 0.5;
  score += (item.offers || 0) * 0.3;
  if (item.condition === 'new') score += 10;
  if (item.condition === 'like-new') score += 8;
  if (item.condition === 'good') score += 5;
  return score;
}

// Recommendation engine
async function getRecommendations(userId, itemId = null) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    
    // Get user's recent activity
    const recentViews = await db.collection("users").doc(userId)
      .collection("recentViews")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();
    
    const userPreferences = recentViews.docs.map(doc => doc.data().category);
    
    // Get items in user's preferred categories
    let query = db.collection("items")
      .where("status", "==", "active")
      .where("ownerId", "!=", userId);
    
    if (userPreferences.length > 0) {
      query = query.where("category", "in", userPreferences.slice(0, 5));
    }
    
    const itemsSnap = await query.limit(20).get();
    let items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter out the current item if provided
    if (itemId) {
      items = items.filter(item => item.id !== itemId);
    }
    
    // Sort by relevance score
    items.sort((a, b) => calculateItemScore(b) - calculateItemScore(a));
    
    return items.slice(0, 10);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Item verification system
async function verifyItem(itemId, verificationData) {
  try {
    const itemRef = db.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    
    if (!itemDoc.exists) {
      throw new Error("Item not found");
    }
    
    const verification = {
      itemId,
      verifiedBy: verificationData.verifiedBy,
      verificationType: verificationData.type, // photo, video, inspection
      status: verificationData.status, // pending, approved, rejected
      notes: verificationData.notes,
      images: verificationData.images || [],
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection("verifications").add(verification);
    
    // Update item verification status
    await itemRef.update({
      isVerified: verificationData.status === 'approved',
      verificationStatus: verificationData.status
    });
    
    return verification;
  } catch (error) {
    console.error('Error verifying item:', error);
    throw error;
  }
}

// User verification system
async function verifyUser(userId, verificationData) {
  try {
    const userRef = db.collection("users").doc(userId);
    
    const verification = {
      userId,
      verifiedBy: verificationData.verifiedBy,
      verificationType: verificationData.type, // id, phone, email, address
      status: verificationData.status, // pending, approved, rejected
      documents: verificationData.documents || [],
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection("userVerifications").add(verification);
    
    // Update user verification status
    await userRef.update({
      isVerified: verificationData.status === 'approved',
      verificationStatus: verificationData.status
    });
    
    return verification;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
}

// Advanced payment processing
async function processPayment(paymentData) {
  try {
    const payment = {
      userId: paymentData.userId,
      swapId: paymentData.swapId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      paymentMethod: paymentData.paymentMethod,
      gateway: paymentData.gateway || 'razorpay',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const paymentRef = await db.collection("payments").add(payment);
    
    // Simulate payment gateway integration
    const gatewayResponse = {
      orderId: `order_${Date.now()}`,
      paymentId: paymentRef.id,
      status: 'created',
      amount: paymentData.amount,
      currency: payment.currency
    };
    
    // Update payment with gateway response
    await paymentRef.update({
      gatewayOrderId: gatewayResponse.orderId,
      gatewayResponse: gatewayResponse
    });
    
    return gatewayResponse;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

// Dispute resolution system
async function resolveDispute(disputeId, resolution) {
  try {
    const disputeRef = db.collection("disputes").doc(disputeId);
    const disputeDoc = await disputeRef.get();
    
    if (!disputeDoc.exists) {
      throw new Error("Dispute not found");
    }
    
    const dispute = disputeDoc.data();
    
    const resolutionData = {
      disputeId,
      resolvedBy: resolution.resolvedBy,
      resolution: resolution.decision,
      reason: resolution.reason,
      action: resolution.action, // refund, partial_refund, no_action
      amount: resolution.amount || 0,
      resolvedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection("disputeResolutions").add(resolutionData);
    
    // Update dispute status
    await disputeRef.update({
      status: 'resolved',
      resolution: resolutionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send notifications to involved parties
    await sendRealTimeNotification(dispute.createdBy, {
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `Your dispute has been resolved: ${resolution.decision}`,
      disputeId: disputeId
    });
    
    return resolutionData;
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
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
    const { phoneNumber, address, preferences, fcmToken, verificationDocuments } = req.body;
    
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
      verificationDocuments: verificationDocuments || [],
      rating: 0,
      totalRatings: 0,
      totalSwaps: 0,
      isVerified: false,
      verificationStatus: 'pending',
      trustScore: 100,
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
    
    // Get user verification status
    const verificationDoc = await db.collection("userVerifications")
      .where("userId", "==", uid)
      .orderBy("verifiedAt", "desc")
      .limit(1)
      .get();
    
    const response = {
      ...userData,
      recentItems: recentItems.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      recentSwaps: recentSwaps.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      verification: verificationDoc.docs[0]?.data() || null
    };
    
    res.status(200).send(response);
  });

// --- ENHANCED ITEM MANAGEMENT ---

// List an item with enhanced validation and analytics
// @ts-ignore
export const listItem = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { title, description, images, category, price, condition, tags, location, verificationRequired } = req.body;
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
      verificationRequired: verificationRequired || false,
      isVerified: false,
      verificationStatus: 'pending',
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

// Enhanced search with AI and filters
// @ts-ignore
export const searchItems = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { q, category, minPrice, maxPrice, condition, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 20, verifiedOnly = false } = req.query;
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
    if (verifiedOnly === "true") {
      //@ts-ignore
      query = query.where("isVerified", "==", true);
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
    
    // AI-powered text search
    if (q) {
      //@ts-ignore
      items = performAISearch(items, q);
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

// Get item recommendations
// @ts-ignore
export const getRecommendations = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId } = req.query;
    //@ts-ignore
    const uid = req.user.uid;
    
    const recommendations = await getRecommendations(uid, itemId);
    res.status(200).send(recommendations);
  });

// Track item view with enhanced analytics
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
    
    // Add to user's recent views
    await db.collection("users").doc(uid)
      .collection("recentViews")
      .doc(itemId)
      .set({
        itemId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    
    res.status(200).send({ success: true });
  });

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

// Resolve dispute
// @ts-ignore
export const resolveDispute = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { disputeId, resolution } = req.body;
    //@ts-ignore
    const resolvedBy = req.user.uid;
    
    const resolutionData = await resolveDispute(disputeId, {
      ...resolution,
      resolvedBy
    });
    
    res.status(200).send(resolutionData);
  });

// --- PAYMENT SYSTEM ---

// Initialize payment
// @ts-ignore
export const initializePayment = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { swapId, amount, paymentMethod, gateway = "razorpay" } = req.body;
    //@ts-ignore
    const uid = req.user.uid;
    
    const paymentResponse = await processPayment({
      userId: uid,
      swapId,
      amount,
      paymentMethod,
      gateway
    });
    
    res.status(200).send(paymentResponse);
  });

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

// --- CHAT SYSTEM ---

// Send chat message
// @ts-ignore
export const sendChatMessage = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { chatId, receiverId, text, messageType = "text", attachments = [] } = req.body;
    //@ts-ignore
    const senderId = req.user.uid;
    
    if (!text || !receiverId) {
      return res.status(400).send({ error: "Missing required fields", code: "MISSING_FIELDS" });
    }
    
    // Create or get chat
    let chatDoc;
    if (chatId) {
      chatDoc = await db.collection("chats").doc(chatId).get();
    } else {
      // Create new chat
      const chatData = {
        participants: {
          [senderId]: { joinedAt: admin.firestore.FieldValue.serverTimestamp() },
          [receiverId]: { joinedAt: admin.firestore.FieldValue.serverTimestamp() }
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const chatRef = await db.collection("chats").add(chatData);
      chatDoc = await chatRef.get();
    }
    
    // Add message
    const message = {
      senderId,
      receiverId,
      text,
      messageType,
      attachments,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const messageRef = await db.collection("chats").doc(chatDoc.id)
      .collection("messages")
      .add(message);
    
    // Update chat metadata
    await db.collection("chats").doc(chatDoc.id).update({
      lastMessage: {
        text,
        senderId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send notification
    await sendRealTimeNotification(receiverId, {
      type: "new_message",
      title: "New Message",
      message: text.length > 50 ? text.substring(0, 50) + "..." : text,
      chatId: chatDoc.id
    });
    
    res.status(200).send({ 
      messageId: messageRef.id, 
      chatId: chatDoc.id, 
      message 
    });
  });

// Get chat messages
// @ts-ignore
export const getChatMessages = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { chatId, page = 1, limit = 50 } = req.query;
    //@ts-ignore
    const uid = req.user.uid;
    
    if (!chatId) {
      return res.status(400).send({ error: "Chat ID required", code: "MISSING_CHAT_ID" });
    }
    
    const messagesSnap = await db.collection("chats").doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .get();
    
    //@ts-ignore
    const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.status(200).send({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  });

// --- VERIFICATION SYSTEM ---

// Verify item
// @ts-ignore
export const verifyItem = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemId, verificationData } = req.body;
    //@ts-ignore
    const verifiedBy = req.user.uid;
    
    const verification = await verifyItem(itemId, {
      ...verificationData,
      verifiedBy
    });
    
    res.status(200).send(verification);
  });

// Verify user
// @ts-ignore
export const verifyUser = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { userId, verificationData } = req.body;
    //@ts-ignore
    const verifiedBy = req.user.uid;
    
    const verification = await verifyUser(userId, {
      ...verificationData,
      verifiedBy
    });
    
    res.status(200).send(verification);
  });
