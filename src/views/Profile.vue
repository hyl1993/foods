<template>
  <div class="profile-container">
    
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else>
      <div class="user-info">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img :src="userAvatar" alt="用户头像" class="avatar" @error="handleAvatarError">
            <!-- <div class="avatar-overlay">
              <span>点击更换头像</span>
            </div> -->
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept="image/*"
            @change="handleFileChange"
          >
        </div>
        
        <div class="info-section">
          <div class="username">
            <span>用户名：</span>
            <span>{{ username }}</span>
          </div>
          
          <button class="change-password-btn" @click="showPasswordDialog = true">
            修改密码
          </button>

          <!-- 新增菜单建议按钮 -->
          <button class="suggest-menu-btn" @click.stop="showMenuDialog = true">
            新增菜单建议
          </button>

              <!-- 新增退出按钮 -->
              <button class="logout-btn" @click="handleLogout">
            退出
          </button>
        </div>
      </div>

      <!-- 功能按钮组 -->
      <div class="function-buttons">
        <el-button 
          :type="activeTab === 'preparing' ? 'primary' : 'default'"
          @click="activeTab = 'preparing'"
        >
          当前预制记录
        </el-button>
        <el-button 
          :type="activeTab === 'history' ? 'primary' : 'default'"
          @click="activeTab = 'history'"
        >
          制作完工历史记录
        </el-button>
        <el-button 
          :type="activeTab === 'suggestions' ? 'primary' : 'default'"
          @click="activeTab = 'suggestions'"
        >
          建议菜单记录
        </el-button>
      </div>

      <!-- 当前预制记录 -->
      <div v-if="activeTab === 'preparing'" class="record-section">
        <div v-if="loadingPreparing" class="loading">加载中...</div>
        <div v-else-if="preparingOrders.length" class="orders-list">
          <div v-for="order in preparingOrders" :key="order.id" class="order-item">
            <div class="order-content">
            <div class="order-info">
              <div v-if="order.dishesList" class="dishes-list">
                <div v-for="dish in order.dishesList" :key="dish.id" class="dish-item">
                  <img :src="dish.imageUrl" :alt="dish.name" class="dish-image" @click="showLargeImage(dish.imageUrl)"/>
                  <div class="dish-info">
                    <h3>{{ dish.name }}</h3>
                  </div>
                </div>
              </div>
                <h3>下单人:{{ order.userName }}</h3>
                <div class="order-footer">
                  <span class="order-time">下单时间：{{ formatDate(order.createdAt) }}</span>
                  <div class="order-actions">
                    <el-button type="warning" size="mini" @click="urgeOrder(order.id)">催单</el-button>
                    <el-button type="danger" size="mini" @click="cancelOrder(order.id)">取消</el-button>
                    <el-button type="success" size="mini" @click="finishOrder(order.id)">完工</el-button>
                 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">暂无预制记录</div>
      </div>

      <!-- 制作完工历史记录 -->
      <div v-if="activeTab === 'history'" class="record-section">
        <div v-if="loadingHistory" class="loading">加载中...</div>
        <div v-else-if="historyOrders.length" class="orders-list">
          <div v-for="order in historyOrders" :key="order.id" class="order-item">
            <div class="order-content">
              <div class="order-info">
                <div v-if="order.dishesList" class="dishes-list">
                <div v-for="dish in order.dishesList" :key="dish.id" class="dish-item">
                  <img :src="dish.imageUrl" :alt="dish.name" class="dish-image" @click="showLargeImage(dish.imageUrl)"/>
                  <div class="dish-info">
                    <h3>{{ dish.name }}</h3>
                  </div>
                </div>
                </div>


                <div class="order-footer">
                  <span class="complete-time">完成时间：{{ formatDate(order.createdAt) }}</span>
                  <!-- <span class="complete-time">评分：{{ (order.score) }}</span> -->
                  
                  <!-- <div class="rating-section" v-if="order.score===null||order.score===''"> -->
                    <template v-if="order.score">
                      <span class="rating-text">评分：</span>
                      <el-rate :value="Number(order.score)" disabled></el-rate>
                    </template>
                    <el-button 
                      v-else 
                      type="primary" 
                      size="mini"
                      @click="showRatingDialog(order)"
                    >
                      评分
                    </el-button>
                  </div>

                <!-- </div> -->
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">暂无历史记录</div>
      </div>

      <!-- 建议菜单记录 -->
      <div v-if="activeTab === 'suggestions'" class="suggestions-section">
        <div class="su_label">我的建议菜单</div>
        <div class="scrollable-suggestions">
          <div v-if="loadingSuggestions" class="loading">加载中...</div>
          
          <div v-else-if="mySuggestions.length" class="suggestions-list">
            <div v-for="item in mySuggestions" :key="item.id" class="suggestion-item">
              <div class="suggestion-content">
                <img :src="item.imageUrl" :alt="item.name" class="dish-image" @click="showLargeImage(item.imageUrl)"/>
                <div class="suggestion-info">
                  <h3>{{ item.name }}</h3>
                  <p class="description">描述:{{ item.description}}</p>
                  <p class="description">步骤:{{ item.cookingSteps }}</p>
                  <div class="suggestion-footer">
                    <div class="status-info">
                      <el-tag :type="getStatusType(item.status)">{{ item.status }}</el-tag>
                      <span class="submit-time">提交时间：{{ formatDate(item.submitTime) }}</span>
                    </div>
                    <div class="suggestion-actions">
                      <!-- 管理员可见的审核按钮 -->
                      <template v-if="userRole === 'ADMIN'">
                        <el-button 
                          type="success" 
                          size="mini"
                          v-if="item.status === '审核中'"
                          @click="handleAudit(item.id, 'approve')"
                        >
                          通过
                        </el-button>
                        <el-button 
                          type="danger" 
                          size="mini"
                          v-if="item.status === '审核中'"
                          @click="handleAudit(item.id, 'reject')"
                        >
                          拒绝
                        </el-button>
                      </template>
                      
                      <!-- 所有用户可见的操作按钮 -->
                      <el-button 
                        type="primary" 
                        size="mini"
                        :disabled="!canEdit(item.status)"
                        @click="openEditDialog(item)"
                      >
                        修改
                      </el-button>
                      <el-button 
                        type="danger" 
                        size="mini"
                        @click="deleteSuggestion(item.id)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-suggestions">
            <i class="el-icon-document"></i>
            <p>暂无建议记录</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div class="dialog-overlay" v-if="showPasswordDialog" @click="showPasswordDialog = false">
      <div class="dialog" @click.stop>
        <h2>修改密码</h2>
        <div class="dialog-content">
          
          <div class="password-field">
                <label class="password-label">原密码</label>
                <input 
                  type="password" 
                  v-model="oldPassword" 
                  placeholder="请输入原密码"
                  class="password-input"
                >
              </div>

              <div class="password-field">
                <label class="password-label">新密码</label>
                <input 
                  type="password" 
                  v-model="newPassword" 
                  placeholder="请输入新密码"
                  class="password-input"
                >
              </div>

              <div class="password-field">
                <label class="password-label">确认新密码</label>
                <input 
                  type="password" 
                  v-model="confirmPassword" 
                  placeholder="请确认新密码"
                  class="password-input"
                >
              </div>
          <div class="error-message" v-if="passwordError">{{ passwordError }}</div>
        </div>
        <div class="dialog-buttons">
          
          <button @click="showPasswordDialog = false">取消</button>
          <button @click="submitPasswordChange" class="primary">确认</button>
        </div>
      </div>
    </div>

    <!-- 新增菜单建议弹窗 -->
    <div class="dialog-overlay" v-if="showMenuDialog" @click="handleCloseAddDialog">
      <div class="dialog menu-dialog" @click.stop>
        <h2>新增菜单建议</h2>
        <div class="dialog-content">
          <input 
            type="text" 
            v-model="menuName" 
            placeholder="请输入菜名"
            class="menu-input"
          >
          <input 
            type="text" 
            v-model="description" 
            placeholder="请输入菜品描述"
            class="menu-input"
          >
          <div class="dialog-content">
          <select 
            v-model="category"
            class="menu-select"
          >
            <option value="家常菜">家常菜</option>
            <option value="早餐">早餐</option>
            <option value="烘焙">烘焙</option>
            <option value="其它">其它</option>
          </select>
          <textarea 
            v-model="cookingSteps" 
            placeholder="请输入详细的制作流程"
            class="menu-textarea"
          ></textarea>
          
          <div class="image-upload-section">
            <div class="image-preview" v-if="previewImage">
              <img :src="previewImage" alt="菜品预览">
              <button class="remove-image" @click="removeImage">×</button>
            </div>
            <div class="upload-btn" v-else @click="triggerMenuImageInput">
              <span>点击上传图片（选填）</span>
            </div>
            <input 
              type="file" 
              ref="menuImageInput" 
              style="display: none" 
              accept="image/*"
              @change="handleMenuImageChange"
            >
          </div>

          <div class="error-message" v-if="menuError">{{ menuError }}</div>
        </div>
        <div class="dialog-buttons">
          <button @click="showMenuDialog = false">取消</button>
          <button @click="submitMenuSuggestion" class="primary">提交</button>
        </div>
      </div>
    </div>

  
  
  </div >
    <!-- 修改建议菜单弹窗 -->
    <div class="dialog-overlay" v-if="showEditDialog" @click="handleCloseEditDialog">
      <div class="dialog menu-dialog" @click.stop>
        <h2>修改建议菜单</h2>
        <el-form :model="editForm" ref="editForm" :rules="menuRules">
          <el-form-item label="菜品名称" prop="name">
            <el-input v-model="editForm.name"></el-input>
          </el-form-item>
      
          <el-form-item label="菜品描述" prop="description">
            <el-input type="textarea" v-model="editForm.description" rows="4"></el-input>
          </el-form-item>
          <el-form-item label="菜品分类" prop="category">
            <el-select v-model="editForm.category" class="menu-select">
              <el-option label="家常菜" value="家常菜"></el-option>
              <el-option label="早餐" value="早餐"></el-option>
              <el-option label="烘焙" value="烘焙"></el-option>
              <el-option label="川菜" value="川菜"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="制作流程" prop="cookingSteps">
            <el-input type="textarea" v-model="editForm.cookingSteps" rows="6"></el-input>
          </el-form-item>
          <el-form-item label="菜品图片">
            <div class="edit-image-section">
              <div class="image-preview" v-if="editForm.previewImage">
                <img :src="editForm.previewImage" alt="菜品预览">
                <el-button 
                  type="danger" 
                  icon="el-icon-delete" 
                  circle
                  class="remove-image"
                  @click="removeEditImage"
                ></el-button>
              </div>
              <el-upload
                v-else
                class="upload-demo"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleEditImageChange"
              >
                <el-button type="primary">选择图片</el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
        
        <span slot="footer" class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确认修改</el-button>
        </span>
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

    <!-- 评分弹窗 -->
    <el-dialog
      title="菜品评分"
      :visible.sync="showRating"
      width="30%"
    >
      <div class="rating-dialog-content">
        <h3>{{ currentOrder.name }}</h3>
        <el-rate v-model="ratingValue" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
        <el-input
          type="textarea"
          v-model="ratingComment"
          placeholder="请输入评价内容（选填）"
          :rows="3"
        ></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRating = false">取消</el-button>
        <el-button type="primary" @click="submitRating()">提交评分</el-button>
      </span>
    </el-dialog>
  <bottom-nav />
  </div>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import request from '@/utils/request'
