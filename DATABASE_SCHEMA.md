# Swapin Database Schema Documentation

## Overview
This document describes the complete Firestore database schema for the Swapin platform, including all collections, fields, data types, and relationships.

## Collections

### 1. Users Collection (`users/{userId}`)
**Description**: Stores user profiles and account information

**Fields**:
```typescript
{
  uid: string,                    // Firebase Auth UID
  displayName: string,            // User's display name
  email: string,                  // User's email address
  photoURL?: string,              // Profile picture URL
  phoneNumber?: string,           // Phone number
  address?: {                     // Address object
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  preferences: {                  // User preferences
    notifications: boolean,
    emailUpdates: boolean,
    privacySettings: object
  },
  fcmToken?: string,              // Firebase Cloud Messaging token
  rating: number,                 // Average rating (1-5)
  totalRatings: number,           // Total number of ratings received
  totalSwaps: number,             // Total successful swaps
  isVerified: boolean,            // Account verification status
  lastActive: Timestamp,          // Last activity timestamp
  createdAt: Timestamp,           // Account creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

**Subcollections**:
- `wishlist/{itemId}` - User's wishlist items
- `notifications/{notificationId}` - User notifications
- `cart/{itemId}` - Shopping cart items
- `deliveryLocations/{locationId}` - Saved delivery locations
- `favorites/{itemId}` - Favorite items
- `recentViews/{itemId}` - Recently viewed items

### 2. Items Collection (`items/{itemId}`)
**Description**: Stores all listed items for swapping

**Fields**:
```typescript
{
  ownerId: string,                // User ID of item owner
  title: string,                  // Item title
  description: string,            // Item description
  images: string[],               // Array of image URLs
  category: string,               // Item category
  price: number,                  // Item price (minimum ₹1000)
  condition: string,              // Item condition (new, like-new, good, fair)
  tags: string[],                 // Search tags
  location?: {                    // Item location
    city: string,
    state: string,
    coordinates?: {
      latitude: number,
      longitude: number
    }
  },
  status: string,                 // Item status (active, paused, swapped, sold)
  views: number,                  // View count
  likes: number,                  // Like count
  offers: number,                 // Offer count
  createdAt: Timestamp,           // Listing creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 3. Swaps Collection (`swaps/{swapId}`)
**Description**: Stores swap proposals and their status

**Fields**:
```typescript
{
  itemOfferedId: string,          // ID of offered item
  itemRequestedId: string,        // ID of requested item
  offeredByUserId: string,        // User proposing the swap
  requestedFromUserId: string,    // User receiving the swap request
  netAmount: number,              // Price difference (positive = receiver pays, negative = offerer pays)
  message?: string,               // Optional message with swap proposal
  status: string,                 // Swap status (pending, accepted, declined, completed, cancelled)
  acceptedAt?: Timestamp,         // Acceptance timestamp
  completedAt?: Timestamp,        // Completion timestamp
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 4. Ratings Collection (`ratings/{ratingId}`)
**Description**: Stores user ratings and reviews

**Fields**:
```typescript
{
  fromUserId: string,             // User giving the rating
  toUserId: string,               // User receiving the rating
  swapId: string,                 // Associated swap ID
  rating: number,                 // Rating (1-5)
  review?: string,                // Optional review text
  createdAt: Timestamp            // Rating creation timestamp
}
```

### 5. Notifications Collection (`users/{userId}/notifications/{notificationId}`)
**Description**: Stores user notifications

**Fields**:
```typescript
{
  type: string,                   // Notification type
  title: string,                  // Notification title
  message: string,                // Notification message
  itemId?: string,                // Associated item ID
  itemTitle?: string,             // Associated item title
  swapId?: string,                // Associated swap ID
  priority: string,               // Priority level (low, medium, high)
  isRead: boolean,                // Read status
  timestamp: Timestamp            // Notification timestamp
}
```

### 6. Deliveries Collection (`deliveries/{deliveryId}`)
**Description**: Stores delivery information for completed swaps

**Fields**:
```typescript
{
  swapId: string,                 // Associated swap ID
  itemId: string,                 // Item being delivered
  fromUserId: string,             // Sender user ID
  toUserId: string,               // Receiver user ID
  status: string,                 // Delivery status (pending, in-transit, delivered, failed)
  trackingNumber?: string,        // Delivery tracking number
  estimatedDelivery?: Timestamp,  // Estimated delivery date
  actualDelivery?: Timestamp,     // Actual delivery date
  deliveryAddress: {              // Delivery address
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 7. Payments Collection (`payments/{paymentId}`)
**Description**: Stores payment information for net amounts

**Fields**:
```typescript
{
  swapId: string,                 // Associated swap ID
  userId: string,                 // User making payment
  amount: number,                 // Payment amount
  paymentMethod: string,          // Payment method (UPI, card, netbanking)
  gatewayOrderId?: string,        // Payment gateway order ID
  status: string,                 // Payment status (pending, completed, failed, refunded)
  gatewayResponse?: object,       // Payment gateway response
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 8. Analytics Collection (`analytics/{analyticsId}`)
**Description**: Stores user behavior and platform analytics

**Fields**:
```typescript
{
  type: string,                   // Analytics type (item_view, swap_proposed, etc.)
  userId?: string,                // Associated user ID
  itemId?: string,                // Associated item ID
  swapId?: string,                // Associated swap ID
  metadata?: object,              // Additional analytics data
  timestamp: Timestamp            // Analytics timestamp
}
```

### 9. Disputes Collection (`disputes/{disputeId}`)
**Description**: Stores dispute reports and resolutions

**Fields**:
```typescript
{
  swapId: string,                 // Associated swap ID
  createdBy: string,              // User creating dispute
  reason: string,                 // Dispute reason
  description: string,            // Detailed description
  evidence: string[],             // Array of evidence URLs
  status: string,                 // Dispute status (open, under-review, resolved, closed)
  resolution?: string,            // Resolution details
  resolvedBy?: string,            // Support team member who resolved
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 10. Reports Collection (`reports/{reportId}`)
**Description**: Stores user and item reports

**Fields**:
```typescript
{
  reportedBy: string,             // User making the report
  reportedUserId?: string,        // Reported user ID
  reportedItemId?: string,        // Reported item ID
  reportType: string,             // Report type (user, item, spam, inappropriate)
  reason: string,                 // Report reason
  description: string,            // Detailed description
  evidence?: string[],            // Array of evidence URLs
  status: string,                 // Report status (pending, reviewed, actioned, dismissed)
  actionTaken?: string,           // Action taken by support
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 11. Chats Collection (`chats/{chatId}`)
**Description**: Stores chat metadata

**Fields**:
```typescript
{
  participants: {                 // Chat participants
    [userId]: {
      joinedAt: Timestamp,
      lastSeen: Timestamp
    }
  },
  swapId?: string,                // Associated swap ID
  lastMessage?: {                 // Last message info
    text: string,
    senderId: string,
    timestamp: Timestamp
  },
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 12. Chat Messages Collection (`chats/{chatId}/messages/{messageId}`)
**Description**: Stores individual chat messages

**Fields**:
```typescript
{
  senderId: string,               // Message sender ID
  receiverId: string,             // Message receiver ID
  text: string,                   // Message text
  messageType: string,            // Message type (text, image, file)
  attachments?: string[],         // Array of attachment URLs
  isRead: boolean,                // Read status
  createdAt: Timestamp            // Message timestamp
}
```

### 13. Categories Collection (`categories/{categoryId}`)
**Description**: Stores item categories

**Fields**:
```typescript
{
  name: string,                   // Category name
  description: string,            // Category description
  icon: string,                   // Category icon
  parentCategory?: string,        // Parent category ID
  isActive: boolean,              // Category status
  itemCount: number,              // Number of items in category
  createdAt: Timestamp,           // Creation timestamp
  updatedAt: Timestamp            // Last update timestamp
}
```

### 14. System Collection (`system/{settingId}`)
**Description**: Stores system-wide settings and configurations

**Fields**:
```typescript
{
  key: string,                    // Setting key
  value: any,                     // Setting value
  description: string,            // Setting description
  isPublic: boolean,              // Whether setting is public
  updatedBy: string,              // Last updated by
  updatedAt: Timestamp            // Last update timestamp
}
```

## Indexes

### Required Composite Indexes
```javascript
// Items collection
items: category + status + createdAt
items: ownerId + status + createdAt
items: price + status + createdAt

// Swaps collection
swaps: offeredByUserId + status + createdAt
swaps: requestedFromUserId + status + createdAt

// Ratings collection
ratings: toUserId + createdAt
ratings: fromUserId + toUserId + swapId

// Analytics collection
analytics: type + timestamp
analytics: userId + type + timestamp

// Notifications collection
notifications: isRead + timestamp
```

## Data Validation Rules

### Price Validation
- Minimum item price: ₹1000
- Price must be a positive number

### Rating Validation
- Rating must be between 1 and 5
- Rating must be a number

### Status Validation
- Item status: active, paused, swapped, sold
- Swap status: pending, accepted, declined, completed, cancelled
- Payment status: pending, completed, failed, refunded
- Dispute status: open, under-review, resolved, closed

### Required Fields
- User: uid, displayName, email
- Item: ownerId, title, price, category, status
- Swap: itemOfferedId, itemRequestedId, offeredByUserId, requestedFromUserId, status
- Rating: fromUserId, toUserId, rating

## Security Considerations

1. **Authentication Required**: All operations require valid Firebase Auth token
2. **Owner Validation**: Users can only modify their own data
3. **Data Integrity**: Critical operations use transactions
4. **Rate Limiting**: API endpoints implement rate limiting
5. **Input Validation**: All inputs are validated server-side
6. **Audit Trail**: All modifications are timestamped and tracked

## Performance Optimizations

1. **Indexing**: Strategic use of composite indexes for common queries
2. **Pagination**: All list operations support pagination
3. **Caching**: Frequently accessed data is cached
4. **Batch Operations**: Multiple operations are batched where possible
5. **Real-time Updates**: Critical data uses real-time listeners

## Backup and Recovery

1. **Automatic Backups**: Firestore provides automatic daily backups
2. **Point-in-time Recovery**: Support for point-in-time data recovery
3. **Export/Import**: Data can be exported and imported as needed
4. **Version Control**: Schema changes are version controlled 