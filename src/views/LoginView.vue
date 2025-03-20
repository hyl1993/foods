<template>
  <div id="background">
    <div id="logo">foods</div>
    <div id="login">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>登入框</span>
        </div>
        <div id="form">
          <el-input v-model="username" placeholder="请输入内容"></el-input>
          <el-input v-model="password" placeholder="请输入密码" show-password></el-input>
        </div>
        <div>
          <el-button type="primary" @click="handleLogin">登入</el-button>
          <el-button type="primary" @click="showRegisterDialog = true">注册</el-button>
        </div>
      </el-card>
    </div>
    <div id="clock">
      <div id="time">{{time}}</div>
      <div id="date">{{date}}</div>
    </div>
    <div id="goBackHome">
      <!-- <router-link to="/main">去home</router-link> -->
    </div>

    <!-- 注册弹窗 -->
    <div class="dialog-overlay" v-if="showRegisterDialog" @click="showRegisterDialog = false">
      <div class="dialog" @click.stop>
        <h2>注册</h2>
        <div class="dialog-content">
          <el-input v-model="registerUsername" placeholder="请输入用户名" class="register-input"></el-input>
          <el-input v-model="registerPassword" placeholder="请输入密码" show-password class="register-input"></el-input>
          <el-input v-model="registerPhone" placeholder="请输入电话号码" class="register-input"></el-input>
          <div class="avatar-section">
            <div class="avatar-wrapper" @click="triggerRegisterFileInput">
              <img :src="registerAvatar" alt="用户头像" class="avatar" @error="handleRegisterAvatarError">
              <div class="avatar-overlay">
                <span>点击更换头像</span>
              </div>
            </div>
            <input 
              type="file" 
              ref="registerFileInput" 
              style="display: none" 
              accept="image/*"
              @change="handleRegisterFileChange"
            >
          </div>
        </div>
        <div class="dialog-buttons">
          <button @click="showRegisterDialog = false">取消</button>
          <button @click="submitRegister" class="primary">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#background {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-image: linear-gradient(90deg,
      green
      ,purple
      );
  background-size: 400%;
  /* animation: myanimation 10s infinite; */
}

@keyframes myanimation {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

#logo {
  color: ▣aliceblue;
  font-size: 25px;
  font-weight: 800;
  text-transform: uppercase;
  position: absolute;
  top: 15%;
  left: 15%;
}
#login{
  position: absolute;
  top: 30%;
  left: 30%;
}
.box-card{
  width: 373px;
  background-color: rgba(255, 255, 2555, 0.4);
  border-radius:15px;
}
#form{
  line-height: 60px;
  padding-left: 15px;
  padding-right: 15px;

}
.el-button{
  
  margin-top: 20px;
}
#clock{
  color: aliceblue;
  position: absolute;
  top: 70%;
  left: 15%;
  text-align: left;
}
#goBackHome{
  color: ▣aliceblue;
  font-size: 25px;
  font-weight: 800;
  text-transform: uppercase;
  position: absolute;
  /* top: 20%; */
  /* left: 15%; */
}
#time{
  font-size: 100px;
}
#date{
  font-size: 35px;
}

/* 新增注册弹窗样式 */
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.dialog h2 {
  margin: 0 0 20px 0;
  text-align: center;
}

.dialog-content {
  margin-bottom: 20px;
}

.register-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.avatar-section {
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
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
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
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
</style>

<script>
import axios from 'axios'
import request from '@/utils/request'
import { Message } from 'element-ui'
export default {
  data() {
    return {
      username:"",
      password:"",
      time:"",
      date:"",
      showRegisterDialog: false,  // 控制注册弹窗显示
      registerUsername: '',       // 注册用户名
      registerPassword: '',       // 注册密码
      registerPhone: '',          // 注册电话号码
      registerAvatar: '',         // 注册头像URL
      defaultRegisterAvatar: '',  // 默认头像，当加载失败时使用
      registerImage: null         // 注册头像文件
    }
  },
  mounted(){
    this.$nextTick(()=>{
      setInterval(this.update_clock,1000);
    })
  },
  methods:{
    // test
    update_clock:function(e){
      var d=new Date();
      
      var year=d.getFullYear();
      if (year<10) {
        year="0"+year; 
      }
      var month=d.getMonth()+1;
      if (month<10) {
        month="0"+month; 
      }
      var day=d.getDate();
      if (day<10) {
        day="0"+day; 
      }
      var hour=d.getHours();
      if (hour<10) {
        hour="0"+hour;
      }
      var minute=d.getMinutes();
      if (minute<10) {
        minute="0"+minute; 
      }
      var second=d.getSeconds();
      if (second<10) {
        second="0"+second; 
      }
      this.time=hour+":"+minute+":"+second;
      this.date=year+"/"+month+"/"+day;
    },
    async handleLogin() {
      try {
        //这个请求没用用共用的request，所以不会自动添加token，也不会去掉/api前缀
        const response = await axios.post('/api/auth/login', {
          username: this.username,
          password: this.password
        })
        console.log(response.data)
        if (response.data.code === 200) {
        
        // 保存 token 到 localStorage
          localStorage.setItem('token', response.data.data)
          //获取用户信息
          const userInfo = await request.get('/auth/getUserInfoByToken')
          // 保存用户信息到 localStorage
          console.log(userInfo)
        //  localStorage.setItem('userId', userInfo.data.id)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          
          //跳转到主页
          this.$router.push('/main')

       }else{
        Message.error(response.data.message)
      
       }
   
       
       
      } catch (error) {
        console.error('登录失败:', error)
      }
    },
    triggerRegisterFileInput() {
      this.$refs.registerFileInput.click()
    },

    handleRegisterFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      this.registerImage = file
      this.registerAvatar = URL.createObjectURL(file)
    },

    handleRegisterAvatarError() {
      this.registerAvatar = this.defaultRegisterAvatar
    },

    async submitRegister() {
      if (!this.registerUsername || !this.registerPassword || !this.registerPhone) {
        alert('请填写所有必填字段')
        return
      }

      const formData = new FormData()
      formData.append('username', this.registerUsername)
      formData.append('password', this.registerPassword)
      formData.append('phone', this.registerPhone)
      if (this.registerImage) {
        formData.append('avatar', this.registerImage)
      }

      try {
        const response = await request.post('/auth/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        alert('注册成功')
        this.showRegisterDialog = false
        this.resetRegisterForm()
      } catch (error) {
        console.error('注册失败:', error)
        alert('注册失败，请重试 失败原因'+error)
      }
    },

    resetRegisterForm() {
      this.registerUsername = ''
      this.registerPassword = ''
      this.registerPhone = ''
      this.registerAvatar = ''
      this.registerImage = null
    }
  }
  
}
</script>