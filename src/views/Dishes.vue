<template>
   
  <div>
    <!-- 添加购物篮图标 -->
    <div class="cart-icon">
      <el-badge :value="cartCount" class="cart-badge">
        <i class="el-icon-shopping-cart-2" @click="showCart"></i>
      </el-badge>
    </div>

    <!-- 添加搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入菜品名称搜索"
        class="search-input"
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch">
          搜索
        </el-button>
      </el-input>
    </div>

    <!-- 添加全选功能 -->
    <div class="select-all-container">
      <el-checkbox 
        v-model="isAllSelected"
        @change="toggleSelectAll"
        class="select-all-checkbox"
      >全选（{{ selectedCount }} / {{ filteredResults.length }}）</el-checkbox>
    </div>
      
      
     
     <div class="dish-list" >
    
          <div class="results-container">
              <div 
                  v-for="(result, index) in filteredResults" 
                  :key="index"
                  class="result-item"
              >
                  <el-checkbox 
                    v-model="result.selected"
                    @change="handleSelect"
                  ></el-checkbox>
                  <div class="dish-info">
                      <img :src="result.imageUrl" :alt="result.name" class="dish-image" @click="showLargeImage(result.imageUrl)">
                      <div class="dish-details">
                          <h3>{{ result.name }}</h3>
                          <p class="description">{{ result.description }}</p>
                          <div class="price-tag">
                              <span class="price">¥{{ result.price }}</span>
                              <span class="tag" v-for="tag in result.tags" :key="tag">{{ tag }}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <!-- <bottom-nav /> -->
        <!-- 添加弹窗 -->
    <el-dialog 
      :visible.sync="imagePreviewVisible" 
      :show-close="false"
      width="90%"
      top="5vh"
      custom-class="image-preview-dialog"
    >
      <img 
        :src="previewImageUrl" 
        class="preview-image"
        @click="imagePreviewVisible = false"
      >
    </el-dialog>

    <!-- 添加按钮 -->
    <div class="add-to-cart" v-show="hasSelectedItems">
      <el-badge :value="selectedCount" class="selected-badge">
        <el-button type="primary" @click="addToCart">添加选中菜品</el-button>
      </el-badge>
    </div>
  </div>
</template>
<script>
import BottomNav from '@/components/BottomNav.vue'
import request from '@/utils/request'
import { getUserInfo } from '@/utils/auth'
export default {
components: {
  BottomNav
},
data() {
  return {
    searchQuery: '',      // 绑定搜索框输入
    
    filteredResults: [],
    searchResults: [],
    imagePreviewVisible: false,
    previewImageUrl: '',
    cartCount: 0,
    hasSelectedItems: false,
    userInfo: getUserInfo(),
  }
},

created() {
  this.fetchDish()
  this.fetchCartCount()
},

methods: {
  async handleSearch() {
    try {
      const res = await request.get('/dishes/search', {
        params: {
          keyword: this.searchQuery
        }
      })
      console.log('搜索结果:', res);
      res.forEach(item => {
        item.tags = ['早餐','家常菜']
        item.selected = false
      })
      this.filteredResults = res;
    } catch (error) {
      console.error('搜索失败:', error);
      this.$message.error('搜索失败，请重试');
    }
  },

  async fetchDish() {
    const res = await request.get('/dishes/search')
    console.log(res.records);
    res.forEach(item => {
      item.tags = ['早餐','家常菜']
      item.selected = false
    })
    this.filteredResults = res;
  },

  showLargeImage(url) {
      this.previewImageUrl = url
      this.imagePreviewVisible = true
    },  

  handleSelect() {
    this.hasSelectedItems = this.filteredResults.some(item => item.selected);
  },

  async addToCart() {
    try {
      const selectedDishes = this.filteredResults
        .filter(item => item.selected)
        .map(item => item.id);
      
      // if (selectedDishes.length > 5) {
      //   this.$message.warning('最多只能选择5个菜品');
      //   return;
      // }

      const idList = selectedDishes.join(',');
      await request.post('/basket/add', {
        userId: this.userInfo.id, 
        dishIds: idList
      },{
          headers: { 'Content-Type': 'multipart/form-data' }
        })
     
      this.$message.success('添加成功')
      await this.fetchCartCount()
      this.filteredResults.forEach(item => item.selected = false)
      this.hasSelectedItems = false
    } catch (error) {
      console.error('添加失败:', error)
      this.$message.error('添加失败，请重试')
      this.filteredResults.forEach(item => item.selected = false)
      this.hasSelectedItems = false
    }
  },

  async fetchCartCount() {
    try {
      const res = await request.post('/basket/count', {
        userId: this.userInfo.id
      },{
          headers: { 'Content-Type': 'multipart/form-data' }
        })
 
      this.cartCount =res
    } catch (error) {
      console.error('获取购物车数量失败:', error)
    }
  },

  showCart() {
    // 跳转到c菜篮子页面
    this.$router.push('/foodsBasket')
  },

  toggleSelectAll(value) {
    this.filteredResults.forEach(item => {
      item.selected = value;
    });
    this.handleSelect();
  }
},

computed: {
  selectedCount() {
    return this.filteredResults.filter(item => item.selected).length;
  },
  selectedNames() {
    return this.filteredResults
      .filter(item => item.selected)
      .map(item => item.name)
      .join('\n');
  },
  isAllSelected: {
    get() {
      return this.filteredResults.length > 0 && 
             this.filteredResults.every(item => item.selected);
    },
    set(value) {
      this.filteredResults.forEach(item => {
        item.selected = value;
      });
    }
  }
}
}
</script>

