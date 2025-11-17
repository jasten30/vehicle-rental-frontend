import { createRouter, createWebHistory } from 'vue-router';
import store from '../store'; // Import the Vuex store

// Public Views
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import VehicleListView from '../views/Vehicle/VehicleListView.vue';
import VehicleDetailView from '../views/Vehicle/VehicleDetailView.vue';
import LoginView from '../views/Auth/LoginView.vue';
import RegisterView from '../views/Auth/RegisterView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import BecomeOwnerApplication from '../views/Auth/BecomeOwnerApplication.vue';
import ContactView from '@/views/ContactView.vue';
import HowItWorksView from '@/views/HowItWorksView.vue';
import CareersView from '@/views/CareersView.vue';
import BlogView from '@/views/BlogView.vue';
import BlogPostDetailView from '@/views/BlogPostDetailView.vue'; 
import FAQView from '@/views/FAQView.vue'; // <-- 1. ADDED IMPORT

// Dashboard Views
import AdminLayout from '../views/Dashboard/Admin/AdminLayout.vue';
import DashboardLayout from '../views/Dashboard/DashboardLayout.vue';
import MyBookingsView from '../views/Dashboard/MyBookings.vue';
import MyFavoritesView from '../views/Dashboard/MyFavoritesView.vue';
import BookingDetailView from '../views/Dashboard/BookingDetailView.vue';
import ProfileSettingsView from '../views/Dashboard/ProfileSettings.vue';
import ApplicationSubmittedView from '../views/Auth/ApplicationSubmittedView.vue';
import OwnerVehiclesView from '../views/Dashboard/Owner/OwnerVehiclesView.vue';
import VehicleFormSteps from '../components/forms/VehicleFormSteps.vue'; // Used for AddVehicle
import EditVehicleView from '../views/Dashboard/Owner/EditVehicleView.vue'; // Correct path
import MotorcycleFormSteps from '../components/forms/motorcyle/MotorcycleFormSteps.vue'; // Correct path
import OwnerBillingView from '../views/Booking/OwnerBillingView.vue';
import BookingSummaryView from '../views/Booking/BookingSummaryView.vue';
import OwnerBookingsView from '../views/Dashboard/Owner/OwnerBookingsView.vue';
import AdminVehiclesView from '../views/Dashboard/Admin/AdminVehiclesView.vue';
import AdminBookingsView from '../views/Dashboard/Admin/AdminBookingsView.vue';
import AdminUsersView from '../views/Dashboard/Admin/AdminUsersView.vue';
import AdminDashboardView from '../views/Dashboard/Admin/AdminDashboardView.vue';
import AdminHostApplicationsView from '../views/Dashboard/Admin/AdminHostApplicationsView.vue';
import BookingStatusView from '../views/Dashboard/BookingStatusView.vue';
import ChatView from '../views/Dashboard/ChatView.vue';
import BecomeDriveVerified from '../views/Dashboard/BecomeDriveVerified.vue';