import { removeUserInfo } from '@/utils/auth'
import { getUserInfo } from '../utils/auth'
export default {
  components: {
    BottomNav
  },
  data() {
    return {
      username: '默认用户名',      // 用户名
      userRole: 'user',  // 用户角色：'admin' 或 'user'
      userAvatar: '',  // 当前头像URL
      loading: true,              // 加载状态标志
      showPasswordDialog: false,  // 控制密码修改弹窗显示
      oldPassword: '',           // 原密码
      newPassword: '',           // 新密码
      confirmPassword: '',       // 确认密码
      passwordError: '',         // 密码错误信息
      defaultAvatar: '',  // 默认头像，当加载失败时使用
      showMenuDialog: false,      // 控制菜单建议弹窗显示
      menuName: '',              // 菜单名称
      description: '',          // 菜品描述
      category: '',          // 菜品分类
      cookingSteps: '',          // 制作流程
      menuImage: null,            // 菜单图片
      previewImage: '',          // 菜单预览图片
      menuError: '',              // 菜单错误信息
      loadingSuggestions: false,
      userInfo: getUserInfo(),
      mySuggestions: [
        // {
        //   id: 1,
        //   name: '香辣小龙虾',
        //   description: '新鲜小龙虾，配以秘制酱料',
        //   image: 'slide1.png',
        //   status: '审核中',
        //   submitTime: '2024-03-15 14:30:00'
        // },
        // {
        //   id: 2,
        //   name: '糖醋里脊',
        //   description: '外酥里嫩，酸甜可口',
        //   image: 'slide2.png',
        //   status: '已通过',
        //   submitTime: '2024-03-14 09:15:00'
        // },
        // {
        //   id: 3,
        //   name: '麻婆豆腐',
        //   description: '川味十足，麻辣鲜香',
        //   image: 'slide3.png',
        //   status: '未通过',
        //   submitTime: '2024-03-13 16:45:00'
        // }
      ],
      showEditDialog: false,
      editForm: {
        id: null,
        name: '',
        description: '',
        cookingSteps: '',
        category: '',
        image: null,
        previewImage: ''
      },
      menuRules: {
        name: [
          { required: true, message: '请输入菜品名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入菜品描述', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        cookingSteps: [
          { required: true, message: '请输入制作流程', trigger: 'blur' },
          { min: 2, max: 1000, message: '长度在 2 到 1000 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择菜品分类', trigger: 'change' }
        ]
      },
      imagePreviewVisible: false,
      previewImageUrl: '',
      activeTab: 'preparing',
      loadingPreparing: false,
      loadingHistory: false,
      preparingOrders: [],
      historyOrders: [],
      showRating: false,
      ratingValue: 0,
      ratingComment: '',
      currentOrder: {}
    }
  },
  async created() {
    await this.fetchUserData()
    await this.loadTabData()
  },
  methods: {
    async fetchUserData() {
      try {
        this.loading = true
        const response = await request.get('/user/profile?userId=' + this.userInfo.id)
        this.username = response.name
        this.userRole = response.role
        this.userAvatar = response.avatar
      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    showLargeImage(url) {
      this.previewImageUrl = url
      this.imagePreviewVisible = true
    },  

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    async handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      try {
        const formData = new FormData()
        formData.append('avatar', file)
        
        // 替换为实际的上传 API
        const response = await request.post('/user/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        this.userAvatar = response.data.avatarUrl
      } catch (error) {
        console.error('上传头像失败:', error)
        alert('上传头像失败，请重试')
      }
    },

    // 当头像加载失败时,使用默认头像
    handleAvatarError() {
      this.userAvatar = this.defaultAvatar
    },

    async submitPasswordChange() {
      // 验证表单填写
      if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
        this.passwordError = '请填写所有密码字段'
        return
      }

      // 验证两次密码输入是否一致
      if (this.newPassword !== this.confirmPassword) {
        this.passwordError = '两次输入的新密码不一致'
        return
      }

      try {
        // 提交密码修改
        await request.put('/user/password?userId=' + this.userInfo.id, {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        })

        // 成功处理
        alert('密码修改成功')
        this.showPasswordDialog = false
        this.resetPasswordForm()
      } catch (error) {
        // 错误处理
        this.passwordError = error.response?.data?.message || '修改密码失败，请重试'
      }
    },

    // 重置密码表单
    resetPasswordForm() {
      this.oldPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
      this.passwordError = ''
    },

    // 触发菜品图片上传
    triggerMenuImageInput() {
      this.$refs.menuImageInput.click()
    },

    // 处理菜品图片选择
    handleMenuImageChange(event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      this.menuImage = file
      this.previewImage = URL.createObjectURL(file)
    },

    // 移除已选择的图片
    removeImage() {
      this.menuImage = null
      this.previewImage = ''
    },

    // 提交菜单建议
    async submitMenuSuggestion() {
      if (!this.menuName.trim()) {
        this.menuError = '请输入菜名'
        return
      }

      if (!this.cookingSteps.trim()) {
        this.menuError = '请输入制作流程'
        return
      }

      if (!this.category.trim()) {
        this.menuError = '请输入菜品分类'
        return
      }

      try {
        const formData = new FormData()
        formData.append('name', this.menuName)
        formData.append('description', this.description)
        formData.append('cookingSteps', this.cookingSteps)
        formData.append('category', this.category)
        formData.append('userId', this.userInfo.id)
        if (this.menuImage) {
          formData.append('image', this.menuImage)
        }

        await request.post('/suggestions/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.$message.success('菜单建议提交成功')
        this.showMenuDialog = false
        this.resetMenuForm()
        await this.fetchMySuggestions()
      } catch (error) {
        this.menuError = error.response?.data?.message || '提交失败，请重试'
      }
    },

    // 重置菜单表单
    resetMenuForm() {
      this.menuName = ''
      this.cookingSteps = ''
      this.description = ''
      this.menuImage = null
      this.previewImage = ''
      this.menuError = ''
    },

    async fetchMySuggestions() {
      this.loadingSuggestions = true
      try {
        const response = await request.get('/suggestions/list?userId=' + this.userInfo.id)
        this.mySuggestions = response
      } catch (error) {
        console.error('获取建议记录失败:', error)
        this.$message.error('获取建议记录失败')
      } finally {
        this.loadingSuggestions = false
      }
    },

    getStatusType(status) {
      const statusMap = {
        '审核中': 'warning',
        '已通过': 'success',
        '未通过': 'danger'
      }
      return statusMap[status] || 'info'
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString()
    },

    canEdit(status) {
      // 管理员可以编辑任何状态的建议
     // if (this.userRole === 'ADMIN') return true
      // 普通用户只能编辑未通过审核的建议
      return status !== '已通过'
    },

    openEditDialog(item) {
     // alert(item)
    // 先设置数据
      this.editForm = {
        id: item.id,
        name: item.name,
        description: item.description,
        cookingSteps: item.cookingSteps || '',
        category: item.category || '家常菜',
        previewImage: item.imageUrl,
        image: null
      }
      // 确保新增弹窗关闭
      this.showEditDialog = true

   //   this.showMenuDialog = false
      // 延迟一帧后打开编辑弹窗
      // this.$nextTick(() => {
      //   this.showEditDialog = true
      // })
    },

    async deleteSuggestion(id) {
      try {
        await this.$confirm('确定要删除这条建议吗？')
        await request.delete(`/suggestions/delete/${id}/${ this.userInfo.id}`)
        
       //await request.delete(`/suggestions/delete/${id}/${this.userInfo.id}`)
        this.mySuggestions = this.mySuggestions.filter(item => item.id !== id)
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 处理编辑图片变更
    handleEditImageChange(file) {
      if (!file.raw.type.startsWith('image/')) {
        this.$message.error('请选择图片文件')
        return
      }
      this.editForm.image = file.raw
      this.editForm.previewImage = URL.createObjectURL(file.raw)
    },

    // 移除编辑图片
    removeEditImage() {
      this.editForm.image = null
      this.editForm.previewImage = ''
    },

    // 重置编辑表单
    resetEditForm() {
      this.editForm = {
        id: null,
        name: '',
        description: '',
        cookingSteps: '',
        category: '',
        image: null,
        previewImage: ''
      }
    },

    // 提交编辑
    async submitEdit() {
      try {
        await this.$refs.editForm.validate()
        
        const formData = new FormData()
        formData.append('id', this.editForm.id)
        formData.append('name', this.editForm.name)
        formData.append('description', this.editForm.description)
        formData.append('cookingSteps', this.editForm.cookingSteps)
        formData.append('category', this.editForm.category)
        formData.append('userId', this.userInfo.id)
        if (this.editForm.image) {
          formData.append('image', this.editForm.image)
        }

        await request.put('/suggestions/update', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        this.$message.success('修改成功')
        this.showEditDialog = false
        await this.fetchMySuggestions()
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          this.$message.error('表单验证失败，请检查输入')
        }
      }
    },

    // 处理审核操作
    async handleAudit(id, action) {
      try {
        const confirmText = action === 'approve' ? '通过' : '拒绝'
        await this.$confirm(`确定要${confirmText}这条建议吗？`)
        const status = confirmText === '通过' ? '已通过' : '未通过'
        await request.post('/suggestions/audit', {
          id,
          status,
          userId: this.userInfo.id
        },{
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        this.$message.success(`${confirmText}成功`)
        await this.fetchMySuggestions()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('审核操作失败:', error)
          this.$message.error('审核操作失败')
        }
      }
    },

    async handleLogout() {
      try {
        await request.get('/auth/logout')
       // localStorage.removeItem('token')
        removeUserInfo()
        this.$router.push('/login')
      } catch (error) {
        console.error('登出失败:', error)
      }
    },
    handleCloseAddDialog() {
      this.showMenuDialog = false
      this.menuName = ''
      this.description = ''
      this.category = ''
      this.cookingSteps = ''
      this.menuImage = null
      this.previewImage = ''
      this.menuError = ''
    },
    handleCloseEditDialog() {
      // 确保完全关闭编辑弹窗
      this.showEditDialog = false
      this.$nextTick(() => {
        this.editForm = {
          id: null,
          name: '',
          description: '',
          cookingSteps: '',
          category: '',
          image: null,
          previewImage: ''
        }
      })
    },
    openMenuDialog() {
      // 确保编辑弹窗关闭
      this.showEditDialog = false
      this.$nextTick(() => {
        this.menuName = ''
        this.description = ''
        this.category = ''
        this.cookingSteps = ''
        this.menuImage = null
        this.previewImage = ''
        this.menuError = ''
        this.showMenuDialog = true
      })
    },
    async loadTabData() {
      switch(this.activeTab) {
        case 'preparing':
          await this.fetchPreparingOrders()
          break
        case 'history':
          await this.fetchHistoryOrders()
          break
        case 'suggestions':
          await this.fetchMySuggestions()
          break
      }
    },
    async fetchPreparingOrders() {
      this.loadingPreparing = true
      try {
        const response = await request.get('/cooking?userId=' + this.userInfo.id)
        this.preparingOrders = response
      } catch (error) {
        console.error('获取预制记录失败:', error)
        this.$message.error('获取预制记录失败')
      } finally {
        this.loadingPreparing = false
      }
    },
    async fetchHistoryOrders() {
      this.loadingHistory = true
      try {
        const response = await request.get('/finish?userId=' + this.userInfo.id)
        this.historyOrders = response
      } catch (error) {
        console.error('获取历史记录失败:', error)
        this.$message.error('获取历史记录失败')
      } finally {
        this.loadingHistory = false
      }
    },
    async urgeOrder(orderId) {
      try {
        await request.post(`/cooking/urge/${orderId}`)
        this.$message.success('催单成功')
      } catch (error) {
        this.$message.error('催单失败')
      }
    },
    async cancelOrder(orderId) {
      try {
        await this.$confirm('确定要取消该订单吗？')
        await request.post(`/cooking/cancel/${orderId}`)
        this.preparingOrders = this.preparingOrders.filter(order => order.id !== orderId)
        this.$message.success('取消成功')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消失败')
        }
      }
    },
    async finishOrder(orderId) {
      try {
        await this.$confirm('确定完工了吗?')
        await request.post(`/cooking/complete/${orderId}`)
        this.preparingOrders = this.preparingOrders.filter(order => order.id !== orderId)
        this.$message.success('成功')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('失败')
        }
      }
    },
    showRatingDialog(order) {

      this.currentOrder = order
      this.ratingValue = 0
      this.ratingComment = ''
      this.showRating = true
    },
    async submitRating() {
      
      try {
        await request.post('/finish/rate', {
          score: this.ratingValue,
          comment: this.ratingComment,
          finishId: this.currentOrder.id
          
        })
        
        // 更新本地数据
        const index = this.historyOrders.findIndex(order => order.id === this.currentOrder.id)
        if (index !== -1) {
          this.historyOrders[index].score = this.ratingValue
          this.historyOrders[index].comment = this.ratingComment
        }
        
        this.showRating = false
        this.$message.success('评分成功')
      } catch (error) {
        console.error('评分失败:', error)
        this.$message.error('评分失败')
      }
    }
  },
  watch: {
    activeTab() {
      this.loadTabData()
    }
  }
}
</script>

<style scoped>
body, html {
  margin: 0;
  padding: 0;
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
.profile-container {
   padding: 10px;
  margin-top: -20px; 

}

.suggestions-list {
  margin-top: calc(40vh + 140px);
  height: calc(60vh - 180px);
  padding-bottom: 60px;
  margin: 0 auto;
  overflow: auto;
}

.suggestion-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
}

.user-info {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  margin-bottom: 20px;
 
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  border-radius: 50%;
}

.info-section {
  text-align: center;
}

.username {
  font-size: 18px;
  margin-bottom: 15px;
}

.change-password-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.change-password-btn:hover {
  background-color: #45a049;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}
/* 弹窗样式 */
.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.loading {
  text-align: center;
  margin: 20px 0;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.dialog h2 {
  margin: 0 0 20px 0;
  text-align: center;
}

.dialog-content {
  margin-bottom: 20px;
}

.password-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-buttons button.primary {
  background-color: #4CAF50;
  color: white;
}

.dialog-buttons button:not(.primary) {
  background-color: #f5f5f5;
}

.suggest-menu-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.suggest-menu-btn:hover {
  background-color: #1976D2;
}

.menu-dialog {
  max-width: 300px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 15px;
}

.menu-input, .menu-textarea {
  font-size: 14px;
  padding: 8px;
}

.image-preview {
  width: 150px !important;
  height: 150px !important;
}

.dialog-buttons button {
  padding: 6px 12px;
  font-size: 14px;
}

@media (max-width: 480px) {
  .menu-dialog {
    width: 95% !important;
    margin: 10px auto;
  }
  
  .menu-textarea {
    height: 120px;
  }
}

.image-upload-section {
  margin: 15px 0;
  width: 100%;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.upload-btn:hover {
  border-color: #2196F3;
  color: #2196F3;
}

.suggestions-section {
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.suggestions-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.suggestion-content {
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

.suggestion-info {
  margin-left: 15px;
  flex: 1;
  min-width: 0;
}

.suggestion-info h3 {
  font-size: 15px;
  color: #333;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.suggestion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-tag {
  font-size: 12px;
  padding: 4px 8px;
}

.submit-time {
  font-size: 12px;
  color: #999;
}

.suggestion-actions {
  display: flex;
  gap: 10px;
}

.suggestion-actions .el-button {
  padding: 5px 10px;
  font-size: 12px;
  height: auto;
  line-height: 1.5;
}

.empty-suggestions {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.empty-suggestions i {
  font-size: 48px;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .suggestion-item {
    padding: 10px;
    margin-bottom: 8px;
  }
  
  .dish-image {
    width: 80px;
    height: 80px;
  }
  
  .suggestion-info {
    margin-left: 10px;
  }
  
  .description {
    -webkit-line-clamp: 3;
  }
}

.edit-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.edit-image-section .image-preview {
  position: relative;
  width: 200px;
  height: 200px;
}

.edit-image-section .image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.edit-image-section .remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
}

.upload-demo {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 新增退出按钮样式 */
.logout-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #d32f2f;
}
.password-field {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.password-label {
  width: 80px;
  font-size: 14px;
  color: #333;
  text-align: right;
  margin-right: 10px;
}

.password-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.su_label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.scrollable-suggestions {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 5px;
  margin-top: 10px;
}

/* 滚动条样式 */
.scrollable-suggestions::-webkit-scrollbar {
  width: 6px;
}

.scrollable-suggestions::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-suggestions::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.scrollable-suggestions::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 最后一项底部留白 */
.suggestion-item:last-child {
  margin-bottom: 20px;
}

/* 添加悬停效果 */
.suggestion-item:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-select {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
}

@media (max-width: 480px) {
  .menu-select {
    font-size: 13px; /* 手机端字体缩小 */
    padding: 6px;
  }
}

/* 添加弹窗层级控制 */
.dialog-overlay {
  z-index: 1000; /* 普通弹窗层级 */
}

.edit-dialog {
  z-index: 1001 !important; /* 确保编辑弹窗在顶层 */
}

.function-buttons {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.record-section {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.orders-list {
  margin-top: 10px;
  height: calc(60vh - 220px);
  padding-bottom: 60px;
  overflow: auto;
}

.order-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.order-content {
  display: flex;
  align-items: center;
}

.order-info {
  margin-left: 15px;
  flex: 1;
  min-width: 0;
}

.order-info h3 {
  font-size: 15px;
  color: #333;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.rating-dialog-content {
  text-align: center;
}

.rating-dialog-content h3 {
  margin-bottom: 10px;
}

.rating-dialog-content .el-rate {
  margin: 20px 0;
}

.rating-dialog-content .el-input {
  width: 100%;
  margin-bottom: 10px;
}

.rating-dialog-content .el-input textarea {
  height: 100px;
}

.rating-dialog-content .dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.rating-dialog-content .dialog-footer button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.rating-dialog-content .dialog-footer button.primary {
  background-color: #4CAF50;
  color: white;
}

.rating-dialog-content .dialog-footer button:not(.primary) {
  background-color: #f5f5f5;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-dialog-content {
  text-align: center;
}

.rating-dialog-content .el-rate {
  margin: 20px 0;
}

.rating-dialog-content .el-input {
  width: 100%;
  margin-bottom: 10px;
}

.rating-dialog-content .el-input textarea {
  height: 100px;
}

.rating-dialog-content .dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.rating-dialog-content .dialog-footer button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.rating-dialog-content .dialog-footer button.primary {
  background-color: #4CAF50;
  color: white;
}

.rating-dialog-content .dialog-footer button:not(.primary) {
  background-color: #f5f5f5;
}

.dishes-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
}

.dish-item {
  flex: 0 0 auto;
  width: 120px;
  text-align: center;
}

.dish-item .dish-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.dish-item .dish-info h3 {
  margin: 5px 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>