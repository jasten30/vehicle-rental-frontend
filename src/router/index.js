// vehicle-rental-frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import store from "../store"; // Keep this import for the guard
import { getAuth } from 'firebase/auth';

// Public Views
import HomeView from "../views/HomeView.vue";
import VehicleListView from "../views/Vehicle/VehicleListView.vue"; // Corrected name
import VehicleDetailView from "../views/Vehicle/VehicleDetailView.vue";
import LoginView from "../views/Auth/LoginView.vue";
import RegisterView from "../views/Auth/RegisterView.vue";
import NotFoundView from "../views/NotFoundView.vue";

// Dashboard Views
import DashboardLayout from "../views/Dashboard/DashboardLayout.vue";
import MyBookingsView from "../views/Dashboard/MyBookings.vue"; // Corrected path
import BookingDetailView from "../views/Dashboard/BookingDetailView.vue"; // This was missing in the router, but used in MyBookings.vue
import ProfileSettingsView from "../views/Dashboard/ProfileSettings.vue"; // Corrected name
import OwnerVehiclesView from "../views/Dashboard/Owner/OwnerVehiclesView.vue";
import AddEditVehicleView from "../views/Dashboard/Owner/AddEditVehicleView.vue";
// NEW: Import the BookingPaymentView
import BookingPaymentView from "../views/Booking/BookingPaymentView.vue";
// NEW: Import the BookingSummaryView (will create placeholder below)
import BookingSummaryView from "../views/Booking/BookingSummaryView.vue";
// NEW: Import other dashboard views (will create placeholders below)
import OwnerBookingsView from "../views/Dashboard/Owner/OwnerBookingsView.vue";
import AdminVehiclesView from "../views/Dashboard/Admin/AdminVehiclesView.vue";
import AdminBookingsView from "../views/Dashboard/Admin/AdminBookingsView.vue";
import AdminUsersView from "../views/Dashboard/Admin/AdminUsersView.vue";


const dashboardRoutes = [
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "my-bookings",
        name: "MyBookings",
        component: MyBookingsView,
        meta: { requiresAuth: true, authorize: ['renter', 'admin', 'owner'] },
      },
      {
        path: "my-bookings/:bookingId", // This route was missing in your provided router
        name: "BookingDetails",
        component: BookingDetailView,
        props: true,
        meta: { requiresAuth: true, authorize: ['renter', 'admin', 'owner'] },
      },
      {
        path: "profile-settings",
        name: "ProfileSettings",
        component: ProfileSettingsView,
        meta: { requiresAuth: true, authorize: ['renter', 'admin', 'owner'] },
      },
      // Owner specific routes
      {
        path: "owner/vehicles",
        name: "OwnerVehicles",
        component: OwnerVehiclesView,
        meta: { requiresAuth: true, authorize: ['owner', 'admin'] },
      },
      {
        path: "owner/vehicles/add",
        name: "AddVehicle",
        component: AddEditVehicleView,
        meta: { requiresAuth: true, authorize: ['owner', 'admin'] },
      },
      {
        path: "owner/vehicles/edit/:vehicleId",
        name: "EditVehicle",
        component: AddEditVehicleView,
        props: true,
        meta: { requiresAuth: true, authorize: ['owner', 'admin'] },
      },
      // Owner bookings (placeholder)
      {
        path: "owner/bookings",
        name: "OwnerBookings",
        component: OwnerBookingsView, // Use imported component
        meta: { requiresAuth: true, authorize: ['owner', 'admin'] },
      },
      // Admin specific routes (placeholders)
      {
        path: "admin/vehicles",
        name: "AdminVehicles",
        component: AdminVehiclesView, // Use imported component
        meta: { requiresAuth: true, authorize: ['admin'] },
      },
      {
        path: "admin/bookings",
        name: "AdminBookings",
        component: AdminBookingsView, // Use imported component
        meta: { requiresAuth: true, authorize: ['admin'] },
      },
      {
        path: "admin/users",
        name: "AdminUsers",
        component: AdminUsersView, // Use imported component
        meta: { requiresAuth: true, authorize: ['admin'] },
      },
      {
        path: "", // Default dashboard route
        redirect: { name: "MyBookings" },
      },
    ],
  },
];

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/vehicles",
    name: "VehicleList", // Corrected name to match VehicleListView
    component: VehicleListView,
  },
  {
    path: "/vehicles/:id",
    name: "VehicleDetail",
    component: VehicleDetailView,
    props: true,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
  },
  // NEW: Route for payment selection
  {
    path: "/booking/payment/:bookingId",
    name: "BookingPayment",
    component: BookingPaymentView,
    props: true,
    meta: { requiresAuth: true, authorize: ['renter', 'owner', 'admin'] },
  },
  // NEW: Route for booking summary (after payment selection)
  {
    path: "/booking/summary/:bookingId",
    name: "BookingSummary",
    component: BookingSummaryView,
    props: true,
    meta: { requiresAuth: true, authorize: ['renter', 'owner', 'admin'] },
  },
  ...dashboardRoutes, // Include dashboard routes
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  console.log(`[Router Guard] Navigating from ${from.path} to ${to.path}.`);
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const authorizedRoles = to.meta.authorize;
  const isAuthenticated = store.getters.isAuthenticated;
  const userRole = store.getters.userRole;
  const auth = getAuth();

  // Ensure Firebase auth state is ready before proceeding with auth checks
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      unsubscribe(); // Unsubscribe immediately after the first state change
      resolve(firebaseUser);
    });
  });

  if (requiresAuth && !isAuthenticated) {
    console.log('[Router Guard] Not authenticated. Redirecting to login.');
    next('/login');
  } else if (requiresAuth && isAuthenticated && authorizedRoles) {
    if (authorizedRoles.includes(userRole)) {
      console.log('[Router Guard] Authenticated and authorized. Proceeding.');
      next();
    } else {
      console.warn(`[Router Guard] User role '${userRole}' not authorized for route '${to.path}'. Redirecting to dashboard.`);
      alert('You do not have permission to view this page.');
      next('/dashboard'); // Redirect to a default dashboard route if not authorized
    }
  } else {
    console.log('[Router Guard] No auth required or already authenticated. Proceeding.');
    next();
  }
});

export default router;
