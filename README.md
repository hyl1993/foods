# sa-token

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


目录结构
src/
├── assets/               # 静态资源
├── components/           # 组件
│   ├── Header.vue        # 顶部标题与直播信息
│   ├── Navigation.vue    # 分类导航栏
│   ├── LiveBanner.vue    # 直播预约横幅
│   ├── RecipeCard.vue    # 菜品卡片
│   └── UserMenu.vue      # 用户功能区（收藏/我的）
├── store/                # Vuex 状态管理
│   └── index.js         
└── views/
    └── Home.vue         # 主页面