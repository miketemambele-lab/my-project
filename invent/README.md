# FPOP Inventory Management System

A modern, feature-rich inventory management system specifically designed for homemade medicines and herbal product distribution. Built with Firebase, Bootstrap 5, and vanilla JavaScript.

## 🎯 Features

### Public Pages
- **Index/Home Page**: Professional homepage with feature showcase, about section, and call-to-action
- **Privacy Policy**: Comprehensive privacy information
- **Contact Page**: Contact form for inquiries and custom solution requests

### Authentication
- **Smart Login Page**: Professional login interface with password visibility toggle
- **Password Reset**: Secure password reset via email
- **Role-Based Access**: Automatic routing to Admin or User dashboard

### Admin Dashboard
- **Full System Access**: Complete control over the inventory system
- **Dashboard Overview**: Real-time statistics (total users, online users, medications, low stock items)
- **User Management**: 
  - Create new users
  - View all users and their online status
  - Track user sales and activity
- **Stock Management**:
  - Add individual medications
  - Bulk upload from Excel files
  - Real-time inventory tracking
  - Low stock alerts with color-coded status indicators
  - Update stock quantities
  - Delete medications
- **Sales Reports**:
  - View sales by medication
  - Detailed sale history
  - Track total revenue
  - User performance metrics
- **Online User Monitoring**: Real-time display of currently online users

### User Dashboard
- **Sales Management**:
  - Record medication sales
  - Select from available medications
  - Automatic calculation of total amounts
  - Track sales history
- **Inventory View**: Browse all available medications with details
- **Sales Statistics**: Total sales count and revenue earned
- **Profile Management**: View user information

### Design Features
- **Modern UI**: Bootstrap 5 framework with professional styling
- **Transparent Blur Effects**: Creative cards and tables with glassmorphism design
- **Gradient Backgrounds**: Dynamic gradient backgrounds throughout
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Animations**: Smooth transitions and hover effects
- **Dark Theme**: Eye-friendly dark interface with color accents

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5.3
- **Icons**: Font Awesome 6.4
- **Backend**: Firebase Realtime Database & Authentication
- **File Upload**: XLSX library for Excel file handling
- **Hosting**: Can be deployed to Firebase Hosting, Netlify, or any static hosting

## 📋 Project Structure

```
fpop-inventory/
├── index.html                 # Home page
├── login.html                 # Login page
├── reset-password.html        # Password reset page
├── privacy-policy.html        # Privacy policy page
├── contact.html               # Contact page
├── admin-dashboard.html       # Admin dashboard
├── user-dashboard.html        # User dashboard
├── css/
│   └── style.css             # All custom styles
├── js/
│   ├── firebase-config.js    # Firebase configuration
│   ├── auth.js               # Authentication utilities
│   ├── admin-dashboard.js    # Admin dashboard logic
│   └── user-dashboard.js     # User dashboard logic
└── assets/                    # Images and resources (if needed)
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project with Firestore and Authentication enabled
- Excel files for bulk upload (optional)

### Installation

1. **Clone or download the project**
   ```bash
   cd fpop-inventory
   ```

2. **Update Firebase Configuration**
   - Open `js/firebase-config.js`
   - Replace the Firebase configuration with your own:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

3. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing one
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Set up the following Firestore collections:
     - `users` - Stores user information
     - `medications` - Stores medication inventory
     - `sales` - Stores sales transactions

4. **Deploy**
   - Option A: Upload files to Firebase Hosting
   - Option B: Upload to any web hosting service
   - Option C: Open `index.html` locally in browser (for testing)

## 📱 User Roles

### Admin
- Full system access
- Create and manage users
- Add and manage medications
- View all sales reports
- Monitor online users
- Bulk upload medications via Excel

### User
- Record sales
- View available inventory
- Check personal sales history
- View profile

## 🔒 Security Features

- Firebase Authentication for secure user verification
- Role-based access control
- Password reset functionality
- HTTPS encryption (on production)
- Local persistence of session data

## 📊 Firestore Database Schema

### Users Collection
```json
{
  "uid": "user_id",
  "email": "user@email.com",
  "userName": "John Doe",
  "role": "admin|user",
  "createdAt": "timestamp",
  "lastLogin": "timestamp",
  "isOnline": true|false,
  "totalSales": 0
}
```

### Medications Collection
```json
{
  "name": "Medication Name",
  "dosage": "500mg",
  "quantity": 100,
  "minQuantity": 10,
  "price": 10.99,
  "description": "Description",
  "createdAt": "timestamp",
  "createdBy": "admin_user_id"
}
```

### Sales Collection
```json
{
  "userId": "user_id",
  "userName": "John Doe",
  "medicationId": "medication_id",
  "medicationName": "Medication Name",
  "quantity": 5,
  "pricePerUnit": 10.99,
  "totalAmount": 54.95,
  "saleDate": "timestamp",
  "createdAt": "timestamp"
}
```

### Contact Inquiries Collection
```json
{
  "name": "Customer Name",
  "email": "customer@email.com",
  "company": "Company Name",
  "subject": "Custom Solution Inquiry",
  "message": "Detailed inquiry message",
  "submittedAt": "timestamp",
  "status": "new|in-progress|completed"
}
```

## 🎨 Color Scheme

- **Primary Gradient**: #667eea to #764ba2 (Purple to Pink)
- **Success**: #2ecc71 (Green)
- **Danger**: #e74c3c (Red)
- **Warning**: #f39c12 (Orange)
- **Info**: #3498db (Blue)
- **Background**: Light semi-transparent whites with blur effects

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## ⚙️ Configuration

### Add a New Admin User
1. Log in with the first admin account
2. Go to "Manage Users" tab
3. Create a new user and assign "Admin" role

### Excel Upload Format
For bulk medication upload, prepare Excel file with columns:
```
Name | Dosage | Quantity | MinQuantity | Price | Description
```

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `js/firebase-config.js`
- Check Firebase project settings
- Ensure Firestore database is in production mode

### Login Not Working
- Verify user exists in Firebase Authentication
- Check browser console for error messages
- Clear browser cache and cookies

### Data Not Loading
- Check browser console for errors
- Verify Firestore rules allow read/write access
- Check internet connection

## 📞 Support & Custom Solutions

For custom solutions or modifications, contact FPOP Company Limited:
- **Email**: info@fpopcompany.com
- **Website**: Contact page in the application

## 📄 License

This system is proprietary to FPOP Company Limited. Use only as licensed.

## 🔄 Future Enhancements

- Advanced analytics and reporting
- Mobile app version
- Inventory forecasting
- Customer management system
- Multi-location support
- SMS notifications
- Barcode scanning
- Payment integration

## 🙏 Acknowledgments

- Bootstrap 5 Team
- Firebase Team
- Font Awesome Icons

---

**FPOP Company Limited** - Innovative Inventory Management Solutions

Last Updated: 2026
