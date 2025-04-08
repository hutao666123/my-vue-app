<template>
  <div class="home">
    <header class="header">
      <div class="header-content">
        <div class="logo-container">
          <img :src="logoSrc" alt="Logo" class="logo-image">
        </div>
        <div class="search-bar">
          <input type="text" class="search-input" placeholder="请输入检索关键词..." v-model="searchQuery" @keyup.enter="handleSearch">
          <svg class="search-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <div class="user-login">
          <button v-if="!isLoggedIn" class="login-btn" @click="showLoginModal">
            <svg class="user-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            用户登录
          </button>
          <div v-else class="user-info">
            <img :src="userInfo.userPic || ''" class="user-avatar">
            <span class="user-name">{{ userInfo.nickname }}</span>
          </div>
        </div>
      </div>
      <nav class="nav">
        <ul class="nav-list">
          <li v-for="(item, index) in navItems" :key="index">
            <a :href="item.path" class="nav-item">{{ item.name }}</a>
          </li>
        </ul>
      </nav>
    </header>

    <div class="banner">
      <img :src="bannerSrc" alt="用革命精神浇灌每一位大学生心田" class="banner-image">
    </div>

    <div class="category-tabs">
      <button 
        v-for="(tab, index) in categoryTabs" 
        :key="index"
        class="category-tab"
        :class="{ active: currentCategory === tab.id }"
        @click="handleCategoryChange(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="artifacts-grid">
      <div v-for="article in articles" :key="article.id" class="artifact-card" @click="viewArticleDetail(article.id)">
        <div class="artifact-image-container">
          <img v-if="article.img" 
               :src="articleImages.get(article.id)" 
               :alt="article.title" 
               class="artifact-image"
               @error="article.img = ''"
          >
          <div v-if="!article.img || !articleImages.get(article.id)" class="no-image">
            {{ !article.img ? '暂无图片' : '加载中...' }}
          </div>
        </div>
        <div class="artifact-info">
          <h3>{{ article.title }}</h3>
        </div>
      </div>
      <div v-if="articles.length === 0" class="no-data">
        暂无文物数据
      </div>
    </div>

    <div class="pagination-container">
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          @click="handlePageChange(currentPage - 1)" 
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        
        <button 
          v-if="totalPages <= 7 || currentPage <= 4"
          v-for="page in Math.min(5, totalPages)"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        
        <span v-if="totalPages > 7 && currentPage > 4" class="page-ellipsis">...</span>
        
        <button
          v-if="totalPages > 7 && currentPage > 4"
          v-for="page in middlePages"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        
        <span v-if="totalPages > 7 && currentPage < totalPages - 3" class="page-ellipsis">...</span>
        
        <button
          v-if="totalPages > 7 && currentPage >= totalPages - 3"
          v-for="page in lastPages"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        
        <button 
          class="page-btn" 
          @click="handlePageChange(currentPage + 1)" 
          :disabled="currentPage === totalPages"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <el-dialog :title="isRegisterMode ? '用户注册' : '用户登录'" v-model="loginModalVisible" width="400px" destroy-on-close>
      <div v-if="!isRegisterMode">
        <!-- 登录表单 -->
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="70px" class="login-form">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          
          <el-form-item prop="password" label="密码">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
          </el-form-item>
          
          <el-form-item prop="captcha" label="验证码">
            <div class="captcha-container">
              <el-input v-model="loginForm.captcha" placeholder="请输入验证码"></el-input>
              <div class="captcha-image" @click="refreshCaptcha" v-html="captchaHtml"></div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          </el-form-item>
        </el-form>
        
        <div class="form-footer">
          <el-button type="primary" @click="handleLogin" :loading="isSubmitting">登录</el-button>
          <el-button type="text" @click="switchToRegister">没有账号？立即注册</el-button>
        </div>
      </div>
      
      <div v-else>
        <!-- 注册表单 -->
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="70px" class="login-form">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="registerForm.username" placeholder="请输入用户名（3-20字符）"></el-input>
          </el-form-item>
          
          <el-form-item prop="password" label="密码">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（6-20字符）"></el-input>
          </el-form-item>
          
          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
          </el-form-item>
          
          <el-form-item prop="captcha" label="验证码">
            <div class="captcha-container">
              <el-input v-model="registerForm.captcha" placeholder="请输入验证码"></el-input>
              <div class="captcha-image" @click="refreshCaptcha" v-html="captchaHtml"></div>
            </div>
          </el-form-item>
        </el-form>
        
        <div class="form-footer">
          <el-button type="primary" @click="handleRegister" :loading="isSubmitting">注册</el-button>
          <el-button type="text" @click="switchToLogin">已有账号？返回登录</el-button>
        </div>
      </div>
    </el-dialog>

    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import BannerImg from '../assets/images/banner.jpg'
