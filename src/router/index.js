import { createRouter, createWebHistory } from 'vue-router';
import store from '../store'; // Import the Vuex store

// Public Views
import HomeView from '../views/HomeView.vue';
import VehicleListView from '../views/Vehicle/VehicleListView.vue';
import VehicleDetailView from '../views/Vehicle/VehicleDetailView.vue';
import LoginView from '../views/Auth/LoginView.vue';
import RegisterView from '../views/Auth/RegisterView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import BecomeOwnerApplication from '../views/Auth/BecomeOwnerApplication.vue';

// Dashboard Views
import DashboardLayout from '../views/Dashboard/DashboardLayout.vue';
import MyBookingsView from '../views/Dashboard/MyBookings.vue';
import BookingDetailView from '../views/Dashboard/BookingDetailView.vue';
import ProfileSettingsView from '../views/Dashboard/ProfileSettings.vue';
import OwnerVehiclesView from '../views/Dashboard/Owner/OwnerVehiclesView.vue';
import VehicleFormSteps from '../components/forms/VehicleFormSteps.vue';
import BookingPaymentView from '../views/Booking/BookingPaymentView.vue';
import BookingSummaryView from '../views/Booking/BookingSummaryView.vue';
import OwnerBookingsView from '../views/Dashboard/Owner/OwnerBookingsView.vue';
import AdminVehiclesView from '../views/Dashboard/Admin/AdminVehiclesView.vue';
import AdminBookingsView from '../views/Dashboard/Admin/AdminBookingsView.vue';
import AdminUsersView from '../views/Dashboard/Admin/AdminUsersView.vue';
import AdminDashboardView from '../views/Dashboard/Admin/AdminDashboardView.vue';

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
        path: 'owner/vehicles',
        name: 'OwnerVehicles',
        component: OwnerVehiclesView,
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
        },
        meta: {
          requiresAuth: true,
          authorize: ['owner', 'admin'],
        },
      },
      {
        path: 'owner/vehicles/edit/:vehicleId',
        name: 'EditVehicle',
        component: VehicleFormSteps,
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
        path: 'admin/vehicles',
        name: 'AdminVehicles',
        component: AdminVehiclesView,
        meta: {
          requiresAuth: true,
          authorize: ['admin'],
        },
      },
      {
        path: 'admin/bookings',
        name: 'AdminBookings',
        component: AdminBookingsView,
        meta: {
          requiresAuth: true,
          authorize: ['admin'],
        },
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: AdminUsersView,
        meta: {
          requiresAuth: true,
          authorize: ['admin'],
        },
      },
      {
        path: 'admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardView,
        meta: {
          requiresAuth: true,
          authorize: ['admin'],
        },
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
    },
  },
  {
    path: '/users/:userId',
    name: 'UserProfileView',
    component: ProfileSettingsView,
    props: true,
  },
  {
    path: '/booking/payment/:bookingId',
    name: 'BookingPayment',
    component: BookingPaymentView,
    props: true,
    meta: {
      requiresAuth: true,
      authorize: ['renter', 'owner', 'admin'],
    },
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

// The central navigation guard
router.beforeEach(async (to, from, next) => {
  // Calls the getter from the root store
  const isAuthReady = store.getters.isAuthReady;

  if (!isAuthReady) {
    // Dispatches the action from the root store
    await store.dispatch('initializeAuth');
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const authorizedRoles = to.meta.authorize;

  // Gets the latest state from the root store
  const isAuthenticated = store.getters.isAuthenticated;
  const userRole = store.getters.userRole;

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
      `[Router Guard] User role '${userRole}' not authorized for route '${to.path}'.`
    );
    next('/dashboard');
  } else {
    next();
  }
});

export default router;