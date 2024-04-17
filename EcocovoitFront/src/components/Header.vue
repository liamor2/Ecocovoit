<template>
    <header>
        <div>
            <router-link to="/">
                <img src="../assets/logo-ecocovoit.png" alt="logo ecocovoit">
                <h1>Ecocovoit</h1>
            </router-link>
            <router-link to="/">Home</router-link>
            <router-link to="/Trips">Trips</router-link>
            <router-link to="/statistics">Statistics</router-link>
            <router-link to="/account">Account</router-link>
        </div>
        <router-link to="/login">Login/Signup</router-link>
    </header>

</template>

<script>
export default {
    name: 'Header'
}
</script>