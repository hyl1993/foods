<template>
   
    <div>
      <!-- 顶部标题 -->
      <div class="page-header">
        <h2 style="color:#333;font-weight:bold;">我的菜篮子</h2>
      </div>
        <!-- 待制作菜图标 -->
        <div class="cooking-icon">
            <el-badge :value="cookingCount" class="cooking-badge">
                <i class="el-icon-food" @click="showCookingList"></i>
            </el-badge>
        </div>
      
        <!-- 修改搜索框样式 -->
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
        
        <!-- 搜索结果展示 -->
       
       <div class="dish-list" v-if="filteredResults.length > 0">
      
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
                        <img :src="result.dishes.imageUrl" :alt="result.dishes.name" class="dish-image" @click="showLargeImage(result.dishes.imageUrl)">
                        <div class="dish-details">
                            <h3>{{ result.dishes.name }}</h3>
                            <p class="description">{{ result.dishes.description }}</p>
                            <div class="price-tag">
                                <span class="price">¥{{ result.dishes.price }}</span>
                                <span class="tag" v-for="tag in result.dishes.tags" :key="tag">{{ tag }}</span>
                            </div>
                            <div class="action-buttons">
                             
                                <el-button 
                                    :type="result.favorite ? 'warning' : 'success'"
                                    :icon="result.favorite ? 'el-icon-star-on' : 'el-icon-star-off'"
                                    circle
                                    class="favorite-btn"
                                    @click="toggleFavorite(result.dishes.id)"
                                >
                                    <span class="btn-text">{{ result.favorite ? '已收藏' : '收藏' }}</span>
                                </el-button>

                                <el-button 
                                    type="danger" 
                                    icon="el-icon-delete" 
                                    circle 
                                    class="delete-btn"
                                    @click="deleteDish(result.dishes.id)"
                                ></el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加按钮 -->
        <div class="add-to-cooking" v-show="hasSelectedItems">
          <el-badge :value="selectedCount" class="selected-badge">
        <el-button type="primary" @click="addToCooking">添加选中菜品</el-button>
      </el-badge>
        </div>

        <bottom-nav />

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
      mockData: [
        {
          name: '宫保鸡丁',
          description: '经典川菜，采用优质鸡肉，配以花生、黄瓜等，口感麻辣鲜香',
          price: 38,
          image: 'http://ytjyvpcsaas.oss-cn-hangzhou.aliyuncs.com/saas/casephoto/1137-C25030200576-79/ytwm_image_1740884923745.jpg ',
          tags: ['川菜', '招牌', '辣']
        },
        {
          name: '红烧肉',
          description: '精选五花肉，传统工艺制作，肥而不腻，入口即化',
          price: 48,
          image: '/dishes/hongshao.jpg',
          tags: ['本帮菜', '热销']
        },
        {
          name: '清炒时蔬',
          description: '当季新鲜蔬菜，清淡爽口，营养健康',
          price: 22,
          image: '/dishes/vegetables.jpg',
          tags: ['素菜', '健康']
        },
        {
          name: '麻婆豆腐',
          description: '使用陈年豆瓣酱，搭配嫩滑豆腐，麻辣可口',
          price: 32,
          image: '/dishes/mapo.jpg',
          tags: ['川菜', '素菜', '辣']
        }
      ],
      filteredResults: [],
      searchResults: [],
      imagePreviewVisible: false,
      previewImageUrl: '',
      cookingCount: 0,
      userInfo: null,
      loading: false,
      selectedOption: '',
      hasSelectedItems: false
    }
  },
  computed: {
    selectedCount() {
      return [...this.filteredResults, ...this.searchResults]
        .filter(item => item.selected).length;
    }
  },
  watch: {
    selectedCount(newVal) {
      this.hasSelectedItems = newVal > 0;
    }
  },
  created() {
    this.userInfo = getUserInfo()
    this.fetchDish()
    this.fetchCookingCount()
  },

  methods: {
    async fetchDish() {
      try {
        const res = await request.get('/basket?userId='+this.userInfo.id)
        // 确保每个菜品都有 selected 属性
        //console.log(res)
        this.filteredResults = res.map(item => ({
          ...item,
          selected: item.selected || false
        }))
      } catch (error) {
        console.error('获取菜品失败:', error)
        this.$message.error('获取菜品数据失败')
      }
    },
    async handleSearch() {
      // 实际项目中这里会发送请求到后端
      console.log('搜索关键词：', this.searchQuery);
      const query = this.searchQuery.trim();
      console.log(query);
   

      try {
        this.loading = true;
        
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 发起搜索请求
        const res = await request.get('/basket/search', 
          { params:{
            keyword: query.toLowerCase(),
            userId: this.userInfo.id
          }}
        );  
        console.log(res);
        // 更新数据
        this.filteredResults = res;
        console.log('搜索结果数量:', this.filteredResults.length);
        console.log(this.filteredResults);
        // 如果没有结果
        if (!this.filteredResults.length) {
          this.$message.info('未找到相关菜品');
        }
        
      } catch (error) {
        console.error('搜索失败:', error);
        //this.$message.error('搜索请求失败，请稍后重试');
        this.mockData = [];  // 清空搜索结果
      } finally {
        this.loading = false;
      }
    },
    showLargeImage(url) {
      this.previewImageUrl = url
      this.imagePreviewVisible = true
    },
    handleSelect() {
      this.hasSelectedItems = [...this.filteredResults, ...this.searchResults]
        .some(item => item.selected)
    },

    async addToCooking() {
      try {
        if (!this.userInfo || !this.userInfo.id) {
          this.$message.error('请先登录')
          return
        }

        const selectedDishes = [...this.filteredResults, ...this.searchResults]
          .filter(item => item.selected)
          .map(item => item.dishes.id)

        const dishIds = selectedDishes.join(',');
        await request.post('/cooking/add', {
          userId: this.userInfo.id,
          dishIds: dishIds
        },{
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        this.$message.success('添加成功')
        await this.fetchCookingCount()
        
        // 修改这里：使用 map 创建新数组确保响应式更新
        this.filteredResults = this.filteredResults.map(item => ({
          ...item,
          selected: false
        }))
        
        this.searchResults = this.searchResults.map(item => ({
          ...item,
          selected: false
        }))

        // 新增：重新获取最新数据
        await this.fetchDish()

      } catch (error) {
        console.error('添加失败:', error)
        this.$message.error('添加失败，请重试')
        
        // 同样修改错误处理中的重置方式
        this.filteredResults = this.filteredResults.map(item => ({
          ...item,
          selected: false
        }))
        this.searchResults = this.searchResults.map(item => ({
          ...item,
          selected: false
        }))
      }
    },

    async fetchCookingCount() {
      try {
        if (!this.userInfo || !this.userInfo.id) {
          return
        }
        
        const res = await request.post('/cooking/count',  {
        userId: this.userInfo.id
            },{
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        this.cookingCount = res
      } catch (error) {
        console.error('获取待制作数量失败:', error)
      }
    },

    showCookingList() {
      this.$router.push('/profile')
    },
    async toggleFavorite(dishId) {
      const dishItem = this.filteredResults.find(item => item.dishes?.id === dishId);
      console.log('找到的菜品对象:', dishItem)
      console.log('找到的菜品对象:', dishItem.favorite)
      if (dishItem.favorite) {
        this.addFavorite(dishId, '取消收藏');
      } else {
        this.addFavorite(dishId, "添加收藏");
      }
    },
    async addFavorite(dishId,action) {
      try {
        if (action === '取消收藏') {
          await this.$confirm('确定'+action+'吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await request.post('/favorites/remove', {
          dishId: dishId,
          userId: this.userInfo.id
        } ,{
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
      }else if (action === '添加收藏') {
          await this.$confirm('确定'+action+'吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await request.post('/favorites/add', {
          dishId: dishId,
          userId: this.userInfo.id
        } ,{
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
        
        let b = false;
        if (action === '添加收藏') {
          b = true;
        }
        
        const targetIndex = this.filteredResults.findIndex(item => item.dishes?.id === dishId);
        //console.log(targetIndex)
        
          this.$set(this.filteredResults, targetIndex, {
            ...this.filteredResults[targetIndex],
            favorite: b
          });
        
        
        this.$message.success('成功');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('操作失败:', error);
          this.$message.error('操作失败');
        }
      }
    },
    async deleteDish(dishId) {
      try {
        await this.$confirm('确定要删除这个菜品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await request.post('/basket/remove',
          {
            dishId: dishId,
            userId: this.userInfo.id
          }
        ,{
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.$message.success('删除成功');
        
        // 刷新数据
        await this.fetchDish();
        await this.fetchCookingCount();
        
        // 如果当前在搜索状态，也刷新搜索结果
        if (this.searchQuery) {
          await this.handleSearch();
        }
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error);
          this.$message.error('删除失败');
        }
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  text-align: center;
  padding: 20px 0;
  max-width: 800px;
  margin: 0 auto 20px;
  border-bottom: 1px solid #eee;
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
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  flex: 1;
}

.dish-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.dish-image:hover {
  transform: scale(1.02);
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
  flex: 1;
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

.cooking-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
}

.cooking-badge :deep(.el-badge__content) {
  background-color: #ff4949;
  cursor: pointer;
}

.cooking-icon i {
  font-size: 24px;
  color: #409EFF;
}

.add-to-cooking {
  position: fixed;
  bottom: 60px;
  right: 20px;
  z-index: 1000;
  padding: 12px 20px;
  background: #fff;
  border-radius: 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.el-checkbox {
  margin-right: 10px;
}

/* 添加图标样式 */
.el-icon-dish:before {
  content: "\e637";
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.delete-btn {
  margin-right: 20px; /* 删除按钮右侧留出20px间距 */
}



@media (max-width: 768px) {
  .delete-btn {
    margin-right: 10px;
  }
  /* 移动端隐藏按钮文字 */
  .favorite-btn .btn-text {
    display: none;
  }
}
</style>