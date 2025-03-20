<template>
  <div class="bottom-nav">
    <div 
      v-for="(item, index) in navItems" 
      :key="index" 
      class="nav-item"
      @click="handleNav(item.path)"
    >
      <i :class="item.icon" class="nav-icon"></i>
      <span class="nav-text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      navItems: [
        { text: '下厨房', icon: 'el-icon-s-home', path: '/main' },
        { text: '菜篮子', icon: 'el-icon-dish', path: '/foodsBasket' },
        { text: '收藏', icon: 'el-icon-star-off', path: '/favorites' },
        { text: '我的', icon: 'el-icon-user', path: '/profile' }
      ]
    }
  },
  methods: {
    handleNav(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    }
  },
  // 样式部分保持原样即可
  // ... 原有样式代码 ...
}
</script>

<style scoped>
/* 原有底部导航样式保持不变 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 1000;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-icon {
  font-size: 24px;
  color: #666;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.nav-text {
  font-size: 12px;
  color: #666;
}

.nav-item:hover {
  background: #f8f8f8;
}

.nav-item:hover .nav-icon {
  transform: scale(1.2);
  color: #409EFF;
}

/* 添加激活状态样式 */
.nav-item.router-link-active .nav-icon,
.nav-item.router-link-active .nav-text {
  color: #409EFF;
  font-weight: bold;
}
</style> 