# HotelOps Live 🏨

A modern, real-time hotel operations management dashboard built with Next.js 14, Supabase, and TypeScript. Streamline your hotel operations with live updates, task management, and guest services.

![HotelOps Live](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🌟 Features

### Staff Dashboard
- **Real-time Room Management**: Monitor and update room statuses (available, occupied, cleaning, maintenance) with live synchronization
- **Live Activity Feed**: Track all hotel operations in real-time with auto-scrolling activity logs
- **Guest Management**: Complete guest directory with search, booking information, and contact details
- **Task Management**: Organize cleaning and maintenance tasks with priority levels and completion tracking
- **Service Requests**: View and manage guest service requests (housekeeping, room service, amenities, maintenance)
- **Analytics Dashboard**: Monitor revenue, occupancy rates, bookings, and operational metrics
- **Hotel Settings**: Manage hotel information and user profiles
- **Responsive Design**: Mobile-optimized sidebar and layouts for on-the-go management

### Guest Portal
- **Guest Login**: Secure authentication using 6-digit guest codes
- **Booking Information**: View current stay and upcoming reservations
- **Service Requests**: Submit requests for housekeeping, amenities, room service, or maintenance
- **Request Tracking**: Monitor service request status (pending → in progress → completed)
- **Priority Selection**: Choose urgency levels (low, normal, high, urgent) for requests
- **Real-time Updates**: See instant status changes on your requests

### Real-time Features
- **Live Room Status Updates**: Changes sync instantly across all staff devices
- **Activity Logging**: Automatic tracking of all room status changes and operations
- **Service Request Notifications**: Immediate visibility of guest requests for staff
- **WebSocket Integration**: Powered by Supabase Realtime for instant data synchronization

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **Styling**: Tailwind CSS, Radix UI Components
- **Build Tool**: Turbopack
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner Toast

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hotel-ops
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard (Settings → API).

### 4. Set Up Supabase Database

Run the following SQL scripts in your Supabase SQL Editor (in order):

1. **Schema Setup**: `supabase/schema.sql`
   - Creates all tables, enums, and relationships
   - Sets up RLS (Row Level Security) policies

2. **Demo Data** (optional): `supabase/seed-demo-data.sql`
   - Adds sample hotel, rooms, and bookings
   - Creates test users and guests

3. **Booking Data**: `supabase/add-booking-columns.sql`
   - Adds analytics columns and sample bookings

4. **Guest Names**: `supabase/update-guest-names.sql`
   - Updates guest names to realistic values

5. **RLS Policies**: `supabase/guest-login-rls.sql`
   - Enables guest portal authentication
   - Allows service request creation

6. **Activity Log Fix**: `supabase/fix-activity-log-rls.sql`
   - Fixes INSERT policy for activity logging

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 User Roles & Access

### Staff Users
**Login**: Email + Password

**Access**:
- Full dashboard access
- Room management
- Guest directory
- Task management
- Service request handling
- Analytics and reports
- Settings management

### Guest Users
**Login**: 6-digit Guest Code

**Sample Guest Codes**:
Run this query in Supabase to get active guest codes:
```sql
SELECT name, email, guest_code, status 
FROM guests g 
JOIN bookings b ON g.id = b.guest_id 
WHERE b.status = 'checked_in' 
LIMIT 5;
```

**Access**:
- View current and upcoming bookings
- Submit service requests
- Track request status
- Check-out functionality

## 📖 User Flows

### Staff Workflow

#### 1. Dashboard Overview
- Login with staff credentials
- View real-time room grid with color-coded statuses
- Monitor live activity feed for recent operations
- Check quick stats: available rooms, occupancy, active tasks

#### 2. Room Management
- Navigate to **Rooms** page
- Click any room card to view details
- Change room status:
  - **Available** → Ready for new guests
  - **Occupied** → Guest checked in
  - **Cleaning** → Housekeeping in progress
  - **Maintenance** → Repairs needed
- Status changes automatically create activity log entries

#### 3. Task Management
- Navigate to **Tasks** page
- View sections:
  - **Pending Guest Requests**: New service requests from guests
  - **In Progress**: Currently being handled
  - **Cleaning Tasks**: Rooms needing housekeeping
  - **Maintenance Tasks**: Rooms requiring repairs
- Click **Start** to begin a service request
- Click **Complete** to finish tasks

#### 4. Guest Management
- Navigate to **Guests** page
- Use search bar to find guests by name, email, or phone
- View guest details:
  - Contact information
  - Current booking status
  - Room assignment
  - Check-in/check-out dates

#### 5. Analytics
- Navigate to **Analytics** page
- View metrics:
  - Total revenue from bookings
  - Current occupancy percentage
  - Active bookings count
  - Guest list with booking details

#### 6. Settings
- Click profile menu → **Settings**
- Update hotel information (name, address, contact)
- Manage user profile details

### Guest Workflow

#### 1. Guest Login
- Open login page
- Click **Guest** tab
- Enter your 6-digit guest code (provided at check-in)
- Click **Access Guest Portal**

#### 2. View Booking
- See current stay information:
  - Room number and type
  - Check-in and check-out dates
  - Booking status
- View upcoming reservations (if any)

#### 3. Request Service
- Click **Request Service** button
- Select service type:
  - **Room Cleaning**: Housekeeping service
  - **Amenities**: Towels, water, toiletries
  - **Room Service**: Food and beverage delivery
  - **Maintenance**: Report issues or repairs
  - **Other**: Any other request
- Choose priority level:
  - **Low**: No rush
  - **Normal**: Standard timing
  - **High**: Please prioritize
  - **Urgent**: Immediate attention needed
- Add optional description for specific details
- Click **Submit Request**

#### 4. Track Requests
- View **Your Service Requests** section
- See request status:
  - **Pending**: Waiting for staff assignment
  - **In Progress**: Being handled by staff
  - **Completed**: Service finished
- Check timestamp for when request was submitted
- View priority badge for urgent requests

#### 5. Check Out
- Click **Check Out** button when leaving
- Booking status updates to 'checked_out'

## 🗄️ Database Schema

### Core Tables

**hotels**
- Hotel information (name, address, contact)

**rooms**
- Room details (number, type, floor, rate, status)
- Status: available, occupied, cleaning, maintenance

**guests**
- Guest information (name, email, phone)
- Unique 6-digit guest_code for portal access

**bookings**
- Booking details (check-in/out dates, status, payment)
- Links guests to rooms
- Status: confirmed, checked_in, checked_out, cancelled

**users**
- Staff user accounts
- Role-based access (admin, manager, staff)

**service_requests**
- Guest service requests
- Type: housekeeping, room_service, maintenance, amenities, other
- Status: pending, in_progress, completed, cancelled

**tasks**
- Operational tasks for staff
- Type: cleaning, maintenance
- Priority: urgent, high, normal, low

**activity_log**
- Audit trail of all operations
- Tracks room changes, completions, service requests

### Key Enums

```sql
room_status: available | occupied | cleaning | maintenance
booking_status: confirmed | checked_in | checked_out | cancelled
task_status: pending | in_progress | completed | cancelled
task_priority: urgent | high | normal | low
service_type: housekeeping | room_service | maintenance | amenities | other
```

## 🔐 Security

- **Row Level Security (RLS)**: All tables protected with Supabase RLS policies
- **Authentication**: Supabase Auth for staff, guest code verification for guests
- **Guest Access**: Read-only access to own bookings and service requests
- **Staff Access**: Full CRUD operations scoped to their hotel
- **API Protection**: Anonymous access only for guest login and service requests

## 🎨 UI/UX Features

- **Dark Mode**: Forced dark theme for reduced eye strain
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Real-time Updates**: WebSocket-powered live data sync
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Skeleton loaders and spinners for better UX
- **Color-coded Status**: Visual indicators for room and task statuses
- **Search & Filter**: Quick guest lookup and task filtering
- **Scrollable Modals**: Service request form adapts to content size
- **Consistent Theming**: Unified dark slate color scheme across all pages

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start development server with Turbopack
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Project Structure

```
hotel-ops/
├── app/
│   ├── dashboard/          # Staff dashboard pages
│   │   ├── analytics/      # Analytics page
│   │   ├── guests/         # Guest management
│   │   ├── rooms/          # Room management
│   │   ├── settings/       # Settings page
│   │   └── tasks/          # Task management
│   ├── guest-portal/       # Guest portal page
│   ├── login/              # Login page (staff + guest)
│   └── layout.tsx          # Root layout with theme
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── activity-feed.tsx
│   │   ├── analytics.tsx
│   │   ├── guest-list.tsx
│   │   ├── header.tsx
│   │   ├── room-grid.tsx
│   │   ├── room-management.tsx
│   │   ├── settings.tsx
│   │   ├── sidebar.tsx
│   │   └── task-list.tsx
│   ├── guest/              # Guest portal components
│   │   └── service-request-form.tsx
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase/           # Supabase client setup
│   └── utils.ts            # Utility functions
└── supabase/               # SQL migration scripts
    ├── schema.sql
    ├── seed-demo-data.sql
    ├── add-booking-columns.sql
    ├── update-guest-names.sql
    ├── guest-login-rls.sql
    └── fix-activity-log-rls.sql
```

## 📱 Mobile Support

- Responsive sidebar (hamburger menu on mobile)
- Touch-friendly room grid cards
- Scrollable modals for service requests
- Optimized layouts for tablets and phones
- Mobile-first CSS with Tailwind breakpoints


## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review Supabase console for database errors

## 🎯 Roadmap

- [ ] SMS notifications for urgent guest requests
- [ ] Revenue analytics and reporting
- [ ] Housekeeping staff mobile app
- [ ] Multi-hotel support
- [ ] Calendar view for bookings
- [ ] Guest check-in/check-out workflow
- [ ] Payment processing integration
- [ ] Email confirmations and receipts

---

Built with ❤️ using Next.js and Supabase
