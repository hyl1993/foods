<template>
  <div class="favorites-container">
    <!-- 顶部标题 -->
    <div class="page-header">
      <!-- 表示深黑加粗 -->
      <h2 style="color:#333;font-weight:bold;">我的收藏</h2>
    </div>

    <!-- 收藏列表 -->
    <div class="favorites-list">
      <template v-if="loading">
        <div class="loading-wrapper">
          <el-skeleton :rows="3" animated />
        </div>
      </template>

      <template v-else-if="favorites.length">
        <div v-for="item in favorites" :key="item.id" class="favorite-item">
          <div class="dish-content">
            <img :src="item.imageUrl" :alt="item.name" class="dish-image" @click="showLargeImage(item.imageUrl)" />
            <div class="dish-info">
              <h3>{{ item.name }}</h3>
              <p class="description">{{ item.description }}</p>
              <div class="price-action">
                <span class="price">¥{{ item.price }}</span>
                <el-button 
                  type="danger" 
                  size="mini" 
                  icon="el-icon-delete"
                  @click="removeFavorite(item.id)"
                >
                  取消收藏
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <i class="el-icon-star-off"></i>
        <p>暂无收藏的菜品</p>
      </div>
    </div>
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
    <bottom-nav />
  </div>
</template>

<script>

import BottomNav from '@/components/BottomNav.vue'
import request from '@/utils/request'
import { getUserInfo } from '@/utils/auth'
export default {
  name: 'Favorites',
  components: {
    BottomNav
  },
  data() {
    return {
      favorites: [],
      loading: false,
      error: null,
      userInfo: getUserInfo(),
      imagePreviewVisible: false,
      previewImageUrl: ''
    }
  },
  created() {
    this.fetchFavorites()
  },
  methods: {
    async fetchFavorites() {
      this.loading = true
      try {
        // 发送POST请求获取收藏数据
        //const userId = localStorage.getItem('userId');
        const params = new URLSearchParams()
        params.append('userId', this.userInfo.id);
        const response = await request.post('/favorites', 
             params // 这里应该是实际的用户ID
        )
        console.log(response)
        this.favorites = response;
      } catch (error) {
        console.error('获取收藏失败:', error)
        this.$message.warning('获取收藏数据失败')
        
        // 使用模拟数据（实际开发中应删除）
        // this.favorites = [
        //   {
        //     id: 1,
        //     name: '红烧排骨',
        //     description: '精选上等排骨，红烧入味',
        //     price: 45,
        //     imageUrl: 'slide1.png'
        //   },
        //   {
        //     id: 2,
        //     name: '清蒸鲈鱼',
        //     description: '新鲜鲈鱼，清蒸保持原汁原味',
        //     price: 68,
        //     imageUrl: 'slide2.png'
        //   }
        // ]
      } finally {
        this.loading = false
      }
    },
    async removeFavorite(id) {
      try {
        await this.$confirm('确定要取消收藏吗')
        const params = new URLSearchParams()
        params.append('dishId', id);
        params.append('userId', this.userInfo.id);
        await request.post('/favorites/remove', params)
        //这句代码是用于从收藏列表中移除指定 id 的项目
        this.favorites = this.favorites.filter(item => item.id !== id)
        this.$message.success('已取消收藏')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消收藏失败:', error)
          this.$message.error('取消收藏失败')
        }
      }
    },
    showLargeImage(url) {
      this.previewImageUrl = url
      this.imagePreviewVisible = true
    }
  }
}
</script>

<style scoped>
.favorites-container {
  padding: 20px;
  padding-bottom: 70px;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
}

.page-header h2 {
  color: #333;
  font-weight: 500;
}

.favorites-list {
  max-width: 800px;
  margin: 0 auto;
}

.favorite-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
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
}

.dish-info {
  margin-left: 15px;
  flex: 1;
  min-width: 0;
}

.dish-info h3 {
  font-size: 15px;
  color: #333;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  -webkit-line-clamp: 3;
  line-clamp: 3;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
}

.loading-wrapper {
  padding: 20px;
}

/* 统一按钮样式 */
.el-button--danger {
  padding: 5px 10px;
  font-size: 12px;
  height: auto;
  line-height: 1.5;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .favorite-item {
    padding: 10px;
    margin-bottom: 8px;
  }
  
  .dish-image {
    width: 80px;
    height: 80px;
  }
  
  .dish-info {
    margin-left: 10px;
  }
  

}
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
</style>