<style scoped>
/* 添加图片交互样式 */
.dish-image {
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.dish-image:hover {
  transform: scale(1.02);
}

/* 弹窗样式 */
:deep(.image-preview-dialog) {
  background: rgba(0,0,0,0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  cursor: zoom-out;
}
.search-container {
padding: 0 20px 5px;
position: relative;
max-width: 800px;
margin-left: auto;
margin-right: auto;
margin-bottom: 10px;
}

.search-input {
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
border-radius: 30px;
}

::v-deep .el-input__inner {
border-radius: 30px;
height: 50px;
padding: 0 25px;
}

::v-deep .el-input-group__append {
border-radius: 0 30px 30px 0;
background: #409EFF;
border: none;
padding: 0 25px;
}

.el-input-group__append .el-button {
color: white;
font-size: 18px;
}

.search-result {
margin: 20px 0;
}

.search-text {
padding: 10px;
color: #666;
font-size: 14px;
border-bottom: 1px solid #eee;
}

.results-container {
  /* 使用视窗高度，减去其他元素的高度 */
  height: calc(100vh - 60px);  /* 假设顶部导航/搜索框等高度为60px，根据实际调整 */
  max-height: none;  /* 移除最大高度限制 */
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0 auto;  /* 水平居中 */
  width: 100%;     /* 占满容器宽度 */
  padding: 20px;   /* 添加内边距 */
  box-sizing: border-box;  /* 确保padding不会增加总宽度 */
}

/* 如果需要在大屏幕上限制最大宽度 */
@media (min-width: 1200px) {
  .results-container {
    max-width: 1200px;  /* 在大屏幕上限制最大宽度 */
  }
}

/* 在移动设备上调整 */
@media (max-width: 768px) {
  .results-container {
    height: calc(100vh - 50px);  /* 移动端可能导航栏更小 */
    padding: 10px;  /* 减小内边距 */
  }
}

.result-item {
padding: 15px;
border-bottom: 1px solid #eee;
transition: all 0.3s ease;
display: flex;
align-items: center;
gap: 15px;
}

.result-item:hover {
background-color: #f8f8f8;
transform: translateY(-2px);
}

.dish-info {
display: flex;
gap: 15px;
}

.dish-image {
width: 120px;
height: 120px;
object-fit: cover;
border-radius: 8px;
}

.dish-details {
flex: 1;
}

.dish-details h3 {
margin: 0 0 8px 0;
color: #333;
font-size: 18px;
}

.description {
color: #666;
font-size: 14px;
margin: 8px 0;
line-height: 1.4;
}

.price-tag {
display: flex;
align-items: center;
gap: 10px;
margin-top: 10px;
}

.price {
color: #ff6b6b;
font-weight: bold;
font-size: 18px;
}

.tag {
padding: 4px 8px;
background: #f0f0f0;
border-radius: 12px;
font-size: 12px;
color: #666;
}

.cart-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
}

.cart-badge :deep(.el-badge__content) {
  background-color: #ff4949;
}

.cart-icon i {
  font-size: 24px;
  color: #409EFF;
}

.add-to-cart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  padding: 12px 20px;
  background: #fff;
  border-radius: 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.selected-badge :deep(.el-badge__content) {
  transform: translate(80%, -80%);
  background-color: #67c23a;
}

.tip-text {
  color: #666;
  font-size: 14px;
  cursor: help;
  border-bottom: 1px dotted #999;
}

:deep(.el-tooltip__popper) {
  max-width: 300px;
  white-space: pre-wrap; /* 保留换行符 */
  text-align: left;
  line-height: 1.5;
}

.el-checkbox {
  margin-right: 10px;
}

.select-all-container {
  padding: 0 20px;
  margin: 10px auto;
  max-width: 800px;
}

.select-all-checkbox {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

::v-deep .select-all-checkbox .el-checkbox__label {
  font-size: 14px;
}
</style>