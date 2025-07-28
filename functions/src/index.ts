/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Middleware to check Firebase Auth token
// @ts-ignore
async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send("Unauthorized");
    return;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send("Invalid token");
  }
}

setGlobalOptions({ maxInstances: 10 });

// Helper to wrap handlers with try/catch and consistent error response
function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error', details: error.message });
    }
  };
}

// --- USERS ---
// Create or update user profile
// @ts-ignore
export const createUserProfile = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { uid, displayName, email, photoURL } = req.user;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({ uid, displayName, email, photoURL, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      await userRef.update({ displayName, email, photoURL });
    }
    res.status(200).send({ success: true });
  }));

// Get user profile
// @ts-ignore
export const getUserProfile = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).send({ error: "User not found" });
    res.status(200).send(userDoc.data());
  }));

// --- ITEMS ---
// List an item
// @ts-ignore
export const listItem = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { title, description, images, category, price, condition } = req.body;
    //@ts-ignore
    const ownerId = req.user.uid;
    if (!title || !price || price < 1000) return res.status(400).send({ error: "Invalid item" });
    const item = {
      ownerId, title, description, images, category, price, condition, status: "active", createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection("items").add(item);
    res.status(200).send({ id: ref.id, ...item });
  }));

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

// Search items by keyword and/or category
// @ts-ignore
export const searchItems = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { q, category } = req.query;
    let query = db.collection("items").where("status", "==", "active");
    if (category) {
      //@ts-ignore
      query = query.where("category", "==", category);
    }
    const itemsSnap = await query.get();
    //@ts-ignore
    let items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        (item.category && item.category.toLowerCase().includes(qLower))
      );
    }
    res.status(200).send(items);
  }));

// --- SWAPS ---
// Propose a swap
// @ts-ignore
export const proposeSwap = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const { itemOfferedId, itemRequestedId } = req.body;
    //@ts-ignore
    const offeredByUserId = req.user.uid;
    if (!itemOfferedId || !itemRequestedId) return res.status(400).send({ error: "Missing item IDs" });
    const itemOffered = (await db.collection("items").doc(itemOfferedId).get()).data();
    const itemRequested = (await db.collection("items").doc(itemRequestedId).get()).data();
    if (!itemOffered || !itemRequested) return res.status(404).send({ error: "Item not found" });
    const netAmount = itemRequested.price - itemOffered.price;
    const swap = {
      itemOfferedId, itemRequestedId, offeredByUserId, requestedFromUserId: itemRequested.ownerId,
      netAmount, status: "pending", createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection("swaps").add(swap);
    res.status(200).send({ id: ref.id, ...swap });
  }));

// Accept a swap
// @ts-ignore
export const acceptSwap = functions.https.onRequest(withErrorHandling(async (req, res) => {
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
    await swapRef.update({ status: "accepted", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
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

// Get notifications
// @ts-ignore
export const getNotifications = functions.https.onRequest(withErrorHandling(async (req, res) => {
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  await checkAuth(req, res, async () => {
    //@ts-ignore
    const uid = req.user.uid;
    const snap = await db.collection("users").doc(uid).collection("notifications").orderBy("timestamp", "desc").get();
    // @ts-ignore
    const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(notifications);
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
