# Gemini API 代理服务器

用于在魔搭创空间等受限网络环境中调用 Gemini AI 生图功能的代理服务器。

## 为什么需要代理？

魔搭创空间部署的应用无法直接访问 Google API（存在跨域和网络限制）。通过此代理服务器，可以在您的服务器上转发请求到 Gemini API。

## 部署方式

### 方式一：Railway（推荐，免费额度）

1. 访问 [railway.app](https://railway.app/)
2. 点击 "Deploy New Project" → "Deploy from GitHub"
3. 将此文件夹推送到 GitHub 仓库
4. 选择仓库并部署
5. 获取部署后的 URL，如：`https://your-app.railway.app/api/gemini`

### 方式二：Vercel

1. 安装 Vercel CLI: `npm i -g vercel`
2. 创建 `api/gemini.js`（参考下面的代码）
3. 运行 `vercel`

### 方式三：本地运行

```bash
cd proxy-server
npm install
npm start
# 服务器运行在 http://localhost:3000
```

### 方式四：使用 Cloudflare Workers（免费）

创建 `worker.js`:

```javascript
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { apiKey, model, prompt, image, config } = await request.json();

      const geminiRequest = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/png', data: image } }
          ]
        }],
        generationConfig: { imageConfig: config || { aspectRatio: "1:1", imageSize: "2K" } }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequest)
        }
      );

      return new Response(response.body, {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

## 使用方法

1. 部署代理服务器后，获取完整的 API 地址
2. 在"行气"应用的导出界面中输入：
   - Gemini API Key
   - 代理地址（如：`https://your-proxy.com/api/gemini`）
3. 点击"保存配置"
4. 点击"✨ AI 润色"即可使用

## 注意事项

- 代理服务器仅转发请求，不会存储您的 API Key
- API Key 仍然保存在用户浏览器的 localStorage 中
- 建议使用 HTTPS 部署代理服务器
