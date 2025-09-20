// Firestore security rules
// To be deployed to your Firebase project

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common functions for security rules
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Default deny all access
    match /{document=**} {
      allow read, write: if false;
    }
    
    // User profiles - users can read/write only their own data
    match /users/{userId} {
      allow read: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if false; // Prevent deletion, handled by backend
    }
    
    // User preferences - users can read/write only their own preferences
    match /userPreferences/{userId} {
      allow read: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if false; // Prevent deletion, handled by backend
    }
    
    // Video stats - users can read/write only their own video stats
    match /videoStats/{docId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow delete: if false; // Prevent deletion, handled by backend
    }
    
    // Watch sessions - users can read/write only their own sessions
    match /watchSessions/{sessionId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow delete: if false; // Prevent deletion, handled by backend
    }
  }
}
*/

// Explanation of the rules:
// 1. Default deny all access to prevent unauthorized access
// 2. Users can only read and write their own data
// 3. Each collection has specific rules based on the userId field
// 4. Delete operations are disabled to prevent accidental data loss
//    and should be handled by backend APIs with proper validation

// Note: These rules should be copied to your Firebase console
// Firebase > Firestore Database > Rules
