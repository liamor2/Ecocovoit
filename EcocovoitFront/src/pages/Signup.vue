<template>
    <main id="login">
        <article>
            <img src="../assets/login.jpg" alt="login page img">
        </article>
        <article>
            <h2>Sign up</h2>
            <form action="POST">
                <label for="username">Username :</label>
                <input type="text" id="username">
                <label for="password">Password :</label>
                <input type="text" id="password">
                <label for="email">Email :</label>
                <input type="text" id="email">
                <label for="city">City :</label>
                <input type="text" id="city">
                <label for="street">Street :</label>
                <input type="text" id="street">
                <label for="postalCode">Postal code :</label>
                <input type="text" id="postalCode">

                <input type="submit" value="Sign up">
            </form>
        </article>
    </main>
</template>

<script>
export default {
    name: 'Signup',
}
</script>