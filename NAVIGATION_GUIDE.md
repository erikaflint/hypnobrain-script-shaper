# Centralized Navigation Guide

## Overview
All pages now use the **centralized `AppHeader` component** for consistent navigation across the entire application. No more copy-pasting header code!

## ✨ NEW: Role-Based Navigation
The AppHeader now supports **role-based access control** with automatic admin link visibility!

## AppHeader Component

Located at: `client/src/components/app-header.tsx`

### Features
- 🏠 **Logo/Home Link**: Automatically included on all pages
- ⬅️ **Back Button**: Optional, navigable to any route
- 📝 **Title & Subtitle**: Optional page title with icon
- 🔐 **Auth Buttons**: Login/Logout with conditional rendering
- 📊 **Dashboard Link**: Quick access to user scripts
- ✨ **Create Script Button**: Primary CTA for script generation
- 🎨 **Custom Right Content**: Flexible slot for any components

### Props Interface

```typescript
interface AppHeaderProps {
  variant?: 'landing' | 'app' | 'simple';
  showBack?: boolean;           // Show back button
  backUrl?: string;              // Where back button navigates (default: '/')
  title?: string;                // Page title
  subtitle?: string;             // Page subtitle/step indicator
  icon?: React.ReactNode;        // Icon next to title
  showAuth?: boolean;            // Show login/logout buttons
  showDashboard?: boolean;       // Show dashboard link
  showCreateScript?: boolean;    // Show "Create Script" button
  showAdminLink?: boolean;       // Show admin link (🔒 only visible to admins!)
  rightContent?: React.ReactNode; // Custom components on right side
}
```

## 🔐 Role-Based Features

### Admin Detection
The `useAuth()` hook now returns:
```tsx
const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
```

### Admin-Only Links
```tsx
// This link ONLY shows to admins!
<AppHeader showAdminLink={true} />
```

The admin link:
- ✅ Automatically hidden from regular users
- ✅ Shows Shield icon for admins
- ✅ Protected by backend middleware
- ✅ No conditional logic needed in your pages!

### Setting Admin Users

**Option 1: Migrate existing admin_users**
```bash
# Automatically mark all users in admin_users table as isAdmin=true
npx tsx server/scripts/migrate-admin-users.ts
```

**Option 2: Set individual user as admin**
```bash
# Make any specific user an admin by email
npx tsx server/scripts/set-admin.ts user@example.com
```

### Backend Protection
Admin routes are protected with middleware:
```typescript
app.get("/api/admin/generations", isAuthenticated, isAdmin, async (req, res) => {
  // Only accessible to authenticated admin users
});
```

The `isAdmin` middleware:
- ✅ Checks user.claims.sub (Replit Auth format)
- ✅ Verifies isAdmin=true in database
- ✅ Returns 403 Forbidden for non-admins
- ✅ Returns 401 Unauthorized if not logged in

## Usage Examples

### 1. Landing Page (with Auth + Admin)
```tsx
<AppHeader showAuth={true} showAdminLink={true} />
```
Shows: 
- Logo | Login (when logged out)
- Logo | Admin 🛡️ (admins only) | Dashboard | Logout (when admin)
- Logo | Dashboard | Logout (when regular user)

### 2. DREAM Page (Back + Title + Dashboard)
```tsx
<AppHeader 
  showBack={true}
  title="DREAM Hypnosis"
  icon={<Moon className="w-5 h-5 text-primary" />}
  showDashboard={true}
/>
```
Shows: Back Button | DREAM Hypnosis 🌙 | My Scripts

### 3. Dashboard (Title + Actions)
```tsx
<AppHeader 
  title="HypnoBrain Script Shaper"
  showCreateScript={true}
  rightContent={
    <Link href="/packages/create">
      <Button variant="outline" size="sm">
        <Package className="w-4 h-4 mr-2" />
        Create Package
      </Button>
    </Link>
  }
/>
```
Shows: Logo | HypnoBrain Script Shaper | Create Package | Create Script

### 4. Admin Page (Back + Title + Badge)
```tsx
<AppHeader 
  showBack={true}
  title="Admin: All Generations"
  icon={<Sparkles className="w-5 h-5 text-primary" />}
  rightContent={
    <Badge variant="secondary">
      {count} Total
    </Badge>
  }
/>
```
Shows: Back | Admin: All Generations ✨ | {count} Total

### 5. App-v2 (Multi-step with Progress)
```tsx
<AppHeader 
  showBack={true}
  title="HypnoBrain Script Shaper"
  subtitle={
    step === "intake" ? "Step 1: Client Intake" :
    step === "mixer" ? "Step 3: Customize Mix" : "Your Script"
  }
  showDashboard={true}
  rightContent={
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${step === "intake" ? "bg-primary" : "bg-muted"}`} />
      <div className={`w-2 h-2 rounded-full ${step === "mixer" ? "bg-primary" : "bg-muted"}`} />
    </div>
  }
/>
```
Shows: Back | HypnoBrain Script Shaper (Step 1: Client Intake) | Progress Dots | My Scripts

### 6. Free Script Page (Simple Back + Title)
```tsx
<AppHeader 
  showBack={true}
  title="Free Weekly Script"
  icon={<Sparkles className="w-5 h-5 text-primary" />}
/>
```
Shows: Back | Free Weekly Script ✨

## Pages Updated

✅ **Landing** (`/`) - Auth buttons
✅ **DREAM** (`/dream`) - Back + Title + Dashboard
✅ **Dashboard** (`/dashboard`) - Title + Create actions
✅ **Free** (`/free`) - Back + Title
✅ **Admin** (`/admin`) - Back + Title + Count badge
✅ **App-v2** (`/app-v2`) - Back + Title + Progress + Dashboard

## Benefits

1. **Consistency**: All pages look and behave the same
2. **Maintainability**: Update navigation in one place
3. **Flexibility**: Mix and match features per page
4. **Auth State**: Automatically handled by the component
5. **Responsive**: Built-in mobile/desktop handling
6. **Sticky Header**: Always visible at top with backdrop blur

## Design Tokens

The header uses:
- `border-b` - Bottom border for separation
- `sticky top-0 z-50` - Always visible
- `bg-background/95 backdrop-blur` - Frosted glass effect
- `h-16` - Consistent height across all pages
- `max-w-7xl mx-auto px-6` - Centered with padding

## Adding to New Pages

1. Import the component:
```tsx
import { AppHeader } from "@/components/app-header";
```

2. Choose your configuration:
```tsx
<AppHeader 
  showBack={true}
  title="Your Page Title"
  showDashboard={true}
/>
```

3. That's it! The header handles the rest.
