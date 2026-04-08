# PromoDZ Backend API Documentation

> **Complete Technical Specification for Backend Development**
> 
> This document provides everything a backend developer needs to build a fully functional API that integrates seamlessly with the PromoDZ frontend application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack Requirements](#2-technology-stack-requirements)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Authentication System](#4-authentication-system)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Real-Time Features (WebSocket)](#7-real-time-features-websocket)
8. [Analytics & Tracking System](#8-analytics--tracking-system)
9. [Recommendation Engine](#9-recommendation-engine)
10. [File Upload System](#10-file-upload-system)
11. [Email Notification System](#11-email-notification-system)
12. [Search & Filtering](#12-search--filtering)
13. [Business Rules & Validation](#13-business-rules--validation)
14. [Error Handling](#14-error-handling)
15. [Security Considerations](#15-security-considerations)

---

## 1. Project Overview

### 1.1 What is PromoDZ?

PromoDZ is an Algerian promotional deals platform that connects businesses with consumers. Companies can showcase their promotions/deals, and users can discover, like, and follow their favorite brands.

### 1.2 Core Features

- **Public Promotion Discovery**: Browse, search, and filter promotional deals
- **User Accounts**: Register, manage favorites, follow companies
- **Company Dashboards**: Manage promotions, view analytics, subscription management
- **Admin Panel**: Full platform management, user management, content moderation
- **Moderator System**: Delegated company management with granular permissions
- **Real-Time Analytics**: Live tracking of views, clicks, and engagement
- **Personalized Recommendations**: AI-driven promotion suggestions based on user behavior

### 1.3 Frontend Configuration

The frontend expects the API at:
```
Base URL: http://localhost:8000/api
```

All API responses should use JSON format with proper HTTP status codes.

---

## 2. Technology Stack Requirements

### 2.1 Recommended Stack

| Component | Recommendation | Notes |
|-----------|---------------|-------|
| Runtime | Node.js 20+ | LTS version recommended |
| Framework | Express.js 4.x | REST API framework |
| Database | PostgreSQL 15+ | Relational data with complex queries |
| ORM | Prisma or Sequelize | Database abstraction layer |
| Real-Time | Socket.io | For live analytics via WebSocket |
| Search | PostgreSQL Full-Text Search or Elasticsearch | Fuzzy matching required |
| File Storage | Local Filesystem + Multer | File upload handling |
| Email | Nodemailer + SendGrid/Mailgun | Transactional emails |
| Cache | Redis + ioredis | Session storage, real-time data |
| Auth | jsonwebtoken (JWT) or express-session | Authentication |

### 2.2 Required NPM Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "prisma": "^5.10.0",
    "@prisma/client": "^5.10.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "socket.io": "^4.7.4",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2",
    "nodemailer": "^6.9.9",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "ioredis": "^5.3.2",
    "dotenv": "^16.4.1",
    "node-cron": "^3.0.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

### 2.3 Project Structure

```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express app setup
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection
│   │   ├── redis.js          # Redis connection
│   │   └── email.js          # Email configuration
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── roles.js          # Role-based access control
│   │   ├── validate.js       # Request validation
│   │   └── upload.js         # File upload handling
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── company.routes.js
│   │   ├── promotion.routes.js
│   │   ├── admin.routes.js
│   │   ├── moderator.routes.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── ...
│   ├── services/
│   │   ├── email.service.js
│   │   ├── recommendation.service.js
│   │   └── analytics.service.js
│   ├── socket/
│   │   └── analytics.socket.js
│   └── utils/
│       ├── validators.js
│       └── helpers.js
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/
│   └── seed.js               # Seed data
├── uploads/                   # Local file storage
├── .env
├── package.json
└── README.md
```

---

## 3. User Roles & Permissions

### 3.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPERADMIN (3 only)                    │
│  - Full system access                                       │
│  - Create/manage Moderators                                 │
│  - Create/manage Companies                                  │
│  - Manage all site content                                  │
│  - Access deleted users                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        MODERATOR                            │
│  - Manage ONLY assigned companies                           │
│  - Per-company permissions (canAdd, canEdit, canDelete)     │
│  - View analytics for assigned companies                    │
│  - NO access to: Deleted Users, Site Management             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         COMPANY                             │
│  - Manage own promotions (based on subscription)            │
│  - View own analytics                                       │
│  - Manage company profile                                   │
│  - Read-only when paused/expired                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                           USER                              │
│  - Browse all active promotions                             │
│  - Like promotions                                          │
│  - Follow companies                                         │
│  - Manage profile & preferences                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          GUEST                              │
│  - Browse active promotions (read-only)                     │
│  - Search & filter                                          │
│  - View company pages                                       │
│  - Contact form                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Permission Matrix

| Action | Guest | User | Company | Moderator | Superadmin |
|--------|-------|------|---------|-----------|------------|
| View active promotions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search promotions | ❌ | ✅ | ✅ | ✅ | ✅ |
| Like promotions | ❌ | ✅ | ❌ | ❌ | ❌ |
| Follow companies | ❌ | ✅ | ❌ | ❌ | ❌ |
| View own favorites | ❌ | ✅ | ❌ | ❌ | ❌ |
| Add promotions | ❌ | ❌ | ✅* | ✅** | ✅ |
| Edit promotions | ❌ | ❌ | ✅* | ✅** | ✅ |
| Delete promotions | ❌ | ❌ | ✅* | ✅** | ✅ |
| View company analytics | ❌ | ❌ | ✅ (own) | ✅ (assigned) | ✅ (all) |
| Manage company profile | ❌ | ❌ | ✅ | ✅** | ✅ |
| Create companies | ❌ | ❌ | ❌ | ✅*** | ✅ |
| Edit companies subscription time | ❌ | ❌ | ❌ | ✅*** | ✅ |
| Create moderators | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage site content | ❌ | ❌ | ❌ | ❌ | ✅ |
| View deleted users | ❌ | ❌ | ❌ | ❌ | ✅ |

> `*` = Subject to subscription status and pause state
> `**` = Subject to per-company permission assignment (canAdd, canEdit, canDelete)
> `***` = Subject to moderator-level permission (canAddCompany, canEditTimeCompany)

### 3.3 Superadmin Constraints

- **EXACTLY 3 Superadmins** exist in the system
- Superadmins are pre-seeded in the database
- No API endpoint to create new Superadmins
- Superadmins cannot be deleted

---

## 4. Authentication System

### 4.1 Authentication Method

Implement **EITHER** JWT tokens **OR** Session-based authentication:

#### Option A: JWT Authentication (Recommended)

```
POST /api/auth/login/
Request:
{
  "username": "string",
  "password": "string"
}

Response (200 OK):
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "emailVerified": true
  }
}
```

#### Option B: Session-based Authentication

```
POST /api/auth/login/
Request:
{
  "username": "string",
  "password": "string"
}

Response (200 OK):
Set-Cookie: sessionid=abc123...
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "emailVerified": true
  }
}
```

### 4.2 Email Verification Flow

**CRITICAL**: Users MUST verify their email before they can log in.

#### Registration Flow:

```
Step 1: POST /api/auth/register/
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "city": "Algiers",
  "postalCode": "16000"
}

Response (201 Created):
{
  "message": "Registration successful. Please check your email for verification code.",
  "userId": 123,
  "email": "john@example.com"
}

→ System sends 6-digit verification code to email

Step 2: POST /api/auth/verify-email/
Request:
{
  "email": "john@example.com",
  "code": "123456"
}

Response (200 OK):
{
  "message": "Email verified successfully",
  "verified": true
}

Step 3: POST /api/auth/complete-registration/
Request:
{
  "userId": 123,
  "interests": ["Electronics & Gadgets", "Fashion & Apparel"]
}

Response (200 OK):
{
  "message": "Registration complete. You can now log in.",
  "user": { ... }
}
```

### 4.3 Password Reset Flow

```
Step 1: POST /api/auth/forgot-password/
Request:
{
  "email": "john@example.com"
}

Response (200 OK):
{
  "message": "Verification code sent to your email"
}

→ System sends 6-digit code via email

Step 2: POST /api/auth/verify-reset-code/
Request:
{
  "email": "john@example.com",
  "code": "123456"
}

Response (200 OK):
{
  "message": "Code verified",
  "resetToken": "temp_token_for_password_reset"
}

Step 3: POST /api/auth/reset-password/
Request:
{
  "resetToken": "temp_token_for_password_reset",
  "newPassword": "NewSecurePass456!"
}

Response (200 OK):
{
  "message": "Password reset successfully"
}
```

### 4.4 Login Prevention Rules

Reject login with appropriate error messages when:

| Condition | HTTP Status | Error Message |
|-----------|-------------|---------------|
| Email not verified | 403 | "Please verify your email before logging in" |
| Company paused | 403 | "Your account has been paused. Contact support." |
| Company subscription expired | 403 | "Your subscription has expired. Contact support." |
| User soft-deleted | 403 | "This account has been deactivated" |
| Invalid credentials | 401 | "Invalid username or password" |

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │    Company      │       │   Promotion     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ firstName       │       │ createdById(FK) │◄──────│ companyId (FK)  │
│ lastName        │       │ companyName     │       │ createdById(FK) │
│ username        │       │ username        │       │ name            │
│ email           │       │ email           │       │ description     │
│ password        │       │ password        │       │ price           │
│ city            │       │ phone           │       │ discount        │
│ postalCode      │       │ address         │       │ link            │
│ image           │       │ city            │       │ startDate       │
│ role            │       │ postalCode      │       │ endDate         │
│ emailVerified   │       │ rc              │       │ likes           │
│ interests[]     │       │ companyLink     │       │ clicks          │
│ createdAt       │       │ image           │       │ images[]        │
│ isDeleted       │       │ subscriptionId  │       │ createdAt       │
│ deletedAt       │       │ subscriptionPlan│       │ isDeleted       │
│ deletedById     │       │ subscribeStart  │       │ deletedAt       │
│ anonymizedData  │       │ subscribeEnd    │       │ deletedById     │
└────────┬────────┘       │ canAdd          │       └─────────────────┘
         │                │ canEdit         │                │
         │                │ canDelete       │                │
         │                │ followers       │                │
         │                │ createdAt       │                │
         │                │ isDeleted       │       ┌────────┴────────┐
         │                └────────┬────────┘       │                 │
         │                         │                ▼                 ▼
         │                         │       ┌───────────────┐ ┌───────────────┐
         │                         │       │ PromotionLike │ │PromotionImage │
         │                         │       ├───────────────┤ ├───────────────┤
         │                         │       │ id (PK)       │ │ id (PK)       │
         │                         │       │ userId (FK)   │ │ promotionId   │
         │                         │       │ promotionId   │ │ imageUrl      │
         │                         │       │ createdAt     │ │ sortOrder     │
         │                         │       └───────────────┘ └───────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  UserFollowing  │       │   Moderator     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ userId (FK)     │       │ createdById(FK) │
│ companyId (FK)  │       │ firstName       │
│ createdAt       │       │ lastName        │
└─────────────────┘       │ username        │
                          │ email           │
                          │ password        │
                          │ phone           │
                          │ address         │
                          │ city            │
                          │ postalCode      │
                          │ image           │
                          │ createdAt       │
                          │ isDeleted       │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌──────────────────────┐
                          │  ModeratorCompany    │
                          ├──────────────────────┤
                          │ id (PK)              │
                          │ moderatorId (FK)     │
                          │ companyId (FK)       │
                          │ canAddCompany        │
                          │ canEditTimeCompany   │
                          │ canAdd               │
                          │ canEdit              │
                          │ canDelete            │
                          └──────────────────────┘
```

### 5.2 Complete Table Definitions

#### 5.2.1 Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    image_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
    email_verified BOOLEAN DEFAULT FALSE,
    interests TEXT[], -- Array of category names
    
    -- Analytics tracking
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Soft delete & GDPR
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by_id INTEGER REFERENCES users(id),
    anonymized_data JSONB, -- Stores original data before anonymization
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.2 Companies Table

```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Basic Info
    company_name VARCHAR(200) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    rc VARCHAR(50) NOT NULL, -- Registre du Commerce (Algeria business registration)
    company_link VARCHAR(500), -- Must be validated as working URL
    image_url VARCHAR(500),
    
    -- Subscription
    subscription_plan_id INTEGER REFERENCES subscription_plans(id),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    
    -- Permissions & Status
    is_paused BOOLEAN DEFAULT FALSE,
    can_add BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT TRUE,
    can_delete BOOLEAN DEFAULT TRUE,
    
    -- Stats
    followers_count INTEGER DEFAULT 0,
    
    -- Soft delete & GDPR
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by_id INTEGER REFERENCES users(id),
    anonymized_data JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.3 Moderators Table

```sql
CREATE TABLE moderators (
    id SERIAL PRIMARY KEY,
    created_by_id INTEGER NOT NULL REFERENCES users(id), -- Must be superadmin
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    image_url VARCHAR(500),
    
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by_id INTEGER REFERENCES users(id),
    anonymized_data JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.4 Moderator-Company Assignments

```sql
CREATE TABLE moderator_companies (
    id SERIAL PRIMARY KEY,
    moderator_id INTEGER NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Moderator-level permissions (for company management)
    can_add_company BOOLEAN DEFAULT FALSE,      -- Can create new companies
    can_edit_time_company BOOLEAN DEFAULT FALSE, -- Can edit subscription dates
    
    -- Per-company promotion permissions
    can_add BOOLEAN DEFAULT FALSE,    -- Can add promotions for this company
    can_edit BOOLEAN DEFAULT FALSE,   -- Can edit promotions for this company
    can_delete BOOLEAN DEFAULT FALSE, -- Can delete promotions for this company
    
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by_id INTEGER REFERENCES users(id),
    
    UNIQUE(moderator_id, company_id)
);
```

#### 5.2.5 Promotions Table

```sql
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    created_by_id INTEGER NOT NULL, -- Can be company, moderator, or admin
    
    name VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL, -- Algerian Dinar with 2 decimal places
    discount INTEGER NOT NULL CHECK (discount >= 0 AND discount <= 100),
    link VARCHAR(500) NOT NULL, -- Validated URL
    
    -- Dates (status calculated on frontend)
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by_id INTEGER,
    deleted_by_name VARCHAR(200), -- Store name for audit trail
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Track edits
    last_edited_by_id INTEGER,
    last_edited_at TIMESTAMP
);

-- Edit history for audit
CREATE TABLE promotion_edit_history (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    edited_by_id INTEGER NOT NULL,
    edited_by_name VARCHAR(200),
    edited_by_role VARCHAR(50),
    changes JSONB, -- What was changed
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.6 Promotion Categories (Many-to-Many)

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES categories(id), -- NULL for main categories
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotion_categories (
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, category_id)
);

-- Seed data for categories
INSERT INTO categories (name, parent_id, icon) VALUES
('Fashion & Apparel', NULL, '👗'),
('Electronics & Gadgets', NULL, '📱'),
('Home & Living', NULL, '🏠'),
('Groceries & Food', NULL, '🛒'),
('Beauty & Personal Care', NULL, '💄'),
('Health & Fitness', NULL, '💪'),
('Toys, Hobbies & Entertainment', NULL, '🎮'),
('Automotive & Tools', NULL, '🚗');

-- Subcategories for Fashion & Apparel (parent_id = 1)
INSERT INTO categories (name, parent_id) VALUES
('Men''s Clothing', 1),
('Women''s Clothing', 1),
('Kids'' Clothing', 1),
('Shoes & Footwear', 1),
('Accessories', 1),
('Sportswear', 1);

-- Subcategories for Electronics & Gadgets (parent_id = 2)
INSERT INTO categories (name, parent_id) VALUES
('Smartphones', 2),
('Laptops & Computers', 2),
('Tablets', 2),
('Audio & Headphones', 2),
('Cameras', 2),
('Gaming', 2),
('Wearables', 2),
('Accessories', 2);

-- Continue for all other main categories...
```

#### 5.2.7 Promotion Images

```sql
CREATE TABLE promotion_images (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.8 User Likes

```sql
CREATE TABLE user_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, promotion_id)
);
```

#### 5.2.9 User Following

```sql
CREATE TABLE user_following (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);
```

#### 5.2.10 Subscription Plans

```sql
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Gold', 'Silver', 'Bronze', 'Free'
    price DECIMAL(10, 2) NOT NULL, -- Monthly price in DA
    color VARCHAR(20), -- For UI display
    bg_color VARCHAR(20),
    icon VARCHAR(10),
    
    -- Features
    featured_on_homepage BOOLEAN DEFAULT FALSE,
    homepage_position VARCHAR(20), -- 'primary', 'secondary', NULL
    social_media_promotion BOOLEAN DEFAULT FALSE,
    newsletter_inclusion BOOLEAN DEFAULT FALSE,
    banner_ad_included BOOLEAN DEFAULT FALSE,
    analytics_access VARCHAR(20), -- 'full', 'basic', 'none'
    visibility_days INTEGER, -- How long promotions stay visible
    category_page_only BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed subscription plans
INSERT INTO subscription_plans (name, price, color, bg_color, icon, featured_on_homepage, homepage_position, social_media_promotion, newsletter_inclusion, banner_ad_included, analytics_access, visibility_days) VALUES
('Gold', 199.99, '#FFD700', '#FFF8DC', '👑', TRUE, 'primary', TRUE, TRUE, TRUE, 'full', NULL),
('Silver', 99.99, '#C0C0C0', '#F5F5F5', '🥈', TRUE, 'secondary', TRUE, TRUE, FALSE, 'basic', NULL),
('Bronze', 39.99, '#CD7F32', '#FFF5EE', '🥉', FALSE, NULL, FALSE, FALSE, FALSE, 'basic', 3),
('Free', 0.00, '#9CA3AF', '#F3F4F6', '📦', FALSE, NULL, FALSE, FALSE, FALSE, 'none', 1);
```

#### 5.2.11 Advertisements

```sql
CREATE TABLE advertisements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    placement VARCHAR(50) NOT NULL, -- 'explore_sidebar', 'product_page', 'home_featured', 'category_page', 'search_results'
    position INTEGER DEFAULT 0, -- For ordering multiple ads in same placement
    
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Tracking
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad placements configuration
-- ID 1-2: Explore Page sidebar
-- ID 3-4: Product pages
-- ID 5-6: Home page featured
-- ID 7: Category page
-- ID 8: Search results
```

#### 5.2.12 Legal Content

```sql
CREATE TABLE legal_content (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(50) UNIQUE NOT NULL, -- 'terms', 'rights', 'privacy', 'data_collection', 'security'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL, -- Plain text content
    last_updated_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed legal content sections
INSERT INTO legal_content (section_key, title, content) VALUES
('terms', 'Terms of Service', ''),
('rights', 'User Rights', ''),
('privacy', 'Privacy Policy', ''),
('data_collection', 'Data Collection', ''),
('security', 'Security Information', '');
```

#### 5.2.13 Contact Messages

```sql
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    sender_name VARCHAR(200) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    
    -- Optional user link
    user_id INTEGER REFERENCES users(id),
    user_role VARCHAR(50), -- 'user', 'company', 'guest'
    
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    
    -- Admin handling
    handled_by_id INTEGER REFERENCES users(id),
    handled_at TIMESTAMP,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.14 Top Companies (Featured)

```sql
CREATE TABLE top_companies (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 10), -- Max 10 companies
    
    featured_start TIMESTAMP,
    featured_end TIMESTAMP,
    
    added_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(position)
);
```

#### 5.2.15 Analytics Tables

```sql
-- Promotion Views/Clicks tracking
CREATE TABLE promotion_analytics (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('view', 'click', 'like', 'unlike')),
    
    -- User info (optional for guests)
    user_id INTEGER REFERENCES users(id),
    
    -- Location data
    ip_address INET,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Algeria',
    
    -- Device info
    user_agent TEXT,
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily aggregated stats for performance
CREATE TABLE promotion_daily_stats (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    UNIQUE(promotion_id, date)
);

-- Company-level analytics
CREATE TABLE company_analytics (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    
    event_type VARCHAR(30) NOT NULL, -- 'page_view', 'follow', 'unfollow'
    user_id INTEGER REFERENCES users(id),
    
    ip_address INET,
    city VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.16 User Behavior Tracking (For Recommendations)

```sql
-- Track user interactions for recommendation engine
CREATE TABLE user_behavior (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- What they interacted with
    promotion_id INTEGER REFERENCES promotions(id),
    company_id INTEGER REFERENCES companies(id),
    category_id INTEGER REFERENCES categories(id),
    
    -- Type of interaction
    interaction_type VARCHAR(30) NOT NULL, -- 'view', 'click', 'like', 'follow', 'search', 'time_spent'
    
    -- Additional data
    search_query VARCHAR(300), -- For search interactions
    time_spent_seconds INTEGER, -- For view interactions
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Precomputed user preferences (updated periodically)
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Category affinities (JSON with scores)
    category_scores JSONB, -- {"Electronics": 0.8, "Fashion": 0.6, ...}
    
    -- Brand/Company affinities
    company_scores JSONB, -- {"company_1": 0.9, "company_5": 0.7, ...}
    
    -- Price range preferences
    preferred_min_price DECIMAL(12, 2),
    preferred_max_price DECIMAL(12, 2),
    preferred_discount_min INTEGER,
    
    -- Computed features
    is_deal_seeker BOOLEAN DEFAULT FALSE, -- Prefers high discounts
    prefers_new_arrivals BOOLEAN DEFAULT FALSE,
    
    last_computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 Prisma Schema (Recommended ORM)

Instead of raw SQL, use Prisma ORM for type-safety and easier migrations:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USERS ====================

model User {
  id            Int       @id @default(autoincrement())
  firstName     String    @map("first_name") @db.VarChar(100)
  lastName      String    @map("last_name") @db.VarChar(100)
  username      String    @unique @db.VarChar(50)
  email         String    @unique @db.VarChar(255)
  passwordHash  String    @map("password_hash") @db.VarChar(255)
  city          String?   @db.VarChar(100)
  postalCode    String?   @map("postal_code") @db.VarChar(10)
  imageUrl      String?   @map("image_url") @db.VarChar(500)
  role          UserRole  @default(user)
  emailVerified Boolean   @default(false) @map("email_verified")
  interests     String[]  // Array of category names
  
  // Analytics
  lastLogin  DateTime? @map("last_login")
  loginCount Int       @default(0) @map("login_count")
  
  // Soft delete & GDPR
  isDeleted       Boolean   @default(false) @map("is_deleted")
  deletedAt       DateTime? @map("deleted_at")
  deletedById     Int?      @map("deleted_by_id")
  anonymizedData  Json?     @map("anonymized_data")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  deletedBy         User?       @relation("UserDeletedBy", fields: [deletedById], references: [id])
  deletedUsers      User[]      @relation("UserDeletedBy")
  likes             UserLike[]
  following         UserFollowing[]
  behaviors         UserBehavior[]
  preferences       UserPreferences?
  contactMessages   ContactMessage[]
  
  @@map("users")
}

enum UserRole {
  user
  superadmin
  
  @@map("user_role")
}

// ==================== COMPANIES ====================

model Company {
  id            Int       @id @default(autoincrement())
  createdById   Int       @map("created_by_id")
  
  // Basic Info
  companyName   String    @map("company_name") @db.VarChar(200)
  username      String    @unique @db.VarChar(50)
  email         String    @unique @db.VarChar(255)
  passwordHash  String    @map("password_hash") @db.VarChar(255)
  phone         String    @db.VarChar(20)
  address       String?   @db.Text
  city          String    @db.VarChar(100)
  postalCode    String?   @map("postal_code") @db.VarChar(10)
  rc            String    @db.VarChar(50) // Registre du Commerce
  companyLink   String?   @map("company_link") @db.VarChar(500)
  imageUrl      String?   @map("image_url") @db.VarChar(500)
  
  // Subscription
  subscriptionPlanId   Int?      @map("subscription_plan_id")
  subscriptionStart    DateTime? @map("subscription_start_date")
  subscriptionEnd      DateTime? @map("subscription_end_date")
  
  // Permissions & Status
  isPaused   Boolean @default(false) @map("is_paused")
  canAdd     Boolean @default(true) @map("can_add")
  canEdit    Boolean @default(true) @map("can_edit")
  canDelete  Boolean @default(true) @map("can_delete")
  
  // Stats
  followersCount Int @default(0) @map("followers_count")
  
  // Soft delete & GDPR
  isDeleted       Boolean   @default(false) @map("is_deleted")
  deletedAt       DateTime? @map("deleted_at")
  deletedById     Int?      @map("deleted_by_id")
  anonymizedData  Json?     @map("anonymized_data")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  subscriptionPlan   SubscriptionPlan? @relation(fields: [subscriptionPlanId], references: [id])
  promotions         Promotion[]
  moderatorCompanies ModeratorCompany[]
  followers          UserFollowing[]
  topCompany         TopCompany?
  analytics          CompanyAnalytics[]
  behaviors          UserBehavior[]
  
  @@map("companies")
}

// ==================== MODERATORS ====================

model Moderator {
  id           Int       @id @default(autoincrement())
  createdById  Int       @map("created_by_id")
  
  firstName    String    @map("first_name") @db.VarChar(100)
  lastName     String    @map("last_name") @db.VarChar(100)
  username     String    @unique @db.VarChar(50)
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  phone        String?   @db.VarChar(20)
  address      String?   @db.Text
  city         String?   @db.VarChar(100)
  postalCode   String?   @map("postal_code") @db.VarChar(10)
  imageUrl     String?   @map("image_url") @db.VarChar(500)
  
  // Soft delete
  isDeleted       Boolean   @default(false) @map("is_deleted")
  deletedAt       DateTime? @map("deleted_at")
  deletedById     Int?      @map("deleted_by_id")
  anonymizedData  Json?     @map("anonymized_data")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  assignedCompanies ModeratorCompany[]
  
  @@map("moderators")
}

model ModeratorCompany {
  id          Int @id @default(autoincrement())
  moderatorId Int @map("moderator_id")
  companyId   Int @map("company_id")
  
  // Moderator-level permissions (for company management)
  canAddCompany      Boolean @default(false) @map("can_add_company")
  canEditTimeCompany Boolean @default(false) @map("can_edit_time_company")
  
  // Per-company promotion permissions
  canAdd    Boolean @default(false) @map("can_add")
  canEdit   Boolean @default(false) @map("can_edit")
  canDelete Boolean @default(false) @map("can_delete")
  
  assignedAt   DateTime @default(now()) @map("assigned_at")
  assignedById Int?     @map("assigned_by_id")
  
  // Relations
  moderator Moderator @relation(fields: [moderatorId], references: [id], onDelete: Cascade)
  company   Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([moderatorId, companyId])
  @@map("moderator_companies")
}

// ==================== PROMOTIONS ====================

model Promotion {
  id           Int    @id @default(autoincrement())
  companyId    Int    @map("company_id")
  createdById  Int    @map("created_by_id")
  
  name         String @db.VarChar(300)
  description  String @db.Text
  price        Decimal @db.Decimal(12, 2)
  discount     Int
  link         String @db.VarChar(500)
  
  // Dates
  startDate DateTime @map("start_date")
  endDate   DateTime @map("end_date")
  
  // Engagement metrics
  likesCount  Int @default(0) @map("likes_count")
  clicksCount Int @default(0) @map("clicks_count")
  viewsCount  Int @default(0) @map("views_count")
  
  // Soft delete
  isDeleted     Boolean   @default(false) @map("is_deleted")
  deletedAt     DateTime? @map("deleted_at")
  deletedById   Int?      @map("deleted_by_id")
  deletedByName String?   @map("deleted_by_name") @db.VarChar(200)
  
  // Edit tracking
  lastEditedById Int?      @map("last_edited_by_id")
  lastEditedAt   DateTime? @map("last_edited_at")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  company    Company           @relation(fields: [companyId], references: [id])
  categories PromotionCategory[]
  images     PromotionImage[]
  likes      UserLike[]
  analytics  PromotionAnalytics[]
  dailyStats PromotionDailyStats[]
  editHistory PromotionEditHistory[]
  behaviors   UserBehavior[]
  
  @@map("promotions")
}

model PromotionEditHistory {
  id           Int      @id @default(autoincrement())
  promotionId  Int      @map("promotion_id")
  editedById   Int      @map("edited_by_id")
  editedByName String?  @map("edited_by_name") @db.VarChar(200)
  editedByRole String?  @map("edited_by_role") @db.VarChar(50)
  changes      Json?
  editedAt     DateTime @default(now()) @map("edited_at")
  
  promotion Promotion @relation(fields: [promotionId], references: [id])
  
  @@map("promotion_edit_history")
}

model PromotionImage {
  id          Int    @id @default(autoincrement())
  promotionId Int    @map("promotion_id")
  imageUrl    String @map("image_url") @db.VarChar(500)
  sortOrder   Int    @default(0) @map("sort_order")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  promotion Promotion @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  
  @@map("promotion_images")
}

// ==================== CATEGORIES ====================

model Category {
  id        Int    @id @default(autoincrement())
  name      String @db.VarChar(100)
  parentId  Int?   @map("parent_id")
  icon      String? @db.VarChar(50)
  sortOrder Int    @default(0) @map("sort_order")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  // Self-relation for hierarchy
  parent    Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryHierarchy")
  
  promotions PromotionCategory[]
  behaviors  UserBehavior[]
  
  @@map("categories")
}

model PromotionCategory {
  promotionId Int @map("promotion_id")
  categoryId  Int @map("category_id")
  
  promotion Promotion @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  category  Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([promotionId, categoryId])
  @@map("promotion_categories")
}

// ==================== USER INTERACTIONS ====================

model UserLike {
  id          Int @id @default(autoincrement())
  userId      Int @map("user_id")
  promotionId Int @map("promotion_id")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  promotion Promotion @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, promotionId])
  @@map("user_likes")
}

model UserFollowing {
  id        Int @id @default(autoincrement())
  userId    Int @map("user_id")
  companyId Int @map("company_id")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@unique([userId, companyId])
  @@map("user_following")
}

// ==================== SUBSCRIPTION PLANS ====================

model SubscriptionPlan {
  id       Int     @id @default(autoincrement())
  name     String  @db.VarChar(50)
  price    Decimal @db.Decimal(10, 2)
  color    String? @db.VarChar(20)
  bgColor  String? @map("bg_color") @db.VarChar(20)
  icon     String? @db.VarChar(10)
  
  // Features
  featuredOnHomepage   Boolean @default(false) @map("featured_on_homepage")
  homepagePosition     String? @map("homepage_position") @db.VarChar(20)
  socialMediaPromotion Boolean @default(false) @map("social_media_promotion")
  newsletterInclusion  Boolean @default(false) @map("newsletter_inclusion")
  bannerAdIncluded     Boolean @default(false) @map("banner_ad_included")
  analyticsAccess      String? @map("analytics_access") @db.VarChar(20)
  visibilityDays       Int?    @map("visibility_days")
  categoryPageOnly     Boolean @default(false) @map("category_page_only")
  
  isActive Boolean @default(true) @map("is_active")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  companies Company[]
  
  @@map("subscription_plans")
}

// ==================== ADVERTISEMENTS ====================

model Advertisement {
  id        Int     @id @default(autoincrement())
  title     String  @db.VarChar(200)
  imageUrl  String  @map("image_url") @db.VarChar(500)
  linkUrl   String? @map("link_url") @db.VarChar(500)
  placement String  @db.VarChar(50)
  position  Int     @default(0)
  
  startDate DateTime? @map("start_date")
  endDate   DateTime? @map("end_date")
  isActive  Boolean   @default(true) @map("is_active")
  
  // Tracking
  impressions Int @default(0)
  clicks      Int @default(0)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("advertisements")
}

// ==================== LEGAL CONTENT ====================

model LegalContent {
  id              Int    @id @default(autoincrement())
  sectionKey      String @unique @map("section_key") @db.VarChar(50)
  title           String @db.VarChar(200)
  content         String @db.Text
  lastUpdatedById Int?   @map("last_updated_by_id")
  
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("legal_content")
}

// ==================== CONTACT MESSAGES ====================

model ContactMessage {
  id          Int     @id @default(autoincrement())
  senderName  String  @map("sender_name") @db.VarChar(200)
  senderEmail String  @map("sender_email") @db.VarChar(255)
  subject     String  @db.VarChar(300)
  message     String  @db.Text
  
  // Optional user link
  userId   Int?    @map("user_id")
  userRole String? @map("user_role") @db.VarChar(50)
  
  status MessageStatus @default(unread)
  
  // Admin handling
  handledById Int?      @map("handled_by_id")
  handledAt   DateTime? @map("handled_at")
  adminNotes  String?   @map("admin_notes") @db.Text
  
  createdAt DateTime @default(now()) @map("created_at")
  
  user User? @relation(fields: [userId], references: [id])
  
  @@map("contact_messages")
}

enum MessageStatus {
  unread
  read
  archived
  
  @@map("message_status")
}

// ==================== TOP COMPANIES ====================

model TopCompany {
  id        Int @id @default(autoincrement())
  companyId Int @unique @map("company_id")
  position  Int @unique
  
  featuredStart DateTime? @map("featured_start")
  featuredEnd   DateTime? @map("featured_end")
  
  addedById Int?     @map("added_by_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@map("top_companies")
}

// ==================== ANALYTICS ====================

model PromotionAnalytics {
  id          Int    @id @default(autoincrement())
  promotionId Int    @map("promotion_id")
  eventType   String @map("event_type") @db.VarChar(20)
  
  // User info (optional for guests)
  userId Int? @map("user_id")
  
  // Location data
  ipAddress String? @map("ip_address") @db.VarChar(45)
  city      String? @db.VarChar(100)
  region    String? @db.VarChar(100)
  country   String  @default("Algeria") @db.VarChar(100)
  
  // Device info
  userAgent  String? @map("user_agent") @db.Text
  deviceType String? @map("device_type") @db.VarChar(20)
  
  createdAt DateTime @default(now()) @map("created_at")
  
  promotion Promotion @relation(fields: [promotionId], references: [id])
  
  @@map("promotion_analytics")
}

model PromotionDailyStats {
  id          Int      @id @default(autoincrement())
  promotionId Int      @map("promotion_id")
  date        DateTime @db.Date
  views       Int      @default(0)
  clicks      Int      @default(0)
  likes       Int      @default(0)
  
  promotion Promotion @relation(fields: [promotionId], references: [id])
  
  @@unique([promotionId, date])
  @@map("promotion_daily_stats")
}

model CompanyAnalytics {
  id        Int    @id @default(autoincrement())
  companyId Int    @map("company_id")
  eventType String @map("event_type") @db.VarChar(30)
  userId    Int?   @map("user_id")
  ipAddress String? @map("ip_address") @db.VarChar(45)
  city      String? @db.VarChar(100)
  
  createdAt DateTime @default(now()) @map("created_at")
  
  company Company @relation(fields: [companyId], references: [id])
  
  @@map("company_analytics")
}

// ==================== USER BEHAVIOR (FOR RECOMMENDATIONS) ====================

model UserBehavior {
  id     Int @id @default(autoincrement())
  userId Int @map("user_id")
  
  // What they interacted with
  promotionId Int? @map("promotion_id")
  companyId   Int? @map("company_id")
  categoryId  Int? @map("category_id")
  
  // Type of interaction
  interactionType String @map("interaction_type") @db.VarChar(30)
  
  // Additional data
  searchQuery      String? @map("search_query") @db.VarChar(300)
  timeSpentSeconds Int?    @map("time_spent_seconds")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  promotion Promotion? @relation(fields: [promotionId], references: [id])
  company   Company?   @relation(fields: [companyId], references: [id])
  category  Category?  @relation(fields: [categoryId], references: [id])
  
  @@map("user_behavior")
}

model UserPreferences {
  id     Int @id @default(autoincrement())
  userId Int @unique @map("user_id")
  
  // Category affinities (JSON with scores)
  categoryScores Json? @map("category_scores")
  
  // Brand/Company affinities
  companyScores Json? @map("company_scores")
  
  // Price range preferences
  preferredMinPrice    Decimal? @map("preferred_min_price") @db.Decimal(12, 2)
  preferredMaxPrice    Decimal? @map("preferred_max_price") @db.Decimal(12, 2)
  preferredDiscountMin Int?     @map("preferred_discount_min")
  
  // Computed features
  isDealSeeker       Boolean @default(false) @map("is_deal_seeker")
  prefersNewArrivals Boolean @default(false) @map("prefers_new_arrivals")
  
  lastComputedAt DateTime @default(now()) @map("last_computed_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_preferences")
}

// ==================== EMAIL VERIFICATION ====================

model EmailVerification {
  id        Int      @id @default(autoincrement())
  email     String   @db.VarChar(255)
  code      String   @db.VarChar(6)
  type      String   @db.VarChar(20) // 'registration', 'password_reset'
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([email, code])
  @@map("email_verifications")
}
```

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/verify-email/` | Verify email with code | No |
| POST | `/api/auth/complete-registration/` | Complete registration with interests | No |
| POST | `/api/auth/login/` | Login (all roles) | No |
| POST | `/api/auth/logout/` | Logout | Yes |
| POST | `/api/auth/refresh/` | Refresh JWT token | Yes |
| POST | `/api/auth/forgot-password/` | Request password reset | No |
| POST | `/api/auth/verify-reset-code/` | Verify reset code | No |
| POST | `/api/auth/reset-password/` | Set new password | No |
| PUT | `/api/auth/change-password/` | Change password (logged in) | Yes |

### 6.2 User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me/` | Get current user profile | Yes (User) |
| PUT | `/api/users/me/` | Update profile | Yes (User) |
| PUT | `/api/users/me/image/` | Upload profile image | Yes (User) |
| GET | `/api/users/me/favorites/` | Get liked promotions | Yes (User) |
| GET | `/api/users/me/following/` | Get followed companies | Yes (User) |
| GET | `/api/users/me/recommendations/` | Get personalized recommendations | Yes (User) |
| GET | `/api/users/me/dashboard/` | Get user dashboard data | Yes (User) |

### 6.3 Promotion Endpoints (Public)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/promotions/` | List all active promotions | No |
| GET | `/api/promotions/{id}/` | Get promotion details | No |
| GET | `/api/promotions/featured/` | Get featured/homepage promotions | No |
| GET | `/api/promotions/trending/` | Get trending promotions | No |
| GET | `/api/promotions/category/{subcategory}/` | Get by subcategory | No |
| GET | `/api/promotions/company/{company_id}/` | Get by company | No |
| POST | `/api/promotions/{id}/like/` | Like a promotion | Yes (User) |
| DELETE | `/api/promotions/{id}/like/` | Unlike a promotion | Yes (User) |
| POST | `/api/promotions/{id}/click/` | Track promotion click | No |
| POST | `/api/promotions/{id}/view/` | Track promotion view | No |

### 6.4 Company Endpoints (Public)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/companies/` | List all active companies | No |
| GET | `/api/companies/{id}/` | Get company details | No |
| GET | `/api/companies/{id}/promotions/` | Get company's promotions | No |
| GET | `/api/companies/top/` | Get top/featured companies (max 10) | No |
| POST | `/api/companies/{id}/follow/` | Follow company | Yes (User) |
| DELETE | `/api/companies/{id}/follow/` | Unfollow company | Yes (User) |

### 6.5 Search Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/search/` | Search promotions with fuzzy matching | No |

**Query Parameters:**
```
GET /api/search/?q=smartfone&category=Electronics&min_price=1000&max_price=50000&min_discount=10

Parameters:
- q: Search query (fuzzy matching on name, company, category)
- category: Filter by category name
- company: Filter by company name
- min_price: Minimum price in DA
- max_price: Maximum price in DA
- min_discount: Minimum discount percentage
- sort: 'newest', 'price_asc', 'price_desc', 'discount', 'popular'
- page: Page number (default 1)
- limit: Items per page (default 20, max 50)
```

### 6.6 Categories Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories/` | Get all categories with subcategories | No |

### 6.7 Company Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/company/dashboard/` | Get dashboard overview | Yes (Company) |
| GET | `/api/company/profile/` | Get company profile | Yes (Company) |
| PUT | `/api/company/profile/` | Update company profile | Yes (Company)* |
| GET | `/api/company/promotions/` | Get all company promotions | Yes (Company) |
| POST | `/api/company/promotions/` | Create new promotion | Yes (Company)* |
| PUT | `/api/company/promotions/{id}/` | Update promotion | Yes (Company)* |
| DELETE | `/api/company/promotions/{id}/` | Soft delete promotion | Yes (Company)* |
| GET | `/api/company/promotions/deleted/` | Get deleted promotions | Yes (Company) |
| GET | `/api/company/analytics/` | Get company analytics | Yes (Company) |
| GET | `/api/company/subscription/` | Get subscription details | Yes (Company) |

> `*` = Requires active subscription and not paused

### 6.8 Admin/Superadmin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Dashboard** |
| GET | `/api/admin/dashboard/` | Get admin dashboard overview | Yes (Admin) |
| GET | `/api/admin/analytics/` | Get platform-wide analytics | Yes (Admin) |
| **User Management** |
| GET | `/api/admin/users/` | List all users | Yes (Admin) |
| GET | `/api/admin/users/{id}/` | Get user details | Yes (Admin) |
| PUT | `/api/admin/users/{id}/` | Update user | Yes (Admin) |
| DELETE | `/api/admin/users/{id}/` | Soft delete user | Yes (Admin) |
| GET | `/api/admin/users/deleted/` | Get deleted users | Yes (Superadmin) |
| POST | `/api/admin/users/{id}/restore/` | Restore deleted user | Yes (Superadmin) |
| **Company Management** |
| GET | `/api/admin/companies/` | List all companies | Yes (Admin) |
| POST | `/api/admin/companies/` | Create company | Yes (Superadmin) |
| GET | `/api/admin/companies/{id}/` | Get company details | Yes (Admin) |
| PUT | `/api/admin/companies/{id}/` | Update company | Yes (Admin) |
| DELETE | `/api/admin/companies/{id}/` | Soft delete company | Yes (Admin) |
| POST | `/api/admin/companies/{id}/pause/` | Pause company | Yes (Admin) |
| POST | `/api/admin/companies/{id}/resume/` | Resume company | Yes (Admin) |
| **Moderator Management** |
| GET | `/api/admin/moderators/` | List all moderators | Yes (Superadmin) |
| POST | `/api/admin/moderators/` | Create moderator | Yes (Superadmin) |
| GET | `/api/admin/moderators/{id}/` | Get moderator details | Yes (Superadmin) |
| PUT | `/api/admin/moderators/{id}/` | Update moderator | Yes (Superadmin) |
| DELETE | `/api/admin/moderators/{id}/` | Delete moderator | Yes (Superadmin) |
| POST | `/api/admin/moderators/{id}/assign-company/` | Assign company | Yes (Superadmin) |
| DELETE | `/api/admin/moderators/{id}/companies/{cid}/` | Remove assignment | Yes (Superadmin) |
| PUT | `/api/admin/moderators/{id}/companies/{cid}/permissions/` | Update permissions | Yes (Superadmin) |
| **Promotion Management** |
| GET | `/api/admin/promotions/` | List all promotions | Yes (Admin) |
| POST | `/api/admin/promotions/` | Create promotion for any company | Yes (Admin) |
| PUT | `/api/admin/promotions/{id}/` | Update any promotion | Yes (Admin) |
| DELETE | `/api/admin/promotions/{id}/` | Delete any promotion | Yes (Admin) |
| GET | `/api/admin/promotions/deleted/` | Get deleted promotions | Yes (Admin) |
| **Category Management** |
| GET | `/api/admin/categories/` | List categories | Yes (Admin) |
| POST | `/api/admin/categories/` | Create category | Yes (Superadmin) |
| PUT | `/api/admin/categories/{id}/` | Update category | Yes (Superadmin) |
| DELETE | `/api/admin/categories/{id}/` | Delete category | Yes (Superadmin) |
| **Site Management** |
| GET | `/api/admin/legal-content/` | Get all legal content | Yes (Superadmin) |
| PUT | `/api/admin/legal-content/{section}/` | Update legal content | Yes (Superadmin) |
| GET | `/api/admin/messages/` | Get contact messages | Yes (Superadmin) |
| PUT | `/api/admin/messages/{id}/` | Update message status | Yes (Superadmin) |
| GET | `/api/admin/ads/` | Get all ads | Yes (Superadmin) |
| POST | `/api/admin/ads/` | Create ad | Yes (Superadmin) |
| PUT | `/api/admin/ads/{id}/` | Update ad | Yes (Superadmin) |
| DELETE | `/api/admin/ads/{id}/` | Delete ad | Yes (Superadmin) |
| GET | `/api/admin/subscription-plans/` | Get subscription plans | Yes (Superadmin) |
| PUT | `/api/admin/subscription-plans/{id}/` | Update plan | Yes (Superadmin) |
| GET | `/api/admin/top-companies/` | Get top companies | Yes (Superadmin) |
| POST | `/api/admin/top-companies/` | Add top company | Yes (Superadmin) |
| DELETE | `/api/admin/top-companies/{id}/` | Remove top company | Yes (Superadmin) |
| PUT | `/api/admin/top-companies/reorder/` | Reorder top companies | Yes (Superadmin) |

### 6.9 Moderator Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/moderator/dashboard/` | Get moderator dashboard | Yes (Moderator) |
| GET | `/api/moderator/companies/` | Get assigned companies | Yes (Moderator) |
| GET | `/api/moderator/companies/{id}/` | Get company details | Yes (Moderator)* |
| PUT | `/api/moderator/companies/{id}/` | Update company | Yes (Moderator)** |
| GET | `/api/moderator/companies/{id}/promotions/` | Get company promotions | Yes (Moderator)* |
| POST | `/api/moderator/companies/{id}/promotions/` | Create promotion | Yes (Moderator)** |
| PUT | `/api/moderator/promotions/{id}/` | Update promotion | Yes (Moderator)** |
| DELETE | `/api/moderator/promotions/{id}/` | Delete promotion | Yes (Moderator)** |
| GET | `/api/moderator/promotions/deleted/` | Get deleted promotions | Yes (Moderator)* |

> `*` = Must be assigned to the company
> `**` = Must have the specific permission (canAdd, canEdit, canDelete)

### 6.10 Contact Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contact/` | Submit contact form | No |

---

## 7. Real-Time Features (WebSocket)

### 7.1 WebSocket Connection

```javascript
// Frontend connection example (using Socket.io client)
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  auth: {
    token: 'JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to analytics');
  
  // Join specific rooms
  socket.emit('join:company', { companyId: 5 });
  socket.emit('join:admin');
});

socket.on('analytics:update', (data) => {
  console.log('Analytics update:', data);
});
```

```javascript
// Backend Socket.io setup
// src/socket/analytics.socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.id} connected`);
    
    // Join company-specific room
    socket.on('join:company', ({ companyId }) => {
      // Verify user has access to this company
      socket.join(`company:${companyId}`);
    });
    
    // Join admin room
    socket.on('join:admin', () => {
      if (['superadmin', 'moderator'].includes(socket.user.role)) {
        socket.join('admin');
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.id} disconnected`);
    });
  });
  
  return io;
}

// Emit analytics update (call from controllers)
function emitAnalyticsUpdate(io, companyId, data) {
  io.to(`company:${companyId}`).emit('analytics:update', data);
  io.to('admin').emit('analytics:update', data);
}

module.exports = { setupSocketIO, emitAnalyticsUpdate };
```

### 7.2 WebSocket Events

#### 7.2.1 Analytics Updates (Company/Admin Dashboard)

```json
// Server → Client: Real-time stat update
{
  "type": "analytics_update",
  "data": {
    "promotion_id": 123,
    "event": "view", // or "click", "like"
    "current_stats": {
      "views": 1547,
      "clicks": 234,
      "likes": 89
    },
    "timestamp": "2026-02-11T10:30:00Z"
  }
}

// Server → Client: New follower
{
  "type": "new_follower",
  "data": {
    "company_id": 5,
    "follower_count": 1234,
    "timestamp": "2026-02-11T10:30:00Z"
  }
}
```

#### 7.2.2 Admin Notifications

```json
// Server → Client: New contact message
{
  "type": "new_message",
  "data": {
    "message_id": 45,
    "sender_name": "John Doe",
    "subject": "Question about...",
    "timestamp": "2026-02-11T10:30:00Z"
  }
}

// Server → Client: New user registration
{
  "type": "new_user",
  "data": {
    "user_id": 789,
    "username": "new_user",
    "timestamp": "2026-02-11T10:30:00Z"
  }
}
```

### 7.3 WebSocket Channels

| Channel | Purpose | Subscribers |
|---------|---------|-------------|
| `/ws/analytics/company/{id}/` | Company-specific analytics | Company owner, assigned moderators, admins |
| `/ws/analytics/admin/` | Platform-wide analytics | Admins only |
| `/ws/notifications/admin/` | Admin notifications | Admins only |
| `/ws/notifications/user/{id}/` | User notifications | Specific user |

---

## 8. Analytics & Tracking System

This section explains exactly what data to track, how to calculate metrics, and how to present analytics to different user roles.

### 8.1 Data Collection Overview

#### 8.1.1 Events to Track

| Event Type | Trigger | Data Collected | Who Can See |
|------------|---------|----------------|-------------|
| `view` | User opens promotion detail | promotion_id, user_id*, timestamp, location, device | Company, Moderator, Admin |
| `click` | User clicks promotion link | promotion_id, user_id*, timestamp, location, device | Company, Moderator, Admin |
| `like` | User likes a promotion | promotion_id, user_id, timestamp | Company, Moderator, Admin |
| `unlike` | User unlikes a promotion | promotion_id, user_id, timestamp | Company, Moderator, Admin |
| `follow` | User follows a company | company_id, user_id, timestamp | Company, Moderator, Admin |
| `unfollow` | User unfollows a company | company_id, user_id, timestamp | Company, Moderator, Admin |
| `search` | User performs search | query, user_id*, results_count, timestamp | Admin only |
| `page_view` | User views company page | company_id, user_id*, timestamp, location | Company, Moderator, Admin |

> `*` = Optional (null for guest users)

#### 8.1.2 Location Data Sources

Location is determined using **two sources**:

1. **IP Geolocation** (for all users including guests)
   - Use a service like MaxMind GeoIP2 or ip-api.com
   - Provides: city, region, country
   - Accuracy: City-level

2. **User Profile City** (for registered users)
   - From user registration data
   - More accurate but only for logged-in users

```javascript
// src/services/location.service.js
const geoip = require('geoip-lite');

function getLocationFromIP(ipAddress) {
  const geo = geoip.lookup(ipAddress);
  if (!geo) return { city: 'Unknown', region: 'Unknown', country: 'Algeria' };
  
  return {
    city: geo.city || 'Unknown',
    region: geo.region || 'Unknown',
    country: geo.country || 'Algeria'
  };
}

function getLocationForAnalytics(req, user) {
  // Prefer user profile city if logged in
  if (user && user.city) {
    return {
      city: user.city,
      region: null,
      country: 'Algeria',
      source: 'profile'
    };
  }
  
  // Fallback to IP geolocation
  const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0];
  const geoData = getLocationFromIP(ip);
  return { ...geoData, source: 'ip' };
}

module.exports = { getLocationFromIP, getLocationForAnalytics };
```

### 8.2 Metrics Definitions & Calculations

#### 8.2.1 Promotion-Level Metrics

| Metric | Definition | Calculation | Storage |
|--------|------------|-------------|---------|
| **Views** | Number of times promotion was viewed | COUNT of `view` events | `promotions.views_count` |
| **Clicks** | Number of times promotion link was clicked | COUNT of `click` events | `promotions.clicks_count` |
| **Likes** | Number of users who liked | COUNT of `like` events (minus `unlike`) | `promotions.likes_count` |
| **CTR** (Click-Through Rate) | Percentage of views that led to clicks | `(clicks / views) * 100` | Calculated on-the-fly |
| **Engagement Rate** | Overall engagement | `((likes + clicks) / views) * 100` | Calculated on-the-fly |

```javascript
// Promotion metrics calculation
function calculatePromotionMetrics(promotion, analyticsData) {
  const views = promotion.viewsCount || 0;
  const clicks = promotion.clicksCount || 0;
  const likes = promotion.likesCount || 0;
  
  return {
    views,
    clicks,
    likes,
    ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) : 0,
    engagementRate: views > 0 ? (((likes + clicks) / views) * 100).toFixed(2) : 0
  };
}
```

#### 8.2.2 Company-Level Metrics

| Metric | Definition | Calculation |
|--------|------------|-------------|
| **Total Views** | Sum of all promotion views | SUM of promotion views |
| **Total Clicks** | Sum of all promotion clicks | SUM of promotion clicks |
| **Total Likes** | Sum of all promotion likes | SUM of promotion likes |
| **Followers** | Number of users following | COUNT of `user_following` records |
| **Active Promotions** | Currently running promotions | COUNT where `start_date <= now <= end_date` |
| **Average CTR** | Average click-through rate | AVG of all promotion CTRs |
| **Top Performing** | Best promotion | MAX clicks or engagement |

```javascript
// Company dashboard metrics
async function getCompanyDashboardMetrics(companyId) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      promotions: {
        where: { isDeleted: false }
      }
    }
  });
  
  const now = new Date();
  const activePromotions = company.promotions.filter(
    p => new Date(p.startDate) <= now && new Date(p.endDate) >= now
  );
  
  const totalViews = company.promotions.reduce((sum, p) => sum + p.viewsCount, 0);
  const totalClicks = company.promotions.reduce((sum, p) => sum + p.clicksCount, 0);
  const totalLikes = company.promotions.reduce((sum, p) => sum + p.likesCount, 0);
  
  return {
    overview: {
      totalPromotions: company.promotions.length,
      activePromotions: activePromotions.length,
      totalViews,
      totalClicks,
      totalLikes,
      followers: company.followersCount,
      averageCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0
    },
    topPromotion: company.promotions
      .sort((a, b) => b.clicksCount - a.clicksCount)[0] || null
  };
}
```

#### 8.2.3 Platform-Level Metrics (Admin Dashboard)

| Metric | Definition | Calculation |
|--------|------------|-------------|
| **Total Users** | Registered users | COUNT of `users` where `is_deleted = false` |
| **Total Companies** | Active companies | COUNT of `companies` where `is_deleted = false` |
| **Total Promotions** | All promotions | COUNT of `promotions` where `is_deleted = false` |
| **Active Promotions** | Currently running | COUNT where dates are valid |
| **Daily Active Users** | Users active today | COUNT of unique user_ids in analytics today |
| **New Users (period)** | Users registered in period | COUNT where `created_at` in range |
| **Revenue** | Subscription revenue | SUM of subscription plan prices |

### 8.3 Time-Series Data

#### 8.3.1 Daily Aggregation

Store daily aggregated stats for efficient querying:

```javascript
// Cron job to aggregate daily stats (run at midnight)
// src/jobs/aggregate-daily-stats.js
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);
  
  // Get all promotions
  const promotions = await prisma.promotion.findMany({
    where: { isDeleted: false },
    select: { id: true }
  });
  
  for (const promo of promotions) {
    // Count events for yesterday
    const [views, clicks, likes] = await Promise.all([
      prisma.promotionAnalytics.count({
        where: {
          promotionId: promo.id,
          eventType: 'view',
          createdAt: { gte: yesterday, lte: endOfYesterday }
        }
      }),
      prisma.promotionAnalytics.count({
        where: {
          promotionId: promo.id,
          eventType: 'click',
          createdAt: { gte: yesterday, lte: endOfYesterday }
        }
      }),
      prisma.promotionAnalytics.count({
        where: {
          promotionId: promo.id,
          eventType: 'like',
          createdAt: { gte: yesterday, lte: endOfYesterday }
        }
      })
    ]);
    
    // Upsert daily stats
    await prisma.promotionDailyStats.upsert({
      where: {
        promotionId_date: {
          promotionId: promo.id,
          date: yesterday
        }
      },
      update: { views, clicks, likes },
      create: {
        promotionId: promo.id,
        date: yesterday,
        views,
        clicks,
        likes
      }
    });
  }
  
  console.log('Daily stats aggregation completed');
});
```

#### 8.3.2 Chart Data Format

For frontend charts, return data in this format:

```javascript
// GET /api/company/analytics/chart?period=30d&metric=views

// Response format for line/bar charts
{
  "period": "30d",
  "metric": "views",
  "data": [
    { "date": "2026-01-12", "value": 145 },
    { "date": "2026-01-13", "value": 203 },
    { "date": "2026-01-14", "value": 178 },
    // ... more days
  ],
  "summary": {
    "total": 5234,
    "average": 174.5,
    "max": 312,
    "min": 89,
    "trend": "+12.5%" // vs previous period
  }
}
```

```javascript
// Chart data service
async function getChartData(companyId, metric, period) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const dailyStats = await prisma.promotionDailyStats.groupBy({
    by: ['date'],
    where: {
      promotion: { companyId },
      date: { gte: startDate }
    },
    _sum: {
      views: true,
      clicks: true,
      likes: true
    },
    orderBy: { date: 'asc' }
  });
  
  const metricKey = metric === 'views' ? 'views' : 
                    metric === 'clicks' ? 'clicks' : 'likes';
  
  const data = dailyStats.map(stat => ({
    date: stat.date.toISOString().split('T')[0],
    value: stat._sum[metricKey] || 0
  }));
  
  const values = data.map(d => d.value);
  const total = values.reduce((a, b) => a + b, 0);
  
  return {
    period,
    metric,
    data,
    summary: {
      total,
      average: (total / days).toFixed(1),
      max: Math.max(...values, 0),
      min: Math.min(...values, 0)
    }
  };
}
```

### 8.4 Geographic Analytics

#### 8.4.1 Visitors by Region

Track where users are coming from:

```javascript
// GET /api/company/analytics/geography

async function getGeographicAnalytics(companyId, period = '30d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get promotion IDs for this company
  const promotions = await prisma.promotion.findMany({
    where: { companyId },
    select: { id: true }
  });
  const promotionIds = promotions.map(p => p.id);
  
  // Aggregate by city
  const cityStats = await prisma.promotionAnalytics.groupBy({
    by: ['city'],
    where: {
      promotionId: { in: promotionIds },
      createdAt: { gte: startDate }
    },
    _count: { id: true }
  });
  
  // Sort by count and calculate percentages
  const total = cityStats.reduce((sum, c) => sum + c._count.id, 0);
  const byCity = cityStats
    .sort((a, b) => b._count.id - a._count.id)
    .map(stat => ({
      city: stat.city || 'Unknown',
      count: stat._count.id,
      percentage: ((stat._count.id / total) * 100).toFixed(1)
    }));
  
  return {
    period,
    totalVisitors: total,
    byCity: byCity.slice(0, 10), // Top 10 cities
    topCity: byCity[0]?.city || 'N/A'
  };
}
```

**Response Example:**
```json
{
  "period": "30d",
  "totalVisitors": 12456,
  "byCity": [
    { "city": "Algiers", "count": 4523, "percentage": "36.3" },
    { "city": "Oran", "count": 2134, "percentage": "17.1" },
    { "city": "Constantine", "count": 1567, "percentage": "12.6" },
    { "city": "Annaba", "count": 892, "percentage": "7.2" },
    { "city": "Blida", "count": 756, "percentage": "6.1" }
  ],
  "topCity": "Algiers"
}
```

### 8.5 Real-Time Tracking Implementation

#### 8.5.1 Track View Event

```javascript
// POST /api/promotions/:id/view
async function trackPromotionView(req, res) {
  const { id } = req.params;
  const userId = req.user?.id || null;
  const location = getLocationForAnalytics(req, req.user);
  
  try {
    // Record analytics event
    await prisma.promotionAnalytics.create({
      data: {
        promotionId: parseInt(id),
        eventType: 'view',
        userId,
        ipAddress: req.ip,
        city: location.city,
        region: location.region,
        country: location.country,
        userAgent: req.headers['user-agent'],
        deviceType: getDeviceType(req.headers['user-agent'])
      }
    });
    
    // Increment counter (for quick access)
    await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: { viewsCount: { increment: 1 } }
    });
    
    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
      select: { companyId: true, viewsCount: true, clicksCount: true, likesCount: true }
    });
    
    io.to(`company:${promotion.companyId}`).emit('analytics:update', {
      type: 'view',
      promotionId: parseInt(id),
      stats: {
        views: promotion.viewsCount,
        clicks: promotion.clicksCount,
        likes: promotion.likesCount
      },
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
}

function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}
```

#### 8.5.2 Track Click Event

```javascript
// POST /api/promotions/:id/click
async function trackPromotionClick(req, res) {
  const { id } = req.params;
  const userId = req.user?.id || null;
  const location = getLocationForAnalytics(req, req.user);
  
  try {
    await prisma.promotionAnalytics.create({
      data: {
        promotionId: parseInt(id),
        eventType: 'click',
        userId,
        ipAddress: req.ip,
        city: location.city,
        region: location.region,
        country: location.country,
        userAgent: req.headers['user-agent'],
        deviceType: getDeviceType(req.headers['user-agent'])
      }
    });
    
    await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: { clicksCount: { increment: 1 } }
    });
    
    // Also track in user behavior for recommendations
    if (userId) {
      const promotion = await prisma.promotion.findUnique({
        where: { id: parseInt(id) },
        include: { categories: true }
      });
      
      await prisma.userBehavior.create({
        data: {
          userId,
          promotionId: parseInt(id),
          companyId: promotion.companyId,
          interactionType: 'click'
        }
      });
    }
    
    // Real-time WebSocket update
    const io = req.app.get('io');
    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
      select: { companyId: true, viewsCount: true, clicksCount: true, likesCount: true }
    });
    
    io.to(`company:${promotion.companyId}`).emit('analytics:update', {
      type: 'click',
      promotionId: parseInt(id),
      stats: {
        views: promotion.viewsCount,
        clicks: promotion.clicksCount,
        likes: promotion.likesCount
      },
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
}
```

### 8.6 Dashboard Cards Data

#### 8.6.1 Company Dashboard Cards

The company dashboard displays these summary cards:

```javascript
// GET /api/company/dashboard
async function getCompanyDashboard(companyId) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      promotions: { where: { isDeleted: false } },
      subscriptionPlan: true
    }
  });
  
  // Calculate current period stats
  const currentPeriodStats = await prisma.promotionAnalytics.groupBy({
    by: ['eventType'],
    where: {
      promotion: { companyId },
      createdAt: { gte: thirtyDaysAgo }
    },
    _count: { id: true }
  });
  
  // Calculate previous period for comparison
  const previousPeriodStats = await prisma.promotionAnalytics.groupBy({
    by: ['eventType'],
    where: {
      promotion: { companyId },
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
    },
    _count: { id: true }
  });
  
  const getCount = (stats, type) => 
    stats.find(s => s.eventType === type)?._count.id || 0;
  
  const currentViews = getCount(currentPeriodStats, 'view');
  const previousViews = getCount(previousPeriodStats, 'view');
  const viewsTrend = previousViews > 0 
    ? (((currentViews - previousViews) / previousViews) * 100).toFixed(1)
    : 0;
  
  const currentClicks = getCount(currentPeriodStats, 'click');
  const previousClicks = getCount(previousPeriodStats, 'click');
  const clicksTrend = previousClicks > 0
    ? (((currentClicks - previousClicks) / previousClicks) * 100).toFixed(1)
    : 0;
  
  const activePromotions = company.promotions.filter(
    p => new Date(p.startDate) <= new Date() && new Date(p.endDate) >= new Date()
  ).length;
  
  return {
    cards: [
      {
        title: 'Total Views',
        value: company.promotions.reduce((sum, p) => sum + p.viewsCount, 0),
        trend: `${viewsTrend >= 0 ? '+' : ''}${viewsTrend}%`,
        trendDirection: viewsTrend >= 0 ? 'up' : 'down',
        period: 'vs last 30 days'
      },
      {
        title: 'Total Clicks',
        value: company.promotions.reduce((sum, p) => sum + p.clicksCount, 0),
        trend: `${clicksTrend >= 0 ? '+' : ''}${clicksTrend}%`,
        trendDirection: clicksTrend >= 0 ? 'up' : 'down',
        period: 'vs last 30 days'
      },
      {
        title: 'Total Likes',
        value: company.promotions.reduce((sum, p) => sum + p.likesCount, 0),
        trend: null,
        period: 'all time'
      },
      {
        title: 'Followers',
        value: company.followersCount,
        trend: null,
        period: 'total'
      },
      {
        title: 'Active Promotions',
        value: activePromotions,
        subtitle: `of ${company.promotions.length} total`
      }
    ],
    subscription: {
      plan: company.subscriptionPlan?.name || 'Free',
      startDate: company.subscriptionStart,
      endDate: company.subscriptionEnd,
      daysRemaining: company.subscriptionEnd 
        ? Math.max(0, Math.ceil((new Date(company.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24)))
        : null
    }
  };
}
```

#### 8.6.2 Admin Dashboard Cards

```javascript
// GET /api/admin/dashboard
async function getAdminDashboard() {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [
    totalUsers,
    totalCompanies,
    totalModerators,
    totalPromotions,
    newUsersToday,
    newUsersMonth,
    activePromotions
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false, role: 'user' } }),
    prisma.company.count({ where: { isDeleted: false } }),
    prisma.moderator.count({ where: { isDeleted: false } }),
    prisma.promotion.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.promotion.count({
      where: {
        isDeleted: false,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    })
  ]);
  
  // Platform-wide analytics
  const platformViews = await prisma.promotionAnalytics.count({
    where: {
      eventType: 'view',
      createdAt: { gte: thirtyDaysAgo }
    }
  });
  
  return {
    cards: [
      { title: 'Total Users', value: totalUsers, icon: 'users' },
      { title: 'Total Companies', value: totalCompanies, icon: 'building' },
      { title: 'Total Moderators', value: totalModerators, icon: 'shield' },
      { title: 'Total Promotions', value: totalPromotions, icon: 'tag' },
      { title: 'Active Promotions', value: activePromotions, icon: 'zap' },
      { title: 'New Users (Today)', value: newUsersToday, icon: 'user-plus' },
      { title: 'New Users (30 days)', value: newUsersMonth, icon: 'trending-up' },
      { title: 'Platform Views (30d)', value: platformViews, icon: 'eye' }
    ]
  };
}
```

### 8.7 Analytics Data Types Summary

| Data Type | Storage Type | Example Values |
|-----------|--------------|----------------|
| `eventType` | VARCHAR(20) | 'view', 'click', 'like', 'unlike', 'follow', 'unfollow' |
| `deviceType` | VARCHAR(20) | 'mobile', 'tablet', 'desktop', 'unknown' |
| `city` | VARCHAR(100) | 'Algiers', 'Oran', 'Constantine' |
| `region` | VARCHAR(100) | 'Algiers Province', 'Oran Province' |
| `country` | VARCHAR(100) | 'Algeria' (default) |
| `ipAddress` | VARCHAR(45) | '192.168.1.1', '2001:db8::1' (IPv6 support) |
| `interactionType` | VARCHAR(30) | 'view', 'click', 'like', 'follow', 'search', 'time_spent' |
| `counts` | INTEGER | 0 to unlimited |
| `percentages` | DECIMAL(5,2) | 0.00 to 100.00 |
| `timestamps` | TIMESTAMP | ISO 8601 format |

---

## 9. Recommendation Engine

### 9.1 Overview

The recommendation engine provides personalized promotion suggestions based on:
1. **User Interests** (selected during registration)
2. **Liked Promotions** (explicit positive signals)
3. **Followed Companies** (brand affinity)
4. **Browsing History** (implicit signals)
5. **Recency** (prefer newer promotions)

### 9.2 Algorithm

```javascript
// src/services/recommendation.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generate personalized recommendations for a user.
 * 
 * Scoring formula:
 * score = (category_match * 0.3) + 
 *         (company_affinity * 0.25) + 
 *         (popularity * 0.2) + 
 *         (recency * 0.15) + 
 *         (discount_value * 0.1)
 */
async function getRecommendations(userId, limit = 20) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      likes: { select: { promotionId: true } },
      following: { select: { companyId: true } }
    }
  });
  
  const userPrefs = await prisma.userPreferences.findUnique({
    where: { userId }
  });
  
  const likedIds = user.likes.map(l => l.promotionId);
  const followingIds = user.following.map(f => f.companyId);
  
  // Get candidate promotions (active only)
  const now = new Date();
  const candidates = await prisma.promotion.findMany({
    where: {
      isDeleted: false,
      startDate: { lte: now },
      endDate: { gte: now },
      id: { notIn: likedIds },
      company: {
        isPaused: false,
        isDeleted: false
      }
    },
    include: {
      categories: true,
      company: { select: { id: true, companyName: true } }
    }
  });
  
  const scoredPromotions = candidates.map(promo => {
    let score = 0.0;
    const promoCategories = promo.categories.map(c => c.name);
    
    // 1. Category Match (0.3 weight)
    if (user.interests && user.interests.length > 0) {
      const overlap = promoCategories.filter(c => user.interests.includes(c)).length;
      const categoryScore = overlap / Math.max(user.interests.length, 1);
      score += categoryScore * 0.3;
    }
    
    // Add category scores from behavior
    if (userPrefs?.categoryScores) {
      promoCategories.forEach(cat => {
        score += (userPrefs.categoryScores[cat] || 0) * 0.1;
      });
    }
    
    // 2. Company Affinity (0.25 weight)
    if (followingIds.includes(promo.companyId)) {
      score += 0.25; // Boost for followed companies
    } else if (userPrefs?.companyScores) {
      score += (userPrefs.companyScores[String(promo.companyId)] || 0) * 0.15;
    }
    
    // 3. Popularity (0.2 weight)
    const popularity = (promo.likesCount * 2 + promo.clicksCount) / 1000;
    score += Math.min(popularity, 1.0) * 0.2;
    
    // 4. Recency (0.15 weight)
    const daysOld = Math.floor((now - promo.createdAt) / (1000 * 60 * 60 * 24));
    const recencyScore = Math.max(0, 1 - (daysOld / 30)); // Decay over 30 days
    score += recencyScore * 0.15;
    
    // 5. Discount Value (0.1 weight)
    if (userPrefs?.isDealSeeker) {
      const discountScore = promo.discount / 100;
      score += discountScore * 0.1;
    }
    
    return { promotion: promo, score };
  });
  
  // Sort by score and return top N
  scoredPromotions.sort((a, b) => b.score - a.score);
  return scoredPromotions.slice(0, limit).map(sp => sp.promotion);
}

module.exports = { getRecommendations };
```

### 9.3 Behavior Tracking Events

Track these events to build user preferences:

| Event | Weight | Data Captured |
|-------|--------|---------------|
| View Promotion | 0.1 | promotion_id, time_spent |
| Click Promotion Link | 0.3 | promotion_id |
| Like Promotion | 0.5 | promotion_id, categories |
| Follow Company | 0.4 | company_id |
| Search | 0.2 | query, categories clicked |
| Category Browse | 0.15 | category_id, time_spent |

### 9.4 Preference Computation (Background Job)

Run periodically (e.g., every 6 hours) using node-cron to update user preferences:

```javascript
// src/services/preference.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BEHAVIOR_WEIGHTS = {
  view: 0.1,
  click: 0.3,
  like: 0.5,
  follow: 0.4,
  search: 0.2,
  time_spent: 0.15
};

/**
 * Aggregate user behavior into preference scores.
 */
async function computeUserPreferences(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Get behavior from last 30 days
  const behaviors = await prisma.userBehavior.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo }
    },
    include: {
      category: true,
      promotion: {
        include: { categories: true }
      }
    }
  });
  
  const categoryScores = {};
  const companyScores = {};
  
  behaviors.forEach(behavior => {
    const weight = BEHAVIOR_WEIGHTS[behavior.interactionType] || 0;
    
    if (behavior.categoryId && behavior.category) {
      const catName = behavior.category.name;
      categoryScores[catName] = (categoryScores[catName] || 0) + weight;
    }
    
    if (behavior.companyId) {
      const compId = String(behavior.companyId);
      companyScores[compId] = (companyScores[compId] || 0) + weight;
    }
    
    if (behavior.promotion) {
      behavior.promotion.categories.forEach(cat => {
        categoryScores[cat.name] = (categoryScores[cat.name] || 0) + weight * 0.5;
      });
      const compId = String(behavior.promotion.companyId);
      companyScores[compId] = (companyScores[compId] || 0) + weight * 0.3;
    }
  });
  
  // Normalize scores to 0-1 range
  const maxCat = Math.max(...Object.values(categoryScores), 1);
  const maxComp = Math.max(...Object.values(companyScores), 1);
  
  Object.keys(categoryScores).forEach(k => {
    categoryScores[k] = categoryScores[k] / maxCat;
  });
  
  Object.keys(companyScores).forEach(k => {
    companyScores[k] = companyScores[k] / maxComp;
  });
  
  // Determine user type
  const likeBehaviors = behaviors.filter(b => b.interactionType === 'like');
  const highDiscountLikes = likeBehaviors.filter(
    b => b.promotion && b.promotion.discount >= 30
  ).length;
  const isDealSeeker = likeBehaviors.length > 0 && 
    highDiscountLikes > likeBehaviors.length * 0.6;
  
  // Upsert preferences
  await prisma.userPreferences.upsert({
    where: { userId },
    update: {
      categoryScores,
      companyScores,
      isDealSeeker,
      lastComputedAt: new Date()
    },
    create: {
      userId,
      categoryScores,
      companyScores,
      isDealSeeker,
      lastComputedAt: new Date()
    }
  });
}

module.exports = { computeUserPreferences };
```

```javascript
// src/jobs/preference.job.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { computeUserPreferences } = require('../services/preference.service');
const prisma = new PrismaClient();

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Starting preference computation job...');
  
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    select: { id: true }
  });
  
  for (const user of users) {
    try {
      await computeUserPreferences(user.id);
    } catch (error) {
      console.error(`Failed to compute preferences for user ${user.id}:`, error);
    }
  }
  
  console.log('Preference computation job completed.');
});
```

### 9.5 API Response Format

```json
GET /api/users/me/recommendations/

Response:
{
  "recommendations": [
    {
      "id": 123,
      "name": "iPhone 15 Pro - 20% Off",
      "company": {
        "id": 5,
        "name": "TechStore DZ",
        "image": "/media/companies/techstore.jpg"
      },
      "price": 180000.00,
      "discount": 20,
      "images": ["/media/promotions/iphone1.jpg"],
      "categories": ["Smartphones", "Electronics"],
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": "2026-02-28T23:59:59Z",
      "likes_count": 234,
      "recommendation_reason": "Based on your interest in Electronics"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

## 10. File Upload System

### 10.1 Storage Configuration

Files are stored on the **local filesystem** with the following structure:

```
/media/
├── users/
│   └── {user_id}/
│       └── profile.{ext}
├── companies/
│   └── {company_id}/
│       └── logo.{ext}
├── promotions/
│   └── {promotion_id}/
│       ├── image_1.{ext}
│       ├── image_2.{ext}
│       └── ...
├── moderators/
│   └── {moderator_id}/
│       └── profile.{ext}
└── ads/
    └── {ad_id}.{ext}
```

### 10.2 Upload Constraints

| Type | Max Size | Max Count | Allowed Formats |
|------|----------|-----------|-----------------|
| Profile Image | 2 MB | 1 | JPG, PNG, WebP |
| Company Logo | 2 MB | 1 | JPG, PNG, WebP |
| Promotion Images | 2 MB each | 5 | JPG, PNG, WebP |
| Ad Images | 5 MB | 1 | JPG, PNG, WebP, GIF |

### 10.3 Upload Endpoint

```
POST /api/upload/
Content-Type: multipart/form-data

Form Fields:
- file: The image file
- type: 'user_profile' | 'company_logo' | 'promotion' | 'moderator_profile' | 'ad'
- entity_id: The ID of the related entity
- sort_order: (optional) For promotion images

Response:
{
  "url": "/media/promotions/123/image_1.jpg",
  "filename": "image_1.jpg",
  "size": 156789,
  "mime_type": "image/jpeg"
}
```

### 10.4 Image Processing

- Resize large images to max 1920x1080 while maintaining aspect ratio
- Generate thumbnails (300x300) for list views
- Strip EXIF data for privacy
- Convert to WebP for optimization (optional)

---

## 11. Email Notification System

### 11.1 Transactional Emails

| Trigger | Recipient | Template |
|---------|-----------|----------|
| Registration | User | Welcome + Verification Code |
| Email Verification | User | 6-digit code |
| Password Reset | User | 6-digit code |
| New Promotion | Followers | Promotion announcement |
| Subscription Expiring | Company | 7 days warning |
| Subscription Expired | Company | Account paused notice |
| New Contact Message | Admins | Message notification |
| Company Paused | Company | Account paused notice |
| Company Resumed | Company | Account resumed notice |

### 11.2 Email Templates

#### 11.2.1 Verification Code Email

```
Subject: PromoDZ - Your Verification Code

Hello {first_name},

Your verification code is: {code}

This code expires in 15 minutes.

If you didn't request this code, please ignore this email.

---
PromoDZ Team
```

#### 11.2.2 New Promotion Notification (To Followers)

```
Subject: New Deal from {company_name}! 🎉

Hello {user_name},

Great news! {company_name}, a company you follow, just posted a new promotion:

{promotion_name}
{discount}% OFF - Now {price} DA

[View Promotion]

---
You're receiving this because you follow {company_name}.
Unfollow to stop these notifications.
```

#### 11.2.3 New Contact Message (To Admins)

```
Subject: [PromoDZ] New Contact Message from {sender_name}

A new message has been received:

From: {sender_name} ({sender_email})
Subject: {subject}
Role: {user_role}

Message:
{message}

---
[View in Admin Panel]
```

### 11.3 Email Configuration

```javascript
// src/config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net', // or your provider
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@promodz.com',
    to,
    subject,
    html,
    text
  };
  
  return transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendEmail };
```

```env
# .env
SENDGRID_API_KEY=your_api_key_here
EMAIL_FROM=noreply@promodz.com
```

---

## 12. Search & Filtering

### 12.1 Search Implementation

The search must support **fuzzy matching** (typo tolerance). Options:

#### Option A: PostgreSQL Trigram Similarity

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes
CREATE INDEX idx_promotions_name_trgm ON promotions USING gin (name gin_trgm_ops);
CREATE INDEX idx_companies_name_trgm ON companies USING gin (company_name gin_trgm_ops);

-- Query with fuzzy matching
SELECT p.*, similarity(p.name, 'smartfone') as sml
FROM promotions p
WHERE p.name % 'smartfone'  -- Uses trigram similarity
   OR EXISTS (
     SELECT 1 FROM companies c 
     WHERE c.id = p.company_id AND c.company_name % 'smartfone'
   )
ORDER BY sml DESC
LIMIT 20;
```

#### Option B: Elasticsearch (For Large Scale)

```json
{
  "query": {
    "bool": {
      "should": [
        {
          "fuzzy": {
            "name": {
              "value": "smartfone",
              "fuzziness": "AUTO"
            }
          }
        },
        {
          "fuzzy": {
            "company_name": {
              "value": "smartfone",
              "fuzziness": "AUTO"
            }
          }
        },
        {
          "match": {
            "categories": "smartfone"
          }
        }
      ]
    }
  }
}
```

### 12.2 Filter Parameters

```python
# All available filters
filters = {
    'q': str,              # Search query (fuzzy)
    'category': str,       # Subcategory name (exact match)
    'company': int,        # Company ID
    'min_price': Decimal,  # Minimum price in DA
    'max_price': Decimal,  # Maximum price in DA
    'min_discount': int,   # Minimum discount percentage
    'city': str,           # Company city
    'sort': str,           # 'newest', 'price_asc', 'price_desc', 'discount', 'popular'
    'page': int,           # Page number (default: 1)
    'limit': int,          # Items per page (default: 20, max: 50)
}
```

### 12.3 Sorting Options

| Sort Value | SQL Order |
|------------|-----------|
| `newest` | `created_at DESC` |
| `price_asc` | `price * (1 - discount/100) ASC` |
| `price_desc` | `price * (1 - discount/100) DESC` |
| `discount` | `discount DESC` |
| `popular` | `likes_count DESC, clicks_count DESC` |

### 12.4 Search Response Format

```json
{
  "results": [
    {
      "id": 123,
      "name": "Smartphone Samsung Galaxy S24",
      "company": {
        "id": 5,
        "name": "ElectroDZ",
        "image": "/media/companies/5/logo.jpg"
      },
      "price": 150000.00,
      "discount": 15,
      "final_price": 127500.00,
      "images": ["/media/promotions/123/image_1.jpg"],
      "categories": ["Smartphones"],
      "likes_count": 89,
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": "2026-02-28T23:59:59Z",
      "status": "active"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  },
  "facets": {
    "categories": [
      {"name": "Smartphones", "count": 45},
      {"name": "Laptops", "count": 23}
    ],
    "price_ranges": [
      {"min": 0, "max": 10000, "count": 12},
      {"min": 10000, "max": 50000, "count": 34}
    ]
  }
}
```

---

## 13. Business Rules & Validation

### 13.1 Promotion Rules

| Rule | Validation |
|------|------------|
| Title | Required, 3-300 characters |
| Description | Required, 10-5000 characters |
| Price | Required, positive decimal, max 2 decimal places |
| Discount | Required, 0-100 integer |
| Link | Required, valid URL format, must be accessible |
| Categories | Required, 1-5 subcategories only (no main categories) |
| Images | Required, 1-5 images, max 2MB each |
| Start Date | Required, can be future (scheduled) |
| End Date | Required, must be after start date |

### 13.2 Company Rules

| Rule | Validation |
|------|------------|
| Company Name | Required, 2-200 characters, unique |
| Username | Required, 3-50 characters, alphanumeric + underscore, unique |
| Email | Required, valid format, unique |
| Phone | Required, valid Algerian format |
| RC | Required, valid Registre du Commerce format |
| Company Link | Optional, if provided must be valid and accessible URL |
| City | Required |

### 13.3 User Rules

| Rule | Validation |
|------|------------|
| First Name | Required, 2-100 characters |
| Last Name | Required, 2-100 characters |
| Username | Required, 3-50 characters, alphanumeric + underscore, unique |
| Email | Required, valid format, unique |
| Password | Required, min 8 characters, must contain uppercase, lowercase, number |
| Interests | Optional, max 10 categories |

### 13.4 Subscription Rules

1. **Subscription Expiry**:
   - Company can still view dashboard (read-only)
   - Company cannot add/edit/delete promotions
   - Existing promotions are hidden from public view
   - System should not auto-delete promotions

2. **Paused Company**:
   - Same as expired subscription
   - Admin can pause/resume manually
   - When resumed with active subscription, all permissions restored

3. **Permission Hierarchy**:
   - If subscription expired → all permissions false
   - If paused → all permissions false
   - If all permissions false → auto-pause

### 13.5 URL Validation

The `companyLink` and promotion `link` fields must be validated:

```javascript
// src/utils/validators.js
const { URL } = require('url');

/**
 * Validate that a URL is properly formatted and accessible.
 */
async function validateUrl(url) {
  // Check format
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https' };
    }
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  // Check accessibility (optional, can be disabled for performance)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow'
    });
    
    clearTimeout(timeout);
    
    if (response.status >= 400) {
      return { valid: false, error: `URL returned status ${response.status}` };
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { valid: false, error: 'URL request timed out' };
    }
    return { valid: false, error: `URL not accessible: ${err.message}` };
  }
  
  return { valid: true, error: null };
}

// Simple format-only validation (faster, for non-critical checks)
function isValidUrlFormat(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

module.exports = { validateUrl, isValidUrlFormat };
```

---

## 14. Error Handling

### 14.1 Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": {
      "email": ["This email is already registered"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### 14.2 Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 400 | `INVALID_FILE_TYPE` | Unsupported file format |
| 400 | `FILE_TOO_LARGE` | File exceeds size limit |
| 401 | `UNAUTHORIZED` | Missing or invalid auth |
| 401 | `INVALID_CREDENTIALS` | Wrong username/password |
| 401 | `TOKEN_EXPIRED` | JWT token expired |
| 403 | `EMAIL_NOT_VERIFIED` | Email verification required |
| 403 | `ACCOUNT_PAUSED` | Company account is paused |
| 403 | `SUBSCRIPTION_EXPIRED` | Subscription has ended |
| 403 | `PERMISSION_DENIED` | Insufficient permissions |
| 403 | `ACCOUNT_DELETED` | Account has been deactivated |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `ALREADY_EXISTS` | Duplicate resource |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 15. Security Considerations

### 15.1 Authentication Security

- Use bcryptjs for password hashing (cost factor 12)
- JWT tokens should expire (access: 15 min, refresh: 7 days)
- Invalidate refresh tokens on password change
- Implement account lockout after 5 failed login attempts

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to check current status
    let user;
    if (decoded.role === 'user' || decoded.role === 'superadmin') {
      user = await prisma.user.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === 'company') {
      user = await prisma.company.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === 'moderator') {
      user = await prisma.moderator.findUnique({ where: { id: decoded.id } });
    }
    
    if (!user || user.isDeleted) {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_DELETED',
          message: 'This account has been deactivated'
        }
      });
    }
    
    // Check company-specific restrictions
    if (decoded.role === 'company') {
      if (user.isPaused) {
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_PAUSED',
            message: 'Your account has been paused. Contact support.'
          }
        });
      }
      
      if (user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date()) {
        // Allow read-only access, block write operations
        req.subscriptionExpired = true;
      }
    }
    
    req.user = { ...decoded, ...user };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        }
      });
    }
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
  }
};

