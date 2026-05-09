<template>
  <div class="all-posts-view">
    <div class="header">
      <div class="header-content">
        <h1>📰 所有文章</h1>
        <p class="subtitle">探索社群中的精彩內容</p>
      </div>
      <router-link to="/posts/my" class="btn btn-primary">
        我的文章
      </router-link>
    </div>

    <!-- 載入中 -->
    <div v-if="postStore.loading" class="loading-state">
      <p>載入中...</p>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="postStore.posts.length > 0" class="posts-grid">
      <div v-for="post in postStore.posts" :key="post.id" class="post-card" @click="goToPost(post.id)">
        <div class="post-header">
          <div class="author-info">
            <div class="author-name">{{ post.user.name }}</div>
            <div class="post-date">{{ formatDate(post.created_at, 'date') }}</div>
          </div>
        </div>

        <div class="post-content">
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ truncate(post.content, 150) }}</p>
        </div>

        <div class="post-footer">
          <div class="post-stats">
            <span class="stat-item">👁️ {{ Math.floor(Math.random() * 1000) }} 次瀏覽</span>
            <span class="stat-item">💬 {{ Math.floor(Math.random() * 30) }} 則留言</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <p>目前還沒有文章，快去新增第一篇吧！</p>
      <router-link to="/posts/create" class="btn btn-primary">
        新增文章
      </router-link>
    </div>
  </div>
</template>

<script setup>
/**
 * 所有文章頁面（公開前台）
 * 顯示所有已發布的文章，按照日期排序
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/store/post.store'
import { formatDate, truncate } from '@/utils/format'

const router = useRouter()
const postStore = usePostStore()

/**
 * 點擊文章卡片，進入詳情頁
 */
const goToPost = (postId) => {
  router.push(`/posts/${postId}`)
}

/**
 * 獲取所有文章
 */
const fetchPosts = async () => {
  await postStore.fetchPosts({
    per_page: 50,
    page: 1
  })
}

onMounted(() => {
  fetchPosts()
})

</script>

<style scoped>
.all-posts-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 文章網格佈局 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* 文章卡片 */
.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: #fafbfc;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* 文章頭部 */
.post-header {
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.post-date {
  color: #95a5a6;
  font-size: 0.85rem;
}

/* 文章內容 */
.post-content {
  flex: 1;
  margin-bottom: 16px;
}

.post-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-excerpt {
  color: #7f8c8d;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 文章底部 */
.post-footer {
  border-top: 1px solid #ecf0f1;
  padding-top: 16px;
}

.post-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  color: #95a5a6;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .header-content h1 {
    font-size: 2rem;
  }
}
</style>
