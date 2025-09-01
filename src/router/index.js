import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from 'firebase/auth';

// Public Views
import HomeView from "../views/HomeView.vue";
import VehicleListView from "../views/Vehicle/VehicleListView.vue";
import VehicleDetailView from "../views/Vehicle/VehicleDetailView.vue";
import LoginView from "../views/Auth/LoginView.vue";
import RegisterView from "../views/Auth/RegisterView.vue";
import NotFoundView from "../views/NotFoundView.vue";

// Dashboard Views
import DashboardLayout from "../views/Dashboard/DashboardLayout.vue";
import MyBookingsView from "../views/Dashboard/MyBookings.vue";
import BookingDetailView from "../views/Dashboard/BookingDetailView.vue";
import ProfileSettingsView from "../views/Dashboard/ProfileSettings.vue";
import OwnerVehiclesView from "../views/Dashboard/Owner/OwnerVehiclesView.vue";
import VehicleFormSteps from "../components/forms/VehicleFormSteps.vue";
import BookingPaymentView from "../views/Booking/BookingPaymentView.vue";
import BookingSummaryView from "../views/Booking/BookingSummaryView.vue";
import OwnerBookingsView from "../views/Dashboard/Owner/OwnerBookingsView.vue";
import AdminVehiclesView from "../views/Dashboard/Admin/AdminVehiclesView.vue";
import AdminBookingsView from "../views/Dashboard/Admin/AdminBookingsView.vue";
import AdminUsersView from "../views/Dashboard/Admin/AdminUsersView.vue";
import AdminDashboardView from '../views/Dashboard/Admin/AdminDashboardView.vue';

const dashboardRoutes = [{
    path: "/dashboard",
    component: DashboardLayout,
    meta: {
        requiresAuth: true
    },
    children: [{
            path: "my-bookings",
            name: "MyBookings",
            component: MyBookingsView,
            meta: {
                requiresAuth: true,
                authorize: ['renter', 'admin', 'owner']
            },
        },
        {
            path: "my-bookings/:bookingId",
            name: "BookingDetails",
            component: BookingDetailView,
            props: true,
            meta: {
                requiresAuth: true,
                authorize: ['renter', 'admin', 'owner']
            },
        },
        {
            path: "profile-settings",
            name: "ProfileSettings",
            component: ProfileSettingsView,
            meta: {
                requiresAuth: true,
                authorize: ['renter', 'admin', 'owner']
            },
        },
        // Owner specific routes
        {
            path: "owner/vehicles",
            name: "OwnerVehicles",
            component: OwnerVehiclesView,
            meta: {
                requiresAuth: true,
                authorize: ['owner', 'admin']
            },
        },
        {
            path: "owner/vehicles/add",
            name: "AddVehicle",
            component: VehicleFormSteps,
            props: {
                initialVehicle: {}
            },
            meta: {
                requiresAuth: true,
                authorize: ['owner', 'admin']
            },
        },
        {
            path: "owner/vehicles/edit/:vehicleId",
            name: "EditVehicle",
            component: VehicleFormSteps,
            props: true,
            meta: {
                requiresAuth: true,
                authorize: ['owner', 'admin']
            },
        },
        {
            path: "owner/bookings",
            name: "OwnerBookings",
            component: OwnerBookingsView,
            meta: {
                requiresAuth: true,
                authorize: ['owner', 'admin']
            },
        },
        // Admin specific routes
        {
            path: "admin/vehicles",
            name: "AdminVehicles",
            component: AdminVehiclesView,
            meta: {
                requiresAuth: true,
                authorize: ['admin']
            },
        },
        {
            path: "admin/bookings",
            name: "AdminBookings",
            component: AdminBookingsView,
            meta: {
                requiresAuth: true,
                authorize: ['admin']
            },
        },
        {
            path: "admin/users",
            name: "AdminUsers",
            component: AdminUsersView,
            meta: {
                requiresAuth: true,
                authorize: ['admin']
            },
        },
        // ADMIN DASHBOARD ROUTE
        {
            path: 'admin/dashboard',
            name: 'AdminDashboard',
            component: AdminDashboardView,
            meta: {
                requiresAuth: true,
                authorize: ['admin']
            }
        },
        {
            path: "", // Default dashboard route
            redirect: {
                name: "MyBookings"
            },
        },
    ],
}];

const routes = [{
        path: "/",
        name: "Home",
        component: HomeView,
    },
    {
        path: "/vehicles",
        name: "VehicleList",
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
    // Route for payment selection
    {
        path: "/booking/payment/:bookingId",
        name: "BookingPayment",
        component: BookingPaymentView,
        props: true,
        meta: {
            requiresAuth: true,
            authorize: ['renter', 'owner', 'admin']
        },
    },
    // Route for booking summary (after payment selection)
    {
        path: "/booking/summary/:bookingId",
        name: "BookingSummary",
        component: BookingSummaryView,
        props: true,
        meta: {
            requiresAuth: true,
            authorize: ['renter', 'owner', 'admin']
        },
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
    const auth = getAuth();

    // Wait for the Firebase auth state to be ready
    const user = await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
            unsubscribe();
            resolve(firebaseUser);
        });
    });

    if (requiresAuth && !user) {
        console.log('[Router Guard] Not authenticated. Redirecting to login.');
        next('/login');
    } else if (requiresAuth && user && authorizedRoles) {
        // CRITICAL FIX: Force refresh the token to get the latest custom claims.
        // This prevents the issue of using a stale token with outdated role data.
        try {
            const idTokenResult = await user.getIdTokenResult(true);
            const userRole = idTokenResult.claims.role || 'renter'; // Default to 'renter' if no role is found.

            if (authorizedRoles.includes(userRole)) {
                console.log(`[Router Guard] User role '${userRole}' is authorized. Proceeding.`);
                next();
            } else {
                console.warn(`[Router Guard] User role '${userRole}' not authorized for route '${to.path}'.`);
                next('/dashboard');
            }
        } catch (error) {
            console.error('[Router Guard] Error fetching ID token:', error);
            // In case of an error, redirect to login to force a re-authentication
            next('/login');
        }
    } else {
        console.log('[Router Guard] No auth required or already authenticated. Proceeding.');
        next();
    }
});

export default router;
