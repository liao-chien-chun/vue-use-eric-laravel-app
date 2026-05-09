# Laravel API Integration

幫助用戶串接 Laravel API 的指南。

## 使用方式

當用戶需要串接 Laravel API 時使用此 skill。

## 檢查清單

### 1. 環境變數配置

檢查 `.env` 檔案：

```env
# Laravel API 基礎 URL
VITE_API_BASE_URL=http://localhost:8080/api

# API 超時設定（毫秒）
VITE_API_TIMEOUT=30000
```

### 2. Laravel CORS 配置

確認 Laravel 已啟用 CORS，在 `config/cors.php`：

```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 3. Laravel API 路由範例

```php
// routes/api.php

Route::prefix('user')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
});
```

### 4. Laravel 控制器範例

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        }

        return response()->json([
            'message' => '帳號或密碼錯誤',
        ], 401);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => '登出成功',
        ]);
    }
}
```

### 5. 測試 API 連接

建議步驟：

1. 先測試簡單的 GET 請求
2. 測試登入功能
3. 測試需要認證的 API
4. 檢查 token 是否正確傳遞

### 6. 常見問題排查

#### CORS 錯誤
- 檢查 Laravel CORS 配置
- 確認 `allowed_origins` 包含前端 URL
- 確認 `supports_credentials` 設為 `true`

#### 401 錯誤（未授權）
- 檢查 token 是否正確儲存
- 檢查 HTTP 攔截器是否正確添加 token
- 檢查 Laravel Sanctum 配置

#### 404 錯誤
- 檢查 API URL 是否正確
- 檢查 Laravel 路由是否存在
- 檢查路由前綴是否正確（通常是 `/api`）

### 7. Vue 端調用範例

```javascript
// 在組件中使用
import { authAPI } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

// 登入
const handleLogin = async () => {
  const authStore = useAuthStore()
  const success = await authStore.login({
    email: 'user@example.com',
    password: 'password'
  })

  if (success) {
    router.push('/dashboard')
  }
}
```

## 注意事項

- 確保 Laravel Sanctum 已安裝並配置
- 前端使用 `withCredentials: true` 支援 cookie
- Token 儲存在 localStorage
- 所有受保護的路由需要 `auth:sanctum` 中間件
