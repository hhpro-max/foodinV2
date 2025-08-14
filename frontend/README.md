# Foodin Frontend - Food Delivery Application

A modern, responsive React frontend for the Foodin food delivery platform. This application provides a complete user interface for browsing products, managing cart, placing orders, and managing user profiles.

## Features

### 🛍️ **Shopping Experience**
- **Product Browsing**: Browse products with search, filtering, and categorization
- **Product Details**: Detailed product pages with image galleries and descriptions
- **Shopping Cart**: Add, remove, and manage cart items with real-time updates
- **Wishlist**: Save products to wishlist (UI ready, backend integration pending)

### 🔐 **Authentication**
- **OTP-based Login**: Secure phone number verification system
- **User Registration**: Automatic registration during first login
- **Protected Routes**: Secure access to user-specific features

### 📦 **Order Management**
- **Checkout Process**: Complete checkout with address selection
- **Order History**: View all past orders with status tracking
- **Order Details**: Detailed order information with delivery tracking
- **Order Status**: Real-time order status updates

### 👤 **User Profile**
- **Profile Management**: Update personal information
- **Address Management**: Add, edit, and manage delivery addresses
- **Account Settings**: Manage account preferences

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern Styling**: Clean, professional design with smooth animations
- **Loading States**: Skeleton loading for better user experience
- **Toast Notifications**: Real-time feedback for user actions

## Technology Stack

- **React 19.1.1**: Latest React with hooks and modern patterns
- **React Router 7.8.0**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Icons**: Beautiful icon library
- **React Hot Toast**: Toast notifications
- **React Phone Number Input**: Phone number input with validation
- **React Image Gallery**: Product image galleries
- **React Loading Skeleton**: Loading placeholders

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foodinV2/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update the API base URL in `src/services/api.js`:
   ```javascript
   const api = axios.create({
     baseURL: 'http://localhost:3000/api/v1', // Update this to match your backend
     // ...
   });
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application.

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.js      # Navigation bar
│   │   ├── Footer.js      # Footer component
│   │   ├── ProductCard.js # Product display card
│   │   ├── PrivateRoute.js # Route protection
│   │   └── ...
│   ├── contexts/          # React contexts for state management
│   │   ├── AuthContext.js # Authentication state
│   │   └── CartContext.js # Shopping cart state
│   ├── pages/             # Page components
│   │   ├── Home.js        # Home page with product grid
│   │   ├── Login.js       # Authentication page
│   │   ├── Cart.js        # Shopping cart page
│   │   ├── Checkout.js    # Order checkout page
│   │   ├── Orders.js      # Order history page
│   │   ├── Profile.js     # User profile page
│   │   └── ...
│   ├── services/          # API services
│   │   └── api.js         # API endpoints and configuration
│   ├── styles/            # CSS styles
│   │   └── main.css       # Main stylesheet
│   ├── utils/             # Utility functions
│   │   └── debounce.js    # Debounce utility
│   └── App.js             # Main application component
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login

### Products
- `GET /products` - Get products with filters
- `GET /products/:id` - Get product details
- `GET /categories` - Get product categories

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove item from cart
- `DELETE /cart/clear` - Clear cart

### Orders
- `POST /orders/create` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /addresses` - Get user addresses
- `POST /addresses` - Add new address
- `PUT /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address

## Key Features Implementation

### Authentication Flow
1. User enters phone number
2. OTP is sent to the phone
3. User enters OTP to verify
4. JWT token is stored and user is logged in
5. Protected routes become accessible

### Shopping Cart
- Real-time cart updates using React Context
- Persistent cart state across sessions
- Quantity management and item removal
- Cart summary with total calculation

### Product Browsing
- Search functionality with debouncing
- Category and tag filtering
- Pagination support
- Responsive product grid

### Order Management
- Complete checkout process
- Address selection and management
- Order status tracking
- Order history with details

## Styling

The application uses a custom CSS framework with:
- CSS Custom Properties for consistent theming
- Flexbox and Grid for responsive layouts
- Smooth transitions and hover effects
- Mobile-first responsive design
- Consistent spacing and typography

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
