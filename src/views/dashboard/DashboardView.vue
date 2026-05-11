<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>個人專區</h1>
      <p class="subtitle">管理你的文章和短網址</p>
    </div>

    <div class="dashboard-cards">
      <!-- 我的文章卡片 -->
      <router-link to="/posts/my" class="dashboard-card">
        <div class="card-icon">📝</div>
        <h2>我的文章</h2>
        <p>管理你的所有文章，包括草稿、已發布和隱藏的文章</p>
        <div class="card-action">進入管理 →</div>
      </router-link>

      <!-- 短網址卡片 -->
      <router-link to="/short-urls" class="dashboard-card">
        <div class="card-icon">🔗</div>
        <h2>短網址</h2>
        <p>創建和管理你的短網址，追蹤點擊統計</p>
        <div class="card-action">進入管理 →</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
/**
 * 個人專區首頁
 * 提供導航卡片，引導用戶進入不同的功能區域
 */
</script>

<style scoped>
.dashboard-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 20px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 60px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.dashboard-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 2px solid transparent;
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  line-height: 1;
}

.dashboard-card h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.dashboard-card p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 25px;
  flex: 1;
}

.card-action {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-card:hover .card-action {
  color: #5568d3;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .dashboard-view {
    padding: 40px 20px;
  }

  .dashboard-header {
    margin-bottom: 40px;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .dashboard-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .dashboard-card {
    padding: 30px 20px;
  }

  .card-icon {
    font-size: 3rem;
  }

  .dashboard-card h2 {
    font-size: 1.5rem;
  }
}
</style>