import LogoImg from '../assets/images/logo.png'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const isLoggedIn = ref(false)
    const userInfo = ref({})
    const loginModalVisible = ref(false)
    const isRegisterMode = ref(false)
    const isSubmitting = ref(false)
    const captchaHtml = ref('')
    const captchaText = ref('')
    const loginFormRef = ref(null)
    const registerFormRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(12)
    const totalPages = ref(1)
    const articles = ref([])
    const currentCategory = ref(1)
    const searchQuery = ref('')
    const bannerSrc = ref(BannerImg)
    const logoSrc = ref(LogoImg)
    const imageCache = ref(new Map())
    const articleImages = ref(new Map())

    const navItems = [
      { name: '首页', path: '/' },
      { name: '革命旧址', path: '/sites' },
      { name: '革命文献', path: '/documents' },
      { name: '红色课程', path: '/courses' },
      { name: '红色实践', path: '/practice' }
    ]

    const categoryTabs = [
      { id: 1, name: '一级文物' },
      { id: 2, name: '二级文物' },
      { id: 3, name: '三级文物' },
      { id: 4, name: '其他文物' },
      { id: 5, name: '口述资料' }
    ]

    const loginForm = ref({
      username: '',
      password: '',
      captcha: '',
      rememberMe: false
    })
    
    const registerForm = ref({
      username: '',
      password: '',
      confirmPassword: '',
      captcha: ''
    })

    // 验证用户名的函数
    const validateUsername = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入用户名'))
      } else if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度应为3-20个字符'))
      } else {
        callback()
      }
    }
    
    // 验证密码的函数
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度应为6-20个字符'))
      } else {
        callback()
      }
    }
    
    // 验证确认密码的函数
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.value.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    // 验证验证码的函数
    const validateCaptcha = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入验证码'))
      } else if (value.toLowerCase() !== captchaText.value.toLowerCase()) {
        callback(new Error('验证码错误'))
      } else {
        callback()
      }
    }

    const loginRules = {
      username: [{ validator: validateUsername, trigger: 'blur' }],
      password: [{ validator: validatePassword, trigger: 'blur' }],
      captcha: [{ validator: validateCaptcha, trigger: 'blur' }]
    }
    
    const registerRules = {
      username: [{ validator: validateUsername, trigger: 'blur' }],
      password: [{ validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
      captcha: [{ validator: validateCaptcha, trigger: 'blur' }]
    }

    // 生成随机验证码
    const generateCaptcha = () => {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let captcha = ''
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        captcha += chars[randomIndex]
      }
      captchaText.value = captcha
      
      // 生成验证码HTML
      const colors = ['#14365d', '#e9b84e', '#d9a438', '#254b78', '#0b2541']
      const fontSize = ['14px', '16px', '18px', '20px', '22px']
      const rotate = ['-10deg', '-5deg', '0deg', '5deg', '10deg']
      
      let html = ''
      for (let i = 0; i < captcha.length; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = fontSize[Math.floor(Math.random() * fontSize.length)]
        const angle = rotate[Math.floor(Math.random() * rotate.length)]
        
        html += `<span style="color: ${color}; font-size: ${size}; display: inline-block; transform: rotate(${angle});">${captcha[i]}</span>`
      }
      
      captchaHtml.value = html
    }
    
    // 刷新验证码
    const refreshCaptcha = () => {
      generateCaptcha()
      if (isRegisterMode.value) {
        registerForm.value.captcha = ''
      } else {
        loginForm.value.captcha = ''
      }
    }
    
    // 切换到注册模式
    const switchToRegister = () => {
      isRegisterMode.value = true
      refreshCaptcha()
    }
    
    // 切换到登录模式
    const switchToLogin = () => {
      isRegisterMode.value = false
      refreshCaptcha()
    }
    
    // 检查登录状态
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token')
      if (token) {
        axios.get('/api/user/info', {
          headers: { token }
        }).then(res => {
          console.log('用户信息响应:', res.data)
          if (res.data.code === 0) {
            isLoggedIn.value = true
            userInfo.value = res.data.data
          }
        }).catch(() => {
          localStorage.removeItem('token')
        })
      }
    }

    // 获取文章列表
    const fetchArticles = () => {
      // 真实API调用
      axios.get('/api/article/page', {
        params: {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          categoryId: currentCategory.value,
          title: searchQuery.value
        }
      }).then(res => {
        console.log('文章列表响应:', res.data)
        if (res.data.code === 0) {
          articles.value = res.data.data.records
          totalPages.value = Math.ceil(res.data.data.total / pageSize.value)
        } else {
          // 使用mock数据作为备选
          articles.value = mockArticles
          totalPages.value = 1
          console.warn('使用Mock数据:', mockArticles)
        }
      }).catch(err => {
        console.error('获取文章列表失败:', err)
        // 使用mock数据作为备选
        articles.value = mockArticles
        totalPages.value = 1
        console.warn('使用Mock数据:', mockArticles)
      })
    }

    // 获取并处理图片数据
    const loadArticleImage = async (url) => {
      if (imageCache.value.has(url)) {
        return imageCache.value.get(url)
      }

      try {
        console.log('开始加载图片:', url)
        const response = await axios.get(`/api/article?url=${encodeURIComponent(url)}`)
        console.log('图片加载响应:', response.data)
        if (response.data.code === 0) {
          const { mineType, content } = response.data.data
          const imageUrl = `data:${mineType};base64,${content}`
          imageCache.value.set(url, imageUrl)
          console.log('图片加载成功:', url)
          return imageUrl
        }
        console.warn('图片加载失败:', url)
        return '' 
      } catch (error) {
        console.error('图片加载错误:', error)
        return ''
      }
    }

    // 获取文章图片
    const getArticleImage = async (url) => {
      if (!url) {
        return ''
      }
      
      if (url.startsWith('http')) {
        return url
      }
      
      // 等待图片加载完成
      const imageUrl = await loadArticleImage(url)
      return imageUrl
    }

    // 预加载文章图片
    const preloadArticleImage = async (article) => {
      if (article.img && !article.img.startsWith('http')) {
        const imageUrl = await loadArticleImage(article.img)
        articleImages.value.set(article.id, imageUrl)
      }
    }

    // 监听文章列表变化，预加载图片
    watch(articles, async (newArticles) => {
      for (const article of newArticles) {
        await preloadArticleImage(article)
      }
    }, { immediate: true })

    // 处理注册
    const handleRegister = () => {
      // 获取表单实例并进行表单验证
      const formEl = registerFormRef.value;
      if (!formEl) return;
      
      formEl.validate((valid) => {
        if (!valid) {
          ElMessage.warning('请正确填写注册信息');
          return;
        }
        
        // 确保密码不为空
        if (!registerForm.value.password) {
          ElMessage.error('密码不能为空');
          isSubmitting.value = false;
          return;
        }
        
        isSubmitting.value = true;
        
        // 使用URLSearchParams发送数据，这种格式更接近传统的表单提交
        const params = new URLSearchParams();
        params.append('username', registerForm.value.username);
        params.append('password', registerForm.value.password);
        
        console.log('发送注册数据，参数字符串:', params.toString());
        
        axios.post('/api/user/register', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(res => {
            console.log('注册响应:', res.data)
            if (res.data.code === 0) {
              ElMessage.success('注册成功，请登录')
              switchToLogin()
              // 预填写登录表单
              loginForm.value.username = registerForm.value.username
            } else {
              ElMessage.error(res.data.msg || '注册失败')
            }
          })
          .catch(err => {
            console.error('注册失败:', err)
            if (err.response) {
              console.error('错误响应数据:', err.response.data)
            }
            ElMessage.error('注册请求失败，请稍后重试')
          })
          .finally(() => {
            isSubmitting.value = false
          })
      })
    }
    
    // 处理登录，也更新为相同格式
    const handleLogin = () => {
      // 获取表单实例并进行表单验证
      const formEl = loginFormRef.value;
      if (!formEl) return;
      
      formEl.validate((valid) => {
        if (!valid) {
          ElMessage.warning('请正确填写登录信息');
          return;
        }
        
        // 确保密码不为空
        if (!loginForm.value.password) {
          ElMessage.error('密码不能为空');
          isSubmitting.value = false;
          return;
        }
        
        isSubmitting.value = true;
        
        // 使用URLSearchParams发送数据
        const params = new URLSearchParams();
        params.append('username', loginForm.value.username);
        params.append('password', loginForm.value.password);
        
        console.log('发送登录数据，参数字符串:', params.toString());
        
        axios.post('/api/user/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(res => {
            console.log('登录响应:', res.data)
            if (res.data.code === 0) {
              localStorage.setItem('token', res.data.data.token)
              
              // 如果勾选了记住密码，保存用户名和密码到本地存储
              if (loginForm.value.rememberMe) {
                localStorage.setItem('rememberedUsername', loginForm.value.username)
                localStorage.removeItem('rememberedUserType')
                // 注意：实际项目中不应该明文存储密码，这里仅作演示
                localStorage.setItem('rememberedPassword', loginForm.value.password)
              } else {
                localStorage.removeItem('rememberedUsername')
                localStorage.removeItem('rememberedUserType')
                localStorage.removeItem('rememberedPassword')
              }
              
              isLoggedIn.value = true
              userInfo.value = res.data.data
              loginModalVisible.value = false
              ElMessage.success('登录成功')
            } else {
              ElMessage.error(res.data.msg || '登录失败')
            }
          })
          .catch(err => {
            console.error('登录失败:', err)
            if (err.response) {
              console.error('错误响应数据:', err.response.data)
            }
            ElMessage.error('登录请求失败，请稍后重试')
          })
          .finally(() => {
            isSubmitting.value = false
          })
      })
    }

    // 显示登录弹窗
    const showLoginModal = () => {
      isRegisterMode.value = false
      loginModalVisible.value = true
      
      // 从本地存储读取记住的用户名和密码
      const rememberedUsername = localStorage.getItem('rememberedUsername')
      const rememberedPassword = localStorage.getItem('rememberedPassword')
      
      if (rememberedUsername && rememberedPassword) {
        loginForm.value.username = rememberedUsername
        loginForm.value.password = rememberedPassword
        loginForm.value.rememberMe = true
      }
      
      // 生成验证码
      refreshCaptcha()
    }

    // 处理分页
    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchArticles()
      }
    }

    // 处理分类切换
    const handleCategoryChange = (categoryId) => {
      currentCategory.value = categoryId
      currentPage.value = 1
      fetchArticles()
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
      fetchArticles()
    }

    // 查看文章详情
    const viewArticleDetail = (id) => {
      router.push({
        name: 'ArticleDetail',
        params: { id: id }
      })
    }

    const middlePages = computed(() => {
      if (totalPages.value <= 7) return []
      const start = Math.max(currentPage.value - 1, 1)
      const end = Math.min(currentPage.value + 1, totalPages.value)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    const lastPages = computed(() => {
      if (totalPages.value <= 7) return []
      return Array.from({ length: 3 }, (_, i) => totalPages.value - 2 + i)
    })

    onMounted(() => {
      checkLoginStatus()
      fetchArticles()
    })

    return {
      isLoggedIn,
      userInfo,
      loginModalVisible,
      isRegisterMode,
      isSubmitting,
      captchaHtml,
      loginFormRef,
      registerFormRef,
      currentPage,
      totalPages,
      articles,
      currentCategory,
      searchQuery,
      navItems,
      categoryTabs,
      showLoginModal,
      handleLogin,
      handlePageChange,
      handleCategoryChange,
      handleSearch,
      viewArticleDetail,
      bannerSrc,
      logoSrc,
      middlePages,
      lastPages,
      imageCache,
      articleImages,
      registerForm,
      registerRules,
      switchToRegister,
      switchToLogin,
      handleRegister,
      refreshCaptcha,
      loginForm,
      loginRules,
      loginFormRef,
      registerFormRef
    }
  }
}
</script>