module.exports = { authenticateToken };
```

```javascript
// src/middleware/roles.js
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions'
        }
      });
    }
    
    next();
  };
};

const requireActiveSubscription = (req, res, next) => {
  if (req.subscriptionExpired) {
    return res.status(403).json({
      error: {
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Your subscription has expired'
      }
    });
  }
  next();
};

module.exports = { requireRole, requireActiveSubscription };
```

```javascript
// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../config/email');
const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, city, postalCode } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_EXISTS',
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken'
        }
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        passwordHash,
        city,
        postalCode,
        emailVerified: false
      }
    });
    
    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await prisma.emailVerification.create({
      data: {
        email,
        code,
        type: 'registration',
        expiresAt
      }
    });
    
    // Send verification email
    await sendEmail({
      to: email,
      subject: 'PromoDZ - Your Verification Code',
      html: `
        <h2>Hello ${firstName},</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code expires in 15 minutes.</p>
      `
    });
    
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed'
      }
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check all user types
    let user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] }
    });
    let role = user?.role || 'user';
    
    if (!user) {
      user = await prisma.company.findFirst({
        where: { OR: [{ username }, { email: username }] }
      });
      role = 'company';
    }
    
    if (!user) {
      user = await prisma.moderator.findFirst({
        where: { OR: [{ username }, { email: username }] }
      });
      role = 'moderator';
    }
    
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }
    
    // Check email verification (for users)
    if (role === 'user' && !user.emailVerified) {
      return res.status(403).json({
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in'
        }
      });
    }
    
    // Check if deleted
    if (user.isDeleted) {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_DELETED',
          message: 'This account has been deactivated'
        }
      });
    }
    
    // Check company status
    if (role === 'company') {
      if (user.isPaused) {
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_PAUSED',
            message: 'Your account has been paused. Contact support.'
          }
        });
      }
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id, role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    
    res.json({
      access: accessToken,
      refresh: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role,
        emailVerified: user.emailVerified ?? true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed'
      }
    });
  }
};

