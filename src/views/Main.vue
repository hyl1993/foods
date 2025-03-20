<template>
  <div class="home-container">
    <el-carousel 
      :interval="2000" 
      height="40vh"
      class="top-carousel"
    >
      <el-carousel-item v-for="(img, index) in carouselImages" :key="index">
        <img 
          :src="require(`@/assets/${img}`)" 
          alt="轮播图"
          class="carousel-image"
        >
      </el-carousel-item>
    </el-carousel>
    <div class="fixed-header">
      <div class="search-container">
        <el-input 
          v-model="searchQuery"
          placeholder="请输入菜品名称、类型或标签"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <el-button 
            slot="append" 
            icon="el-icon-search"
            :loading="loading"
            @click="handleSearch"
          />
        </el-input>
      </div>
      <div class="category-container">
        <div class="category-row">
          <div 
            v-for="(category, index) in categories" 
            :key="index" 
            class="category-item"
            @mouseenter="hoverIndex = index"
            @mouseleave="hoverIndex = -1"
            @click="handleCategory(category)"
          >
            <img 
              :src="require(`@/assets/icons/${category}.png`)" 
              class="category-icon"
              :style="{
                transform: hoverIndex === index ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }"
            >
            <div class="category-text">{{ category }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-content">
      <div class="content-section">
        <template v-if="searchQuery && searchResults.length > 0">
          <div 
            v-for="(item, index) in searchResults" 
            :key="index"
            class="dish-card"
          >
            <div class="dish-content">
              <img 
                :src="item.imageUrl" 
                :alt="item.name"
                class="dish-image"
                @click="showLargeImage(item.imageUrl)"
              >
              <div class="dish-info">
                <h3 class="dish-name">{{ item.name }}</h3>
                <p class="dish-desc">{{ item.description }}</p>
                <div class="dish-footer">
                  <span class="dish-price">¥{{ item.price }}</span>
                  <div class="dish-tags">
                    <span 
                      v-for="tag in item.tags" 
                      :key="tag" 
                      class="tag"
                    >{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <div v-else-if="searchQuery && !searchResults.length" class="no-result">
          未找到相关菜品，请尝试其他关键词
        </div>
        
        <div v-else class="default-content">
          <div v-for="item in mockData" :key="item.name" class="dish-card">
            <div class="dish-content">
              <img 
                :src="item.imageUrl" 
                :alt="item.name"
                class="dish-image"
                @click="showLargeImage(item.imageUrl)"
              >
              <div class="dish-info">
                <h3 class="dish-name">{{ item.name }}</h3>
                <p class="dish-desc">{{ item.description }}</p>
                <div class="dish-footer">
                  <span class="dish-price">¥{{ item.price }}</span>
                  <div class="dish-tags">
                    <span 
                      v-for="tag in item.tags" 
                      :key="tag" 
                      class="tag"
                    >{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <bottom-nav />
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
  </div>
</template>

<script>
//import axios from 'axios'
import BottomNav from '@/components/BottomNav.vue'
import request from '@/utils/request'
export default {
  components: {
    BottomNav
  },
  data() {
    return {
      carouselImages: [
        'slide1.png',
        'slide2.png',
        'slide3.png'
      ],
      searchQuery: '',
      mockData: [
         
      ],
      searchResults: [],
      loading: false,
      categories: ['家常菜',  '早餐', '烘焙', '更多'],
      hoverIndex: -1,
      imagePreviewVisible: false,
      previewImageUrl: ''
    }
  },
  created() {
    this.fetchDish()
  },
  methods: {  

    async fetchDish() {
      const res = await request.get('/dishes')
      console.log(res.records);
      res.records.forEach(item => {
     
         item.tags = ['早餐','家常菜']
      })
      this.mockData = res.records;
    },
    async handleSearch() {
      const query = this.searchQuery.trim();
      console.log(query);
      // 空查询处理
      if (!query) {
        this.searchResults = [];
        // this.mockData = [];  // 清空搜索结果
        return;
      }

      try {
        this.loading = true;
        
        // 模拟加载延迟
      //  await new Promise(resolve => setTimeout(resolve, 500));
        
        // 发起搜索请求
        const res = await request.get('/dishes/search', {
          params: {
            keyword: query.toLowerCase()
          }
        });
        console.log(res);
        // 更新数据
        this.searchResults = Array.isArray(res) ? res : [];
        console.log('搜索结果数量:', this.searchResults.length);
        console.log(this.searchResults);
        // 如果没有结果
        if (!this.searchResults.length) {
          this.$message.info('未找到相关菜品');
        }
        
      } catch (error) {
        console.error('搜索失败:', error);
        this.$message.error('搜索请求失败，请稍后重试');
        this.mockData = [];  // 清空搜索结果
      } finally {
        this.loading = false;
      }
    },
    handleCategory(category) {
      let path = '/homedish'  // 默认路径
      
      switch(category) {
        case '家常菜':
          path = '/homedish'
          break
        case '早餐':
          path = '/breakfast'
          break
        case '烘焙':
          path = '/baking'
          break
        case '更多':
          path = '/dishes'
          break
        default:
          path = '/main'
      }

      try {
        this.$router.push(path).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('导航错误:', err)
          }
        })
      } catch (error) {
        console.error('跳转错误:', error)
      }
    },
    handleMouseEnter(index) {
      this.hoverIndex = index
      this.$forceUpdate()
    },
    handleMouseLeave() {
      this.hoverIndex = -1
      this.$forceUpdate()
    },
    showLargeImage(url) {
      this.previewImageUrl = url
      this.imagePreviewVisible = true
    }
  },
  //键盘输入自动搜索功能
  watch: {
    searchQuery(newVal) {
      if (!newVal.trim()) {
        this.searchResults = [];
      } else {
        this.handleSearch();
      }
    }
  }
}
</script>

