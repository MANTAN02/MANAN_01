# 🔧 Google Login Troubleshooting Guide

## 🚨 **IMMEDIATE FIX NEEDED**

Your Google login is not working because you're using **placeholder Firebase credentials**. Here's how to fix it:

### **Step 1: Get Real Firebase Configuration**

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `swapin-b4770`
3. **Click Project Settings** (gear icon ⚙️)
4. **Scroll to "Your apps"** section
5. **Copy the configuration** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: "swapin-b4770.firebaseapp.com",
  projectId: "swapin-b4770",
  storageBucket: "swapin-b4770.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### **Step 2: Create .env File**

Create a file named `.env` in your project root with:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
REACT_APP_FIREBASE_AUTH_DOMAIN=swapin-b4770.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=swapin-b4770
REACT_APP_FIREBASE_STORAGE_BUCKET=swapin-b4770.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### **Step 3: Enable Google Authentication**

1. **In Firebase Console** → Authentication → Sign-in method
2. **Find "Google"** and click "Enable"
3. **Add your support email**
4. **Click "Save"**

### **Step 4: Authorize Domains**

1. **In Firebase Console** → Authentication → Settings
2. **Scroll to "Authorized domains"**
3. **Add**: `localhost`

### **Step 5: Test**

1. **Restart your development server**: `npm start`
2. **Go to login page**: http://localhost:3000/login
3. **Click "Continue with Google"**
4. **Should work!** 🎉

## 🐛 **Common Error Messages & Solutions**

### **"Firebase config has placeholder values"**
**Solution**: Replace placeholder values with real Firebase configuration

### **"Popup blocked by browser"**
**Solution**: 
- Allow popups for localhost
- Use HTTPS or localhost (not HTTP)
- Check browser settings

### **"Unauthorized domain"**
**Solution**: Add your domain to Firebase authorized domains

### **"Google Auth not enabled"**
**Solution**: Enable Google authentication in Firebase Console

### **"Network error"**
**Solution**: Check your internet connection

## 🔍 **Debug Steps**

1. **Click "Check Firebase Config"** button on login page
2. **Open browser console** (F12) and look for errors
3. **Check Network tab** for failed requests
4. **Verify Firebase Console** for login attempts

## 📞 **Still Not Working?**

1. **Check Firebase Status**: https://status.firebase.google.com
2. **Review Firebase Docs**: https://firebase.google.com/docs/auth/web/google-signin
3. **Verify your Firebase project** has billing enabled
4. **Check if you're using the correct Firebase project**

## 🎯 **Quick Test**

After setting up real Firebase credentials:

1. Open browser console (F12)
2. Go to login page
3. Click "Continue with Google"
4. Look for console messages:
   - ✅ "Attempting Google sign-in..."
   - ✅ "Google login successful: [user]"
   - ❌ Any error messages

## 🚀 **Production Deployment**

When deploying to production:

1. **Add your production domain** to Firebase authorized domains
2. **Set environment variables** in your hosting platform
3. **Remove localhost** from authorized domains if not needed
4. **Test on production domain**

---

**The code is 100% ready - you just need real Firebase credentials!** 🎉 