module.exports = { register, login };
```

### 15.2 GDPR Compliance (Soft Delete & Anonymization)

When a user requests deletion or admin deletes a user:

```javascript
// src/services/user.service.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const prisma = new PrismaClient();

async function softDeleteUser(userId, deletedById) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Store original data for potential restore
  const anonymizedData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    city: user.city,
    postalCode: user.postalCode,
    imageUrl: user.imageUrl
  };
  
  // Update user with anonymized data
  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: 'Deleted',
      lastName: 'User',
      email: `deleted_${userId}@promodz.local`,
      username: `deleted_user_${userId}`,
      city: null,
      postalCode: null,
      imageUrl: null,
      isDeleted: true,
      deletedAt: new Date(),
      deletedById,
      anonymizedData
    }
  });
  
  // Delete profile image from filesystem
  if (anonymizedData.imageUrl) {
    try {
      const imagePath = path.join(__dirname, '../../uploads', anonymizedData.imageUrl);
      await fs.unlink(imagePath);
    } catch (err) {
      console.error('Failed to delete user image:', err);
    }
  }
  
  return { success: true, message: 'User soft deleted and anonymized' };
}

// Restore user (Superadmin only)
async function restoreUser(userId, restoredById) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || !user.isDeleted) {
    throw new Error('Deleted user not found');
  }
  
  const originalData = user.anonymizedData;
  
  if (!originalData) {
    throw new Error('No original data available for restoration');
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: originalData.firstName,
      lastName: originalData.lastName,
      email: originalData.email,
      username: originalData.username,
      city: originalData.city,
      postalCode: originalData.postalCode,
      isDeleted: false,
      deletedAt: null,
      deletedById: null,
      anonymizedData: null
    }
  });
  
  return { success: true, message: 'User restored successfully' };
}