<style scoped>
.home-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.top-carousel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: calc(40vh - 10px) !important;
  overflow: hidden;
}

.el-carousel__item {
  height: 40vh !important;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
  object-position: center center;
}

.el-carousel__mask,
.el-carousel__arrow {
  display: none;
}

.fixed-header {
  position: fixed;
  top: calc(40vh - 10px);
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 5px 0 0;
}

.page-content {
  margin-top: calc(40vh + 140px);
  height: calc(60vh - 180px);
  padding-bottom: 60px;
  overflow-y: auto;
}

.page-content::-webkit-scrollbar {
  width: 8px;
  background-color: #f5f5f5;
}

.page-content::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #c1c1c1;
}

.page-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.demo-content {
  padding: 20px;
  margin: 10px auto;
  max-width: 800px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.category-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  margin: 10px auto;
}

.category-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 0 15px;
  max-width: 600px;
  margin: 0 auto;
}

.category-item {
  position: relative;
  overflow: hidden;
  flex: 0 0 22%;
  min-width: 70px;
  margin: 0 2px;
  transition: none !important;
}

.category-icon {
  position: relative;
  z-index: 1;
  width: 50px;
  height: 50px;
  cursor: pointer;
}

.category-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.05);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.category-item:hover::after {
  opacity: 1;
}

.category-item:hover {
  transform: none;
}

.category-item:hover .category-icon {
  transform: scale(1.15);
  filter: 
    brightness(1.15) 
    saturate(1.2)
    drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.category-item:hover .category-text {
  transform: translateY(2px);
}

.category-text {
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
  color: #666;
  transition: all 0.3s ease-out;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .category-row {
    padding: 0 10px;
  }
  .category-item {
    flex: 0 0 24%;
  }
  .category-icon {
    width: 40px;
    height: 40px;
  }
}

@media (hover: none) {
  .category-item:hover .category-icon {
    transform: none;
    filter: none;
  }
}

.category-item:active {
  transform: none !important;
}

.dish-card {
  background: white;
  border-radius: 8px;
  margin: 12px auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
  transition: transform 0.2s ease;
}

.dish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.dish-content {
  display: flex;
  align-items: center;
}

.dish-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.dish-image:hover {
  transform: scale(1.02);
}

.dish-info {
  margin-left: 15px;
  flex: 1;
  min-width: 0;
}

.dish-name {
  font-size: 15px;
  color: #333;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dish-price {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
}

.dish-tags {
  display: flex;
  gap: 8px;
}

.dish-tags .tag {
  font-size: 12px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 12px;
}

.no-result {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

@media (max-width: 768px) {
  .dish-card {
    padding: 10px;
    margin: 8px auto;
  }
  
  .dish-image {
    width: 80px;
    height: 80px;
  }
  
  .dish-info {
    margin-left: 10px;
  }
  
  .dish-desc {
    -webkit-line-clamp: 3;
  }
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
</style>







