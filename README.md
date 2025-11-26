# Lebanese Market Backend API

Backend API for the Lebanese Market Online e-commerce platform built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/lebanese-market-backend.git
   cd lebanese-market-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/lebanese_market
   JWT_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-key-here
   PORT=5000
   FRONTEND_URL=http://localhost:8080
   NODE_ENV=development
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
lebanese-market-backend/
├── src/
│   ├── config/          # Configuration files (database, env)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── uploads/             # Uploaded files (images, etc.)
├── create_database.sql  # Database setup script
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PATCH /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)
- `POST /api/categories/:id/subcategories` - Create subcategory (admin only)
- `PATCH /api/categories/:categoryId/subcategories/:subcategoryId` - Update subcategory (admin only)
- `DELETE /api/categories/:categoryId/subcategories/:subcategoryId` - Delete subcategory (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/my-orders` - Get user's orders (authenticated)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (authenticated)
- `PATCH /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

### Cart
- `GET /api/cart` - Get cart items (authenticated)
- `POST /api/cart` - Add item to cart (authenticated)
- `PATCH /api/cart/:productId` - Update cart item (authenticated)
- `DELETE /api/cart/:productId` - Remove item from cart (authenticated)
- `DELETE /api/cart` - Clear cart (authenticated)

### Reviews
- `GET /api/reviews` - Get reviews (with filters)
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review (authenticated)
- `PATCH /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get current user profile (authenticated)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PATCH /api/users/profile` - Update profile (authenticated)
- `PATCH /api/users/profile/password` - Change password (authenticated)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Wishlist
- `GET /api/wishlist` - Get wishlist items (authenticated)
- `POST /api/wishlist` - Add to wishlist (authenticated)
- `DELETE /api/wishlist/:productId` - Remove from wishlist (authenticated)
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist (authenticated)

### Upload
- `POST /api/upload` - Upload image (authenticated)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 🌐 CORS Configuration

The backend is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration | No | 7d |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | No | 30d |
| `PORT` | Server port | No | 5000 |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:8080 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `EMAIL_HOST` | SMTP server host | No | - |
| `EMAIL_PORT` | SMTP server port | No | 587 |
| `EMAIL_USER` | SMTP username | No | - |
| `EMAIL_PASS` | SMTP password | No | - |
| `EMAIL_FROM` | Email sender address | No | - |

## 🗄️ Database

This project uses PostgreSQL with Prisma ORM. The database schema is defined in `prisma/schema.prisma`.

### Initial Setup

You can use the provided SQL script to create the database:
```bash
# Run the SQL script in your PostgreSQL client
psql -U postgres -f create_database.sql
```

### Running Migrations

```bash
npm run prisma:migrate
```

### Viewing Database

```bash
npm run prisma:studio
```

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer

## 📖 Documentation

Additional documentation files are included in this repository:
- `MIGRATION_GUIDE.md` - Database migration instructions (if included)
- `GOOGLE_OAUTH_IMPLEMENTATION.md` - OAuth implementation guide (if included)
- `REMAINING_APIS.md` - API implementation status (if included)

## 🔗 Related Repositories

- [Frontend Repository](https://github.com/yourusername/lebanese-market-frontend) - React frontend application

## 📄 License

ISC