module.exports = { softDeleteUser, restoreUser };
```

### 15.3 Input Validation

- Sanitize all text inputs to prevent XSS
- Validate file uploads (check magic bytes, not just extension)
- Use Prisma ORM for parameterized queries (prevents SQL injection)
- Validate and sanitize URLs before storing

```javascript
// src/middleware/validate.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data',
        details: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {})
      }
    });
  }
  next();
};

module.exports = { validate };
```

### 15.4 API Security Headers

```javascript
// src/app.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later'
    }
  }
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts, please try again later'
    }
  }
});
app.use('/api/auth/login', authLimiter);
```

### 15.5 CORS Configuration

```javascript
// src/app.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',
    'https://promodz.com'     // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## Appendix A: Seed Data

### A.1 Prisma Seed Script

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // ==================== SUPERADMINS (Exactly 3) ====================
  const passwordHash = await bcrypt.hash('SuperAdmin123!', 12);
  
  const superadmins = [
    {
      firstName: 'Admin',
      lastName: 'One',
      username: 'superadmin1',
      email: 'admin1@promodz.com',
      passwordHash,
      role: 'superadmin',
      emailVerified: true
    },
    {
      firstName: 'Admin',
      lastName: 'Two',
      username: 'superadmin2',
      email: 'admin2@promodz.com',
      passwordHash,
      role: 'superadmin',
      emailVerified: true
    },
    {
      firstName: 'Admin',
      lastName: 'Three',
      username: 'superadmin3',
      email: 'admin3@promodz.com',
      passwordHash,
      role: 'superadmin',
      emailVerified: true
    }
  ];
  
  for (const admin of superadmins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: admin
    });
  }
  console.log('✓ Superadmins seeded');
  
  // ==================== CATEGORIES ====================
  const categories = [
    {
      name: 'Fashion & Apparel',
      icon: '👗',
      subcategories: [
        "Men's Clothing", "Women's Clothing", "Kids' Clothing",
        "Shoes & Footwear", "Accessories", "Sportswear"
      ]
    },
    {
      name: 'Electronics & Gadgets',
      icon: '📱',
      subcategories: [
        "Smartphones", "Laptops & Computers", "Tablets",
        "Audio & Headphones", "Cameras", "Gaming", "Wearables", "Accessories"
      ]
    },
    {
      name: 'Home & Living',
      icon: '🏠',
      subcategories: [
        "Furniture", "Kitchen & Dining", "Bedding & Bath",
        "Home Decor", "Storage & Organization", "Lighting"
      ]
    },
    {
      name: 'Groceries & Food',
      icon: '🛒',
      subcategories: [
        "Fresh Produce", "Dairy & Eggs", "Meat & Seafood",
        "Bakery", "Beverages", "Snacks", "Pantry Staples"
      ]
    },
    {
      name: 'Beauty & Personal Care',
      icon: '💄',
      subcategories: [
        "Skincare", "Makeup", "Haircare", "Fragrances",
        "Personal Hygiene", "Men's Grooming"
      ]
    },
    {
      name: 'Health & Fitness',
      icon: '💪',
      subcategories: [
        "Vitamins & Supplements", "Exercise Equipment",
        "Sports Nutrition", "Medical Supplies", "Wellness"
      ]
    },
    {
      name: 'Toys, Hobbies & Entertainment',
      icon: '🎮',
      subcategories: [
        "Kids' Toys", "Board Games", "Video Games",
        "Books & Magazines", "Musical Instruments", "Arts & Crafts"
      ]
    },
    {
      name: 'Automotive & Tools',
      icon: '🚗',
      subcategories: [
        "Car Accessories", "Car Care", "Tools & Equipment",
        "Motorcycle Accessories", "Tires & Wheels"
      ]
    }
  ];
  
  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: { id: categories.indexOf(category) + 1 },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        sortOrder: categories.indexOf(category)
      }
    });
    
    for (const subcat of category.subcategories) {
      await prisma.category.create({
        data: {
          name: subcat,
          parentId: parent.id,
          sortOrder: category.subcategories.indexOf(subcat)
        }
      }).catch(() => {}); // Ignore if exists
    }
  }
  console.log('✓ Categories seeded');
  
  // ==================== SUBSCRIPTION PLANS ====================
  const plans = [
    {
      name: 'Gold',
      price: 199.99,
      color: '#FFD700',
      bgColor: '#FFF8DC',
      icon: '👑',
      featuredOnHomepage: true,
      homepagePosition: 'primary',
      socialMediaPromotion: true,
      newsletterInclusion: true,
      bannerAdIncluded: true,
      analyticsAccess: 'full',
      visibilityDays: null
    },
    {
      name: 'Silver',
      price: 99.99,
      color: '#C0C0C0',
      bgColor: '#F5F5F5',
      icon: '🥈',
      featuredOnHomepage: true,
      homepagePosition: 'secondary',
      socialMediaPromotion: true,
      newsletterInclusion: true,
      bannerAdIncluded: false,
      analyticsAccess: 'basic',
      visibilityDays: null
    },
    {
      name: 'Bronze',
      price: 39.99,
      color: '#CD7F32',
      bgColor: '#FFF5EE',
      icon: '🥉',
      featuredOnHomepage: false,
      homepagePosition: null,
      socialMediaPromotion: false,
      newsletterInclusion: false,
      bannerAdIncluded: false,
      analyticsAccess: 'basic',
      visibilityDays: 3,
      categoryPageOnly: true
    },
    {
      name: 'Free',
      price: 0.00,
      color: '#9CA3AF',
      bgColor: '#F3F4F6',
      icon: '📦',
      featuredOnHomepage: false,
      homepagePosition: null,
      socialMediaPromotion: false,
      newsletterInclusion: false,
      bannerAdIncluded: false,
      analyticsAccess: 'none',
      visibilityDays: 1
    }
  ];
  
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plans.indexOf(plan) + 1 },
      update: plan,
      create: plan
    });
  }
  console.log('✓ Subscription plans seeded');
  
  // ==================== LEGAL CONTENT ====================
  const legalContent = [
    { sectionKey: 'terms', title: 'Terms of Service', content: 'Terms of service content here...' },
    { sectionKey: 'rights', title: 'User Rights', content: 'User rights content here...' },
    { sectionKey: 'privacy', title: 'Privacy Policy', content: 'Privacy policy content here...' },
    { sectionKey: 'data_collection', title: 'Data Collection', content: 'Data collection info here...' },
    { sectionKey: 'security', title: 'Security Information', content: 'Security information here...' }
  ];
  
  for (const legal of legalContent) {
    await prisma.legalContent.upsert({
      where: { sectionKey: legal.sectionKey },
      update: {},
      create: legal
    });
  }
  console.log('✓ Legal content seeded');
  
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed script:
```bash
npx prisma db seed
```

