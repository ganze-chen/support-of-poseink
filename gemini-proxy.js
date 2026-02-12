// Gemini API Proxy Server
// 用于在魔搭创空间等环境中代理调用 Gemini API
//
// 部署方式：
// 1. 安装依赖: npm install express cors
// 2. 运行: node gemini-proxy.js
// 3. 或使用 Vercel/Railway 等平台部署

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 代理端点
app.post('/api/gemini', async (req, res) => {
  try {
    const { apiKey, model, prompt, image, config } = req.body;

    if (!apiKey || !prompt || !image) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 构建 Gemini API 请求
    const geminiRequest = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/png',
              data: image
            }
          }
        ]
      }],
      generationConfig: {
        imageConfig: config || {
          aspectRatio: "1:1",
          imageSize: "2K"
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorData);
    }

    const result = await response.json();

    // 直接返回 Gemini API 的响应
    res.json(result);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gemini-proxy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gemini Proxy Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/gemini`);
});
