<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/header.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <Header msg="aaa"/> -->
    <!-- <nav>
    </nav> -->
    <!-- 路由规则生效配置 -->
    <router-view/>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import Header from './components/Header.vue'
export default {
  name: 'App',
  components: {
    
    // Header
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