Add to package.json:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

---

## Appendix B: Algerian Cities Reference

Common cities for validation/autocomplete:

```python
ALGERIAN_CITIES = [
    "Algiers", "Oran", "Constantine", "Annaba", "Blida",
    "Batna", "Djelfa", "Sétif", "Sidi Bel Abbès", "Biskra",
    "Tébessa", "El Oued", "Skikda", "Tiaret", "Béjaïa",
    "Tlemcen", "Ouargla", "Béchar", "Mostaganem", "Bordj Bou Arréridj",
    "Chlef", "Médéa", "Tizi Ouzou", "El Eulma", "Touggourt",
    "Khenchela", "Laghouat", "Relizane", "Saïda", "Ghardaïa"
]
```

---

## Appendix C: Testing Checklist

### Authentication
- [ ] User can register with valid data
- [ ] User cannot login without email verification
- [ ] Password reset flow works
- [ ] JWT tokens expire correctly
- [ ] Refresh token rotation works

### User Features
- [ ] User can like/unlike promotions
- [ ] User can follow/unfollow companies
- [ ] Recommendations update based on behavior
- [ ] Email notifications sent to followers

### Company Features
- [ ] Company can CRUD promotions (when active)
- [ ] Company cannot add promotions when paused
- [ ] Company cannot add promotions when expired
- [ ] Analytics track views/clicks/likes

### Admin Features
- [ ] Superadmin can create companies
- [ ] Superadmin can create moderators
- [ ] Superadmin can manage all site content
- [ ] Admin can pause/resume companies

### Moderator Features
- [ ] Moderator only sees assigned companies
- [ ] Moderator permissions are per-company
- [ ] Moderator cannot access site management

### Search
- [ ] Fuzzy search finds "smartfone" for "smartphone"
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Pagination works correctly

### Real-Time
- [ ] WebSocket connects with auth
- [ ] Analytics update in real-time
- [ ] Notifications delivered to admins

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-11 | PromoDZ Team | Initial documentation |

---

**End of Documentation**

*This document should be treated as the single source of truth for backend development. Any changes to frontend functionality should be reflected here.*
