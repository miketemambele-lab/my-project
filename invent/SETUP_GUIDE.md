# FPOP Inventory System - Quick Setup Guide

## Initial Setup Checklist

### 1. Firebase Configuration ✅
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Email/Password Authentication
- [ ] Enable Firestore Database (Production Mode)
- [ ] Update Firebase config in `js/firebase-config.js`

### 2. Create Initial Admin User ✅
```javascript
// Use Firebase Console to create first admin user manually:
// 1. Go to Authentication → Users
// 2. Add user with Email and Password
// 3. In Firestore, create "users" collection
// 4. Add document with id = uid and role = "admin"
```

### 3. Directory Structure Created ✅
```
css/
  └── style.css

js/
  ├── firebase-config.js
  ├── auth.js
  ├── admin-dashboard.js
  └── user-dashboard.js

HTML Files:
  ├── index.html
  ├── login.html
  ├── reset-password.html
  ├── privacy-policy.html
  ├── contact.html
  ├── admin-dashboard.html
  └── user-dashboard.html

Documentation:
  └── README.md
```

## Key Features Implemented

### Public Pages ✅
- [x] Professional homepage with features showcase
- [x] Privacy policy page
- [x] Contact page with inquiry form
- [x] Responsive navigation

### Authentication ✅
- [x] Smart login page with password toggle
- [x] Password reset functionality
- [x] Role-based dashboard routing
- [x] Session persistence

### Admin Features ✅
- [x] Dashboard with real-time statistics
- [x] User management (create, view, monitor)
- [x] Stock management (add, edit, delete medications)
- [x] Excel bulk upload support
- [x] Sales reporting
- [x] Online user tracking
- [x] Low stock alerts

### User Features ✅
- [x] Record sales transactions
- [x] View available inventory
- [x] Sales history tracking
- [x] Profile management
- [x] Real-time stock availability

### Design ✅
- [x] Modern glassmorphism UI
- [x] Transparent blur effects on cards
- [x] Gradient backgrounds
- [x] Responsive design
- [x] Smooth animations
- [x] Professional color scheme
- [x] Bootstrap 5 integration

## How to Use

### For First-Time Setup:

1. **Update Firebase Configuration**
   ```
   Open: js/firebase-config.js
   Replace the firebaseConfig object with your credentials
   ```

2. **Create First Admin User in Firebase**
   ```
   Firebase Console → Authentication
   Create user (e.g., admin@company.com)
   
   Firebase Console → Firestore
   Create collection: users
   Add document:
   {
     uid: (same as auth uid),
     email: admin@company.com,
     userName: Admin,
     role: admin,
     createdAt: (timestamp),
     lastLogin: null,
     isOnline: false,
     totalSales: 0
   }
   ```

3. **Open in Browser**
   ```
   Open index.html in web browser
   Or deploy to hosting service
   ```

### Managing the System:

**Admin Login:**
1. Navigate to login page
2. Enter admin credentials
3. Access admin dashboard with full control

**Creating New Users:**
1. Admin Dashboard → Manage Users tab
2. Fill in user details
3. System automatically sets their role

**Adding Medications:**
- Manual: Stock Management → Add New Medication
- Bulk: Upload Excel file with proper format

**Recording Sales (Users):**
1. User Dashboard → Sell Medication tab
2. Select medication
3. Enter quantity and date
4. Stock automatically updates

## Important Files

### Configuration Files
- `js/firebase-config.js` - Firebase setup (MUST update)
- `js/auth.js` - Authentication logic
- `css/style.css` - All styling

### Page Files
- `index.html` - Home/landing page
- `login.html` - Authentication page
- `admin-dashboard.html` - Admin's main interface
- `user-dashboard.html` - User's main interface

### Logic Files
- `js/admin-dashboard.js` - Admin functionality
- `js/user-dashboard.js` - User functionality

## Firestore Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /medications/{doc=**} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /sales/{doc=**} {
      allow read, create: if request.auth != null;
    }
  }
}
```

## Testing Checklist

- [ ] Login works with correct credentials
- [ ] Password reset email receives
- [ ] Admin can create users
- [ ] Admin can add medications
- [ ] User can record sales
- [ ] Stock updates after sale
- [ ] Excel upload works
- [ ] Online status updates
- [ ] Responsive on mobile
- [ ] All pages load correctly

## Deployment Options

### Firebase Hosting
```bash
firebase init
firebase deploy
```

### Netlify
1. Connect GitHub repo
2. Set build command: (none needed)
3. Deploy manually or auto

### Other Hosting
- Upload all files via FTP
- Ensure js/ directory is accessible
- Update Firebase rules if needed

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Firebase not loading | Check API key in firebase-config.js |
| Users not appearing | Verify Firestore "users" collection exists |
| Sales not saving | Check Firestore "sales" collection permissions |
| Excel upload fails | Verify XLSX library is loaded |
| Styles not applied | Check css/style.css is linked in HTML |

## Security Notes

1. Never commit Firebase config to public repo
2. Use environment variables for sensitive data
3. Set proper Firestore security rules
4. Enable HTTPS in production
5. Regularly audit user access logs
6. Keep dependencies updated

## Performance Tips

- Minimize Firestore reads/writes
- Cache medication data on client
- Use indexes for frequently queried fields
- Monitor database size
- Archive old sales records

## Future Customization

The system is designed to be easily customizable:
- Colors: Update CSS variables in `style.css`
- Fields: Add to Firestore schema and update JS
- Pages: Create new HTML files following the pattern
- Logic: Extend JS modules as needed

---

**Ready to start?**
1. Update Firebase config
2. Create first admin user
3. Open index.html
4. Login and start managing inventory!

For support: info@fpopcompany.com
