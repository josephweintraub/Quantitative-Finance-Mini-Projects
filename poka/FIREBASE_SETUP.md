# 🔥 Firebase Setup Guide for Poka Waitlist

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `poka-waitlist` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Choose your Google Analytics account

## Step 2: Set up Firestore Database

1. In your Firebase project, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security later)
4. Select a location (choose closest to your users)

## Step 3: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Go to "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with nickname: "Poka Landing Page"
6. Copy the `firebaseConfig` object

## Step 4: Update Your Website

Replace the Firebase configuration in `index.html`:

```javascript
// Replace this placeholder config:
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// With your actual config from Firebase Console:
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your real API key
  authDomain: "poka-waitlist.firebaseapp.com",
  projectId: "poka-waitlist",
  storageBucket: "poka-waitlist.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

## Step 5: Configure Firestore Security Rules

In Firebase Console > Firestore Database > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to waitlist collection
    match /waitlist/{document} {
      allow read, write: if true; // For now - secure this later
    }
  }
}
```

## Step 6: Test Your Setup

1. Open your website at `http://localhost:8000`
2. Fill out the email form and submit
3. Check Firebase Console > Firestore Database
4. You should see a new document in the "waitlist" collection

## 📊 Your Email Data Structure

Each email signup creates a document with:

```json
{
  "email": "user@example.com",
  "type": "player" | "host",
  "timestamp": "2024-01-01T12:00:00Z",
  "source": "landing-page",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com" | "direct"
}
```

## 🔒 Security Recommendations (Before Launch)

1. **Update Firestore Rules** to prevent unauthorized access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waitlist/{document} {
      allow create: if request.auth == null; // Allow anonymous writes
      allow read, update, delete: if false; // Deny reads/updates
    }
  }
}
```

2. **Enable App Check** for additional security
3. **Set up Authentication** if you want admin access

## 📈 Viewing Your Waitlist Data

### Option 1: Firebase Console

- Go to Firestore Database in Firebase Console
- Browse the "waitlist" collection

### Option 2: Export to CSV (Future Feature)

- We can add an admin panel to export emails
- Or set up automated exports to Google Sheets

## 🚀 Next Steps

- [ ] Replace placeholder Firebase config
- [ ] Test email submissions
- [ ] Secure Firestore rules
- [ ] Set up email notifications for new signups
- [ ] Create admin dashboard to view signups
- [ ] Integrate with email marketing tools (Mailchimp, ConvertKit, etc.)

## 💡 Pro Tips

- **Free Tier**: Firebase includes 50,000 reads and 20,000 writes per day
- **Analytics**: The code tracks signup events for Google Analytics
- **Validation**: Enhanced email validation prevents common typos
- **Real-time**: Stats numbers update immediately after signup
- **Backup**: Consider setting up automated backups

## 🆘 Troubleshooting

**"Firebase not configured" warning?**

- Check that you've replaced the placeholder config
- Ensure your domain is added to Firebase authorized domains

**Emails not saving?**

- Check browser console for errors
- Verify Firestore rules allow writes
- Make sure you published the rules in Firebase Console

**CORS errors?**

- Add your domain to Firebase authorized domains
- Use `http://localhost:8000` for local testing

---

Need help? Check the browser console for detailed error messages!
