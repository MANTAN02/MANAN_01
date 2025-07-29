/**
 * Backend Integrations for Swapin Platform
 * Handles all third-party service integrations
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Payment Gateway Integrations
export class PaymentIntegrations {
  // Razorpay Integration
  static async createRazorpayOrder(amount: number, currency: string = 'INR', orderId: string) {
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64')}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency: currency,
          receipt: orderId,
          notes: {
            source: 'swapin'
          }
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw error;
    }
  }

  // Verify Razorpay Payment
  static async verifyRazorpayPayment(paymentId: string, orderId: string, signature: string) {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      if (expectedSignature === signature) {
        return { verified: true };
      } else {
        return { verified: false, error: 'Invalid signature' };
      }
    } catch (error) {
      console.error('Razorpay payment verification failed:', error);
      throw error;
    }
  }

  // Stripe Integration
  static async createStripePaymentIntent(amount: number, currency: string = 'inr') {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency,
        metadata: {
          source: 'swapin'
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw error;
    }
  }

  // UPI Integration
  static async generateUPILink(amount: number, upiId: string, orderId: string) {
    try {
      const upiUrl = `upi://pay?pa=${upiId}&pn=Swapin&am=${amount}&cu=INR&tn=Order-${orderId}`;
      
      return {
        upiUrl,
        qrCode: await this.generateQRCode(upiUrl),
        orderId
      };
    } catch (error) {
      console.error('UPI link generation failed:', error);
      throw error;
    }
  }

  // Generate QR Code
  static async generateQRCode(data: string) {
    try {
      const QRCode = require('qrcode');
      const qrCodeDataUrl = await QRCode.toDataURL(data);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  }
}

// Delivery Partner Integrations
export class DeliveryIntegrations {
  // Borzo Integration
  static async createBorzoDelivery(deliveryData: any) {
    try {
      const response = await fetch('https://api.borzo.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BORZO_API_KEY}`
        },
        body: JSON.stringify({
          pickup_address: deliveryData.fromAddress,
          delivery_address: deliveryData.toAddress,
          package_details: deliveryData.packageDetails,
          special_instructions: deliveryData.specialInstructions,
          payment_method: 'cash_on_delivery'
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Borzo delivery creation failed:', error);
      throw error;
    }
  }

  // Track Borzo Delivery
  static async trackBorzoDelivery(trackingNumber: string) {
    try {
      const response = await fetch(`https://api.borzo.com/v1/orders/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${process.env.BORZO_API_KEY}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Borzo delivery tracking failed:', error);
      throw error;
    }
  }

  // Dunzo Integration
  static async createDunzoDelivery(deliveryData: any) {
    try {
      const response = await fetch('https://api.dunzo.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DUNZO_API_KEY}`
        },
        body: JSON.stringify({
          pickup_address: deliveryData.fromAddress,
          delivery_address: deliveryData.toAddress,
          package_details: deliveryData.packageDetails,
          special_instructions: deliveryData.specialInstructions
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Dunzo delivery creation failed:', error);
      throw error;
    }
  }

  // Calculate delivery cost
  static async calculateDeliveryCost(fromLocation: any, toLocation: any, packageDetails: any) {
    try {
      const distance = this.calculateDistance(fromLocation, toLocation);
      const baseCost = 50; // Base delivery cost
      const perKmCost = 10; // Cost per kilometer
      const weightMultiplier = Math.max(1, packageDetails.weight / 5); // Weight factor

      const totalCost = baseCost + (distance * perKmCost * weightMultiplier);
      
      return {
        cost: Math.round(totalCost),
        distance: Math.round(distance),
        estimatedTime: Math.round(distance * 0.1) + 2, // hours
        breakdown: {
          baseCost,
          distanceCost: distance * perKmCost,
          weightMultiplier,
          totalCost
        }
      };
    } catch (error) {
      console.error('Delivery cost calculation failed:', error);
      throw error;
    }
  }

  // Calculate distance between two points
  static calculateDistance(point1: any, point2: any) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLon = this.deg2rad(point2.lng - point1.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }
}

// Email Service Integration
export class EmailIntegrations {
  // SendGrid Integration
  static async sendEmailViaSendGrid(emailData: any) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: emailData.to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: emailData.subject,
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.templateData
      };

      const response = await sgMail.send(msg);
      return response;
    } catch (error) {
      console.error('SendGrid email sending failed:', error);
      throw error;
    }
  }

  // Email Templates
  static getEmailTemplates() {
    return {
      swap_proposed: {
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
        subject: 'New Swap Offer on Swapin'
      },
      swap_accepted: {
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
        subject: 'Your Swap Offer was Accepted!'
      },
      payment_received: {
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
        subject: 'Payment Received for Your Swap'
      },
      verification_approved: {
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
        subject: 'Your Verification was Approved'
      },
      welcome: {
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
        subject: 'Welcome to Swapin!'
      }
    };
  }
}

// SMS Service Integration
export class SMSIntegrations {
  // Twilio Integration
  static async sendSMSViaTwilio(phoneNumber: string, message: string) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return response;
    } catch (error) {
      console.error('Twilio SMS sending failed:', error);
      throw error;
    }
  }

  // SMS Templates
  static getSMSTemplates() {
    return {
      swap_proposed: 'New swap offer received! Check your Swapin app for details.',
      swap_accepted: 'Your swap offer was accepted! Proceed with delivery.',
      payment_received: 'Payment of {amount} received for your swap.',
      otp: 'Your Swapin OTP is {otp}. Valid for 10 minutes.',
      delivery_update: 'Your delivery status: {status}. Track at swapin.com'
    };
  }
}

// Google Maps Integration
export class MapsIntegrations {
  // Geocode address
  static async geocodeAddress(address: string) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: data.results[0].formatted_address
        };
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw error;
    }
  }

  // Calculate route
  static async calculateRoute(origin: any, destination: any) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].legs[0];
        return {
          distance: route.distance.text,
          duration: route.duration.text,
          polyline: data.routes[0].overview_polyline.points
        };
      } else {
        throw new Error('Route not found');
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw error;
    }
  }
}

// Image Processing Integration
export class ImageIntegrations {
  // Upload to Firebase Storage
  static async uploadToFirebaseStorage(file: Buffer, path: string, metadata: any = {}) {
    try {
      const bucket = admin.storage().bucket();
      const fileUpload = bucket.file(path);
      
      await fileUpload.save(file, {
        metadata: {
          contentType: metadata.contentType || 'image/jpeg',
          ...metadata
        }
      });

      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });

      return url;
    } catch (error) {
      console.error('Firebase Storage upload failed:', error);
      throw error;
    }
  }

  // Process image (resize, compress)
  static async processImage(imageBuffer: Buffer, options: any = {}) {
    try {
      const sharp = require('sharp');
      
      let processedImage = sharp(imageBuffer);
      
      if (options.resize) {
        processedImage = processedImage.resize(options.resize.width, options.resize.height);
      }
      
      if (options.quality) {
        processedImage = processedImage.jpeg({ quality: options.quality });
      }
      
      return await processedImage.toBuffer();
    } catch (error) {
      console.error('Image processing failed:', error);
      throw error;
    }
  }
}

// Analytics Integration
export class AnalyticsIntegrations {
  // Google Analytics
  static async trackEvent(eventName: string, eventData: any) {
    try {
      const { BetaAnalyticsDataClient } = require('@google-analytics/data');
      const analyticsDataClient = new BetaAnalyticsDataClient();

      const [response] = await analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: 'today',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'eventCount',
          },
        ],
        dimensions: [
          {
            name: 'eventName',
          },
        ],
      });

      return response;
    } catch (error) {
      console.error('Google Analytics tracking failed:', error);
      // Don't throw error for analytics failures
    }
  }

  // Custom Analytics
  static async trackCustomEvent(eventType: string, eventData: any) {
    try {
      const db = admin.firestore();
      await db.collection('analytics').add({
        type: eventType,
        data: eventData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId: eventData.userId || null
      });
    } catch (error) {
      console.error('Custom analytics tracking failed:', error);
    }
  }
}

// Security Integrations
export class SecurityIntegrations {
  // Rate limiting
  static async checkRateLimit(userId: string, action: string, limit: number, window: number) {
    try {
      const db = admin.firestore();
      const now = Date.now();
      const windowStart = now - window;

      const rateLimitRef = db.collection('rateLimits').doc(`${userId}_${action}`);
      const doc = await rateLimitRef.get();

      if (doc.exists) {
        const data = doc.data();
        if (data) {
          const requests = data.requests.filter((timestamp: number) => timestamp > windowStart);
        
          if (requests.length >= limit) {
            return { allowed: false, remaining: 0, resetTime: windowStart + window };
          }

          requests.push(now);
          await rateLimitRef.update({ requests, lastUpdated: now });
          
          return { allowed: true, remaining: limit - requests.length, resetTime: windowStart + window };
        }
      } else {
        await rateLimitRef.set({
          requests: [now],
          lastUpdated: now
        });
        
        return { allowed: true, remaining: limit - 1, resetTime: windowStart + window };
      }
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true, remaining: 1, resetTime: Date.now() };
    }
  }

  // Content moderation
  static async moderateContent(content: string, type: 'text' | 'image' | 'video') {
    try {
      // This would integrate with content moderation services
      // For now, return basic validation
      const profanityWords = ['bad', 'word', 'list']; // Simplified
      const hasProfanity = profanityWords.some(word => 
        content.toLowerCase().includes(word)
      );

      return {
        isAppropriate: !hasProfanity,
        confidence: hasProfanity ? 0.9 : 0.8,
        flags: hasProfanity ? ['profanity'] : []
      };
    } catch (error) {
      console.error('Content moderation failed:', error);
      return { isAppropriate: true, confidence: 0.5, flags: [] };
    }
  }
}

// Export all integrations
export const Integrations = {
  Payment: PaymentIntegrations,
  Delivery: DeliveryIntegrations,
  Email: EmailIntegrations,
  SMS: SMSIntegrations,
  Maps: MapsIntegrations,
  Image: ImageIntegrations,
  Analytics: AnalyticsIntegrations,
  Security: SecurityIntegrations
}; 