const dashboardRoutes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'my-bookings',
        name: 'MyBookings',
        component: MyBookingsView,
        meta: {
          requiresAuth: true,
          authorize: ['renter', 'admin', 'owner'],
        },
      },
      {
        path: 'my-favorites',
        name: 'MyFavorites',
        component: MyFavoritesView,
        meta: {
          requiresAuth: true,
          authorize: ['renter', 'owner', 'admin'],
        },
      },
      {
        path: 'my-bookings/:bookingId',
        name: 'BookingDetails',
        component: BookingDetailView,
        props: true,
        meta: {
          requiresAuth: true,
          authorize: ['renter', 'admin', 'owner'],
        },
      },
      {
        path: 'profile-settings',
        name: 'ProfileSettings',
        component: ProfileSettingsView,
        meta: {
          requiresAuth: true,
          authorize: ['renter', 'admin', 'owner'],
        },
      },
      {
        path: 'inbox',
        name: 'Chat',
        component: ChatView,
        meta: { requiresAuth: true },
      },
      // --- REMOVED 'support' route ---
      {
        path: 'verify-driver',
        name: 'BecomeDriveVerified',
        component: BecomeDriveVerified,
        meta: { requiresAuth: true, authorize: ['renter'] },
      },
      {
        path: 'owner/vehicles',
        name: 'OwnerVehicles',
        component: OwnerVehiclesView,
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'earnings',
        name: 'OwnerBilling',
        component: OwnerBillingView,
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'owner/vehicles/add',
        name: 'AddVehicle',
        component: VehicleFormSteps,
        props: {
          initialVehicle: {},
          isEditMode: false,
        },
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'owner/motorcycles/add',
        name: 'AddMotorcycle',
        component: MotorcycleFormSteps,
        props: {
          initialVehicle: {},
          isEditMode: false,
        },
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'owner/vehicles/edit/:vehicleId',
        name: 'EditVehicle',
        component: EditVehicleView,
        props: true,
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'owner/bookings',
        name: 'OwnerBookings',
        component: OwnerBookingsView,
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'admin',
        component: AdminLayout,
        redirect: { name: 'AdminDashboard' },
        children: [
          {
            path: 'dashboard',
            name: 'AdminDashboard',
            component: AdminDashboardView,
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
          {
            path: 'users',
            name: 'AdminUsers',
            component: AdminUsersView,
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
          {
            path: 'vehicles',
            name: 'AdminVehicles',
            component: AdminVehiclesView,
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
          {
            path: 'bookings',
            name: 'AdminBookings',
            component: AdminBookingsView,
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
          {
            path: 'host-applications',
            name: 'AdminHostApplications',
            component: AdminHostApplicationsView,
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
          {
            path: 'driver-applications',
            name: 'AdminDriveApplications',
            component: () => import('@/views/Dashboard/Admin/AdminDriveApplicationsView.vue'),
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
          {
            path: 'reports',
            name: 'AdminReports',
            component: () => import('@/views/Dashboard/Admin/AdminReportsView.vue'),
            meta: { requiresAuth: true, authorize: ['admin'] },
          },
        ],
      },
      {
        path: '',
        redirect: {
          name: 'MyBookings',
        },
      },
    ],
  },
];

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactView,
  },
  {
    path: '/how-it-works',
    name: 'HowItWorks',
    component: HowItWorksView,
  },
  {
    path: '/careers',
    name: 'Careers',
    component: CareersView,
  },
  {
    path: '/blog',
    name: 'Blog',
    component: BlogView,
  },
  {
    path: '/blog/:slug',
    name: 'BlogPostDetail',
    component: BlogPostDetailView,
    props: true // This will pass the 'slug' as a prop
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQView,
  },
  {
    path: '/vehicles',
    name: 'VehicleList',
    component: VehicleListView,
  },
  {
    path: '/vehicles/:id',
    name: 'VehicleDetail',
    component: VehicleDetailView,
    props: true,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },

  {
    path: '/become-a-host',
    name: 'BecomeOwnerApplication',
    component: BecomeOwnerApplication,
    meta: {
      requiresAuth: true,
      authorize: ['renter'],
      requiresDriveVerified: true,
    },
  },
  {
      path: '/application-submitted',
      name: 'ApplicationSubmitted',
      component: ApplicationSubmittedView,
      meta: { requiresAuth: true },
    },
  {
    path: '/users/:userId',
    name: 'UserProfileView',
    component: ProfileSettingsView,
    props: true,
  },
  {
    path: '/booking/verify-payment/:bookingId',
    name: 'PaymentVerification',
    component: OwnerBillingView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/booking/summary/:bookingId',
    name: 'BookingSummary',
    component: BookingSummaryView,
    props: true,
    meta: {
      requiresAuth: true,
      authorize: ['renter', 'owner', 'admin'],
    },
  },
  {
      path: '/booking-status/:bookingId',
      name: 'BookingStatus',
      component: BookingStatusView,
      props: true,
      meta: { requiresAuth: true },
    },

  {
    path: '/chat/:chatId',
    name: 'ChatConversation',
    component: ChatView,
    props: true,
    meta: { requiresAuth: true },
  },
  // --- ADDED TRUST & SAFETY ROUTE ---
  {
    path: '/trust-and-safety',
    name: 'TrustAndSafety',
    component: () => import('../views/TrustAndSafetyView.vue') // Lazy load for example
  },
  // --- END ADD ---
  ...dashboardRoutes,
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});


router.beforeEach(async (to, from, next) => {
  const isAuthReady = store.getters.isAuthReady;

  if (!isAuthReady) {
    await store.dispatch('initializeAuth');
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const authorizedRoles = to.meta.authorize;
  const isAuthenticated = store.getters.isAuthenticated;
  const userRole = store.getters.userRole;


  const isApprovedToDrive = store.state.user?.isApprovedToDrive || false;

  const requiresDriveVerified = to.matched.some((record) => record.meta.requiresDriveVerified);

  if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    if (userRole === 'admin') {
      next('/dashboard/admin/dashboard');
    } else if (userRole === 'owner') {
      next('/dashboard/owner/vehicles');
    } else {
      next('/dashboard/my-bookings');
    }
  } else if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (
    requiresAuth &&
    authorizedRoles &&
    !authorizedRoles.includes(userRole)
  ) {
    console.warn(
      `[Router Guard] User role '${userRole}' not authorized for route '${to.path}'. Redirecting.`
    );
    if (userRole === 'admin') {
        next('/dashboard/admin/dashboard');
    } else if (userRole === 'owner') {
        next('/dashboard/owner/vehicles');
    } else {
        next('/dashboard/my-bookings');
    }
  }

  else if (requiresDriveVerified && !isApprovedToDrive && userRole === 'renter') {
    console.warn(`[Router Guard] User not approved to drive. Redirecting to driver verification.`);
    next({ name: 'BecomeDriveVerified' });
  }
  else {
    next();
  }
});

export default router;