# NOVA — Administrative Platform

A role-based admin and communication platform built with Firebase.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Login page + auth router |
| `owner.html` | Owner dashboard (full access) |
| `dev.html` | Developer dashboard |
| `staff.html` | Staff dashboard (restricted) |
| `nova-shared.css` | Shared design system |

---

## Setup

### 1. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** (start in test mode for initial setup)

### 2. Add Your Firebase Config

In **each** of the 4 HTML files, replace the placeholder config block:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Find your config at: Firebase Console → Project Settings → Your Apps → Web App.

### 3. Seed Firestore

Create the required initial documents:

**`settings/global`** (document):
```json
{
  "maintenance": false,
  "maintenanceMessage": "System under maintenance.",
  "emergency": false,
  "emergencyMessage": "Emergency shutdown active.",
  "debug": false
}
```

**`users/{uid}`** — for each user you create via Firebase Auth:
```json
{
  "email": "owner@example.com",
  "role": "Owner",
  "warningsCount": 0,
  "banned": false
}
```

**Roles:** `User`, `Staff`, `Developer`, `Owner`

**`channels/devalerts`** (document, for dev alerts):
```json
{
  "name": "devalerts",
  "private": true,
  "createdAt": 0
}
```

### 4. Firestore Security Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own profile
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if false; // managed by server/owner
    }
    // Only authenticated users can read settings
    match /settings/{doc} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    // Tickets: authenticated users
    match /tickets/{id} {
      allow read, write: if request.auth != null;
    }
    // Logs: authenticated users
    match /logs/{id} {
      allow read, write: if request.auth != null;
    }
    // Channels
    match /channels/{channelId} {
      allow read, write: if request.auth != null;
      match /messages/{msgId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

### 5. Host the Files

Serve all files from the same directory. Options:
- **Firebase Hosting**: `firebase deploy`
- **Local dev**: Any static file server (e.g. `npx serve .`)
- **Netlify / Vercel**: Drop the folder in

---

## Architecture

```
index.html  ──auth──▶  Firestore users/{uid}.role
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         owner.html        dev.html        staff.html
```

### Role Permissions Summary

| Feature | Owner | Developer | Staff |
|---------|-------|-----------|-------|
| Overview | ✓ | ✓ | — |
| Tickets (view/edit) | ✓ | ✓ | ✓ |
| Ticket delete | ✓ | — | — |
| Ticket assignment | ✓ | ✓ | — |
| Ticket escalation | ✓ | ✓ to Owner | ✓ to Dev |
| Users (full mod) | ✓ | — | — |
| Users (warn/mute) | ✓ | — | ✓ |
| Ban users | ✓ | — | — |
| Change roles | ✓ | — | — |
| Channels (CRUD) | ✓ | — | — |
| Settings | ✓ | — | — |
| Logs | ✓ | ✓ | — |
| Dev Alerts | ✓ | ✓ | — |
| Debug HUD | ✓ | ✓ | — |
| Maintenance toggle | ✓ | — | — |
| Emergency toggle | ✓ | — | — |