<style scoped>
:root {
  --primary-color: #e9b84e;      /* 金黄色主色调 */
  --primary-light: #f1ca75;      /* 淡金色 */
  --primary-dark: #d9a438;       /* 深金色 */
  --secondary-color: #14365d;    /* 深蓝色辅助色 */
  --secondary-light: #254b78;    /* 淡蓝色 */
  --secondary-dark: #0b2541;     /* 暗蓝色 */
  --bg-light: #f0f1f3;           /* 浅灰背景色 */
  --bg-medium: #e4e6e9;          /* 中灰背景色 */
  --text-dark: #2a3747;          /* 深色文字 */
  --text-medium: #4a5568;        /* 中等深度文字 */
}

/* 响应式布局基础设置 */
.home {
  background-color: #f0f1f3;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

/* 响应式头部样式 */
.header {
  padding: 15px 20px;
  background-color: #14365d;
  border-bottom: 1px solid rgba(233, 184, 78, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.logo-container {
  flex-shrink: 0;
}

.logo-image {
  width: 100%;
  max-width: 350px;
  height: auto;
  object-fit: contain;
}

/* 响应式搜索栏 */
.search-bar {
  flex-grow: 1;
  max-width: 500px;
  margin: 0;
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 8px 35px;
  border: 2px solid rgba(233, 184, 78, 0.5);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #14365d;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 响应式导航栏 */
.nav {
  background: #14365d;
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.nav-list {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
}

/* 响应式横幅 */
.banner {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 200px;
  max-height: 460px;
  margin-bottom: 30px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式分类标签 */
.category-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
  padding: 0 20px;
}

.category-tab {
  padding: 8px 20px;
  background-color: #f0f1f3;
  border: 1px solid #e4e6e9;
  color: #14365d;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* 响应式文物网格 */
.artifacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.artifact-card {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  width: 100%;
  border: 1px solid #e4e6e9;
}

.artifact-image-container {
  width: 100%;
  padding-top: 75%; /* 4:3 宽高比 */
  position: relative;
  overflow: hidden;
}

.artifact-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式分页 */
.pagination-container {
  width: 100%;
  background-color: #14365d;
  padding: 15px 0;
  margin-top: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 响应式登录弹窗 */
.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap;
}

/* 媒体查询 */
@media screen and (max-width: 1200px) {
  .header-content {
    padding: 0 20px;
  }
  
  .artifacts-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .logo-image {
    max-width: 280px;
  }
  
  .search-bar {
    max-width: 100%;
  }
  
  .nav-list {
    gap: 10px;
  }
  
  .nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .category-tabs {
    gap: 8px;
  }
  
  .category-tab {
    padding: 6px 15px;
    font-size: 13px;
  }
  
  .artifacts-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .pagination {
    gap: 5px;
  }
  
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 13px;
  }
}

@media screen and (max-width: 480px) {
  .header {
    padding: 10px;
  }
  
  .logo-image {
    max-width: 220px;
  }
  
  .nav-list {
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  
  .nav-item {
    width: 100%;
    text-align: center;
  }
  
  .category-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .category-tab {
    width: 100%;
    text-align: center;
  }
  
  .artifacts-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-btn {
    min-width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  .login-form {
    padding: 0 15px;
  }
  
  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .captcha-image {
    width: 100%;
  }
}

/* 保持其他现有样式不变 */
.user-login {
  flex-shrink: 0;
  margin-left: auto;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 15px;
  background-color: transparent;
  color: #ffffff;
  border: 1px solid #e9b84e;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: #e9b84e;
  color: #14365d;
  border-color: #e9b84e;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(233, 184, 78, 0.3);
}

.user-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background-color: rgba(233, 184, 78, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(233, 184, 78, 0.5);
  color: #ffffff;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
}

.user-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f1f3;
  color: #8a92a0;
  font-size: 14px;
  border-bottom: 1px solid #e4e6e9;
}

.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  font-size: 16px;
  color: #95a5a6;
}

.nav-item {
  color: #fff;
  text-decoration: none;
  padding: 6px 15px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  color: #e9b84e;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #e9b84e;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-item:hover::after {
  width: 100%;
}

.category-tab:hover {
  background-color: rgba(233, 184, 78, 0.1);
  border-color: #e9b84e;
  color: #14365d;
}

.category-tab.active {
  background-color: #e9b84e;
  color: #14365d;
  border-color: #e9b84e;
}

.artifact-info {
  padding: 15px;
  text-align: center;
  background-color: #ffffff;
  border-top: 1px solid #e4e6e9;
}

.artifact-info h3 {
  font-size: 16px;
  margin: 0;
  color: #14365d;
  font-weight: 500;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: #e9b84e;
  transition: fill 0.3s ease;
}

.banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2));
  pointer-events: none;
}

.pagination-container {
  background-color: #14365d;
  padding: 0;
  margin-top: 30px;
  margin-bottom: 0;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(233, 184, 78, 0.4);
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 8px;
  border-radius: 4px;
  margin: 0 2px;
}

.page-btn:hover {
  border-color: #e9b84e;
  color: #e9b84e;
  background-color: rgba(233, 184, 78, 0.15);
}

.page-btn.active {
  background-color: #e9b84e;
  border-color: #e9b84e;
  color: #14365d;
  font-weight: 500;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
}

.page-ellipsis {
  color: #ffffff;
  padding: 0 8px;
}

body {
  background-color: #f0f1f3;
  color: #2a3747;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
</style> 