#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Firebase Setup for Swapin');
console.log('============================\n');

console.log('📋 To get your Firebase configuration:');
console.log('1. Go to: https://console.firebase.google.com');
console.log('2. Select your project: swapin-b4770');
console.log('3. Click the gear icon (Project Settings)');
console.log('4. Scroll down to "Your apps" section');
console.log('5. If no web app exists, click "Add app" and select "Web"');
console.log('6. Copy the configuration object\n');

console.log('📝 Create a .env file in your project root with:');
console.log('===============================================');

const envTemplate = `# Firebase Configuration
# Replace these values with your actual Firebase configuration
REACT_APP_FIREBASE_API_KEY=your_actual_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=swapin-b4770.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=swapin-b4770
REACT_APP_FIREBASE_STORAGE_BUCKET=swapin-b4770.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id

# Example of what real values look like:
# REACT_APP_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
# REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890`;

console.log(envTemplate);
console.log('\n🔧 Next Steps:');
console.log('1. Create the .env file with your real Firebase values');
console.log('2. Restart your development server: npm start');
console.log('3. Go to Firebase Console → Authentication → Sign-in method');
console.log('4. Enable Google provider');
console.log('5. Add localhost to authorized domains');
console.log('6. Test Google login on the login page\n');

console.log('🐛 If you still have issues:');
console.log('- Check browser console for errors (F12)');
console.log('- Ensure popups are allowed for localhost');
console.log('- Verify Google Auth is enabled in Firebase Console');
console.log('- Check that your domain is authorized');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env file found!');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasPlaceholders = envContent.includes('your_actual_api_key_here') || 
                         envContent.includes('111111111111111111111');
  
  if (hasPlaceholders) {
    console.log('⚠️  .env file contains placeholder values. Please update with real Firebase credentials.');
  } else {
    console.log('✅ .env file appears to have real Firebase credentials.');
  }
} else {
  console.log('\n❌ .env file not found. Please create one with your Firebase configuration.');
}

console.log('\n🎯 Current Status:');
console.log('✅ Code implementation: Complete');
console.log('✅ Error handling: Complete');
console.log('❌ Firebase configuration: Needs real credentials');
console.log('❌ Google Auth setup: Needs to be enabled in Firebase Console'); 