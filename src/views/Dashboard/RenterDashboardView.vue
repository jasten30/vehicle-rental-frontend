<!-- frontend/src/views/Dashboard/RenterDashboardView.vue -->

<template>
    <div class="renter-dashboard-container">
        <h1 class="page-title">Renter Dashboard</h1>

        <nav class="dashboard-nav">
            <router-link to="/dashboard/my-bookings" class="nav-link" active-class="active-link">My Bookings</router-link>
            <router-link to="/dashboard/profile" class="nav-link" active-class="active-link">Profile Settings</router-link>
        </nav>

        <div class="dashboard-content">
            <router-view></router-view> <!-- This will render MyBookings or ProfileSettings -->
        </div>
    </div>
</template>

<script>
export default {
    name: 'RenterDasboardView',
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.renter-dashboard-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    background-color: $background-color;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-medium;
}

.page-title {
    font-size: 2.8rem;
    font-weight: 800;
    color: $primary-color;
    text-align: center;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        font-size: 2.2rem;
    }
}

.dashboard-nav {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 1rem;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }
}

.nav-link {
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    color: $text-color-medium;
    font-weight: 600;
    font-size: 1.1rem;
    border-radius: $border-radius-md;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: lighten($primary-color, 45%);
        color: $primary-color;
        transform: translateY(-2px);
    }

    &.active-link {
        background-color: $primary-color;
        color: white;
        box-shadow: $shadow-light;
        transform: translateY(-1px);
    }
}

.dashboard-content {
    background-color: $card-background;
    padding: 2rem;
    border-radius: $border-radius-md;
    box-shadow: $shadow-light;
}
</style>