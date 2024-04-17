<template>
    <main id="login">
        <article>
            <img src="../assets/login.jpg" alt="login page img">
        </article>
        <article>
            <h2>Log in</h2>
            <form action="POST">
                <label for="username">Enter your username :</label>
                <input type="text" id="username">
                <label for="password">Enter your password :</label>
                <input type="text" id="password">

                <input type="submit" value="Log in">

                <p>If you don't have an account, <router-link to="/signup">create one by clicking here !</router-link></p>
            </form>
        </article>
    </main>
</template>

<script>
export default {
    name: 'Login',
}
</script>