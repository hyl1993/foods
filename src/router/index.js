import Vue from 'vue'
import VueRouter from 'vue-router'
import { Message } from 'element-ui'

Vue.use(VueRouter)

// 解决重复导航的错误
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onComplete, onAbort) {
  if (onComplete || onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('@/views/Main.vue'),
    meta: { requiresAuth: true },
    
  },
  {
    path: '/homedish',
    name: 'HomeDish',
    component: () => import('@/views/HomeDish.vue'),
    meta: { requiresAuth: true }
  }, 
  {
    path: '/breakfast',
    name: 'Breakfast',
    component: () => import('@/views/Breakfast.vue'),
    meta: { requiresAuth: true }
  }, 
  {
    path: '/baking',
    name: 'Baking',
    component: () => import('@/views/Baking.vue'),
    meta: { requiresAuth: true }
  }, 
  {
    path: '/dishes',
    name: 'Dishes',
    component: () => import('@/views/Dishes.vue'),
    meta: { requiresAuth: true }
  }, 
  {
    path: '/foodsBasket',
    name: 'FoodsBasket',
    component: () => import('@/views/FoodsBasket.vue'),
    meta: { requiresAuth: true }
  },
 
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 修改导航守卫逻辑
router.beforeEach((to, from, next) => {
  // 获取token
  const token = localStorage.getItem('token')
  
  // 白名单，不需要登录的路由
  //const whiteList = ['/login','/main']
  const whiteList = ['/']
  // 在白名单中
  if (whiteList.includes(to.path)) {
      next()
     return
  }
  
  // 不在白名单中，检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      Message.warning('请先登录')
      next({
        path: '/'
      })
    } else {
      next()
    }
    return
  }
  
  // 其他情况
  next()
})

// 添加全局后置钩子
router.afterEach(() => {
  // 处理加载状态
  // 可以在这里关闭loading等
})

export default router
