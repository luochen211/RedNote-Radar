# AI 分析 API 接入需求

## 1. 目标

在保留现有上传、数据库、任务管理、指标计算和 Analysis 页面的基础上，通过 API 接入 Qwen 等大语言模型。AI 根据用户提交的文本信息及后端生成的结构化指标，输出诊断摘要、核心问题、目标受众和行动建议。

Railway 继续负责网站与业务后端，不在 Railway 容器内运行 Qwen2.5-32B。模型由独立的云端或 GPU 推理服务运行，网站通过 HTTPS API 调用。

## 2. 系统流程

1. 用户上传视频、封面、标题、正文和账号数据。
2. 正式后端生成互动预测和结构化 `indicators`。
3. 后端将原始文本及指标发送给 AI API。
4. AI API 返回符合约定 JSON 结构的中英文诊断。
5. 后端将诊断结果写入现有 `resultData`。
6. Analysis 页面优先展示 AI 结果；AI 未配置、超时或失败时，自动使用现有内置规则诊断。

## 3. API 兼容方式

本项目采用 OpenAI-compatible Chat Completions 协议：

```http
POST {AI_API_URL}/chat/completions
Authorization: Bearer {AI_API_KEY}
Content-Type: application/json
```

请求体核心字段：

```json
{
  "model": "Qwen2.5-32B-Instruct",
  "temperature": 0.2,
  "messages": [
    { "role": "system", "content": "系统提示词" },
    { "role": "user", "content": "投稿信息和 indicators JSON" }
  ]
}
```

兼容范围包括但不限于：

- 使用 vLLM 暴露 OpenAI-compatible API 的自建 Qwen 服务；
- 提供相同协议的云端 Qwen 服务；
- 其他支持 Chat Completions 协议的模型服务。

`AI_API_URL` 既可以填写 API 根地址，也可以直接填写以 `/chat/completions` 结尾的完整地址。

## 4. Railway 环境变量

```bash
AI_API_URL="https://model-service.example.com/v1"
AI_API_KEY="模型服务提供的密钥"
AI_MODEL="Qwen2.5-32B-Instruct"
AI_TIMEOUT_MS="45000"
```

- `AI_API_URL`：必填；模型服务地址。
- `AI_MODEL`：必填；模型服务中实际注册的模型名称，不要求必须是 32B。
- `AI_API_KEY`：按服务要求填写；内网无鉴权服务可不填。
- `AI_TIMEOUT_MS`：可选，默认 45 秒，最低 5 秒。

没有配置 `AI_API_URL` 或 `AI_MODEL` 时，系统不会发起外部请求，现有功能保持不变。

## 5. AI 输出要求

AI 必须只返回 JSON，不添加 Markdown 代码块或解释文字。系统同时要求中文 `zh` 和英文 `en` 两份内容，每份包含：

- `conclusion`：诊断摘要；
- `coreProblem`：核心问题；
- `expectedRoi`：预期改善；
- `targetGroup`、`targetReasoning`：目标受众及依据；
- `platform`、`platformReasoning`：平台建议及依据；
- `dimensions`：3 个分析维度；
- `steps`：3 个带 P0/P1/P2 优先级的行动建议；
- `highlightStats`：4 个关键指标。

后端会校验关键字段和数组。结果不符合结构、请求超时或 API 报错时，本次任务仍然完成，并回退到内置诊断，避免 AI 服务影响主业务。

## 6. 验收标准

- 未配置 AI 环境变量时，上传、预测和分析页面功能与现在一致。
- 配置有效 API 后，服务端成功发送投稿信息与真实指标。
- AI 返回合法结构后，Analysis 页面展示 AI 诊断。
- AI 超时、无响应、返回非 JSON 或字段缺失时，页面仍能展示内置诊断。
- API Key 只保存在 Railway 服务端环境变量中，不发送到浏览器。
- 中文与英文界面分别显示对应语言的 AI 结果。

## 7. 后续生产优化

当前任务处理沿用项目已有的轮询触发方式。正式业务量提升后，建议将指标计算和 AI 请求迁移到独立后台任务队列，增加调用日志、重试次数、费用统计和模型版本记录。
