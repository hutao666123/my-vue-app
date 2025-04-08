<template>
  <div class="article-detail-overlay" @click.self="goBack">
    <div class="article-detail">
      <div class="article-container">
        <div class="header-actions">
          <button class="close-btn" @click="goBack">
            <span class="close-icon">×</span>
          </button>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span>浏览量：{{ article.pageView }}</span>
          <span>创建时间：{{ formatDate(article.createTime) }}</span>
          <span>更新时间：{{ formatDate(article.updateTime) }}</span>
        </div>
        <div v-if="article.img" class="article-image">
          <img v-if="imageUrl" 
               :src="imageUrl" 
               :alt="article.title" 
               class="article-image"
               @error="(e) => { console.error('图片加载失败', e); article.img = ''; }"
          >
          <div v-else class="image-loading">图片加载中...</div>
        </div>
        <div class="article-content" v-html="article.content"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'ArticleDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const article = ref({})
    const imageUrl = ref('')

    // 添加模拟文章数据
    const mockArticle = {
      id: 1,
      title: '中国共产党石印',
      content: '<p>这是一段关于中国共产党石印的详细介绍。这是一个重要的历史文物，记录了党的早期历史。</p><p>这里是更多的介绍内容，可以包含多个段落。</p>',
      img: 'images/article1.jpg',
      categoryId: 1,
      createTime: '2023-01-01 12:00:00',
      updateTime: '2023-01-02 12:00:00',
      pageView: 123
    }

    // 加载图片数据
    const loadArticleImage = async (url) => {
      if (!url) return ''
      
      try {
        console.log('开始加载文章图片:', url)
        const response = await axios.get(`/api/article?url=${encodeURIComponent(url)}`)
        console.log('图片加载响应:', response.data)
        if (response.data.code === 0 && response.data.data) {
          const { mineType, content } = response.data.data
          if (!content) {
            console.error('图片内容为空')
            return ''
          }
          const imageUrl = `data:${mineType};base64,${content}`
          console.log('生成的图片URL:', imageUrl.substring(0, 100) + '...')
          return imageUrl
        }
        console.warn('图片加载失败:', url)
        return ''
      } catch (error) {
        console.error('图片加载错误:', error)
        return ''
      }
    }

    // 获取文章详情
    const fetchArticleDetail = async () => {
      try {
        const articleId = route.params.id
        const response = await axios.get(`/api/article/${articleId}`)
        console.log('文章详情响应:', response.data)
        if (response.data.code === 0) {
          article.value = response.data.data
          // 如果文章有图片，加载图片
          if (article.value.img) {
            console.log('开始加载图片, 图片路径:', article.value.img)
            const imgUrl = await loadArticleImage(article.value.img)
            console.log('加载后的图片URL:', imgUrl)
            imageUrl.value = imgUrl
          }
        } else {
          // 使用模拟数据
          article.value = mockArticle;
          console.warn('使用模拟文章数据', mockArticle);
        }
      } catch (error) {
        console.error('获取文章详情失败:', error)
        // 使用mock数据作为备选
        article.value = mockArticle;
        console.warn('使用模拟文章数据', mockArticle);
      }
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      // 如果是数字（时间戳），转换为数字类型
      const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
      if (isNaN(ts)) return timestamp
      const date = new Date(ts)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 添加返回函数
    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      fetchArticleDetail()
    })

    return {
      article,
      imageUrl,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.article-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 54, 93, 0.75);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.article-detail {
  max-width: 1200px;
  width: 100%;
  margin: 40px auto;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-container {
  background: #ffffff;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  border: 1px solid rgba(233, 184, 78, 0.3);
}

.article-title {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
  color: #14365d;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #4a5568;
  margin-bottom: 25px;
  font-size: 14px;
  border-bottom: 1px solid #e4e6e9;
  padding-bottom: 15px;
}

.article-image {
  margin: 25px 0;
  text-align: center;
}

.article-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(233, 184, 78, 0.3);
}

.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: #2a3747;
  padding: 10px 0;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(233, 184, 78, 0.1);
  border: none;
  color: #14365d;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
  border: 1px solid rgba(233, 184, 78, 0.3);
}

.close-btn:hover {
  background: rgba(233, 184, 78, 0.3);
  transform: rotate(90deg);
  border-color: #e9b84e;
  color: #14365d;
}

.close-icon {
  font-size: 28px;
  line-height: 1;
}

.image-loading {
  padding: 30px;
  text-align: center;
  color: #4a5568;
  background: #f0f1f3;
  border-radius: 8px;
  border: 1px dashed #e4e6e9;
  margin: 25px 0;
}
</style> 