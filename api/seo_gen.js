// ═══════════════════════════════════════════════════════════════════════════════
// OraaSlayer SEO Engine v3.1 (Fixed)
// Secure, cached, rate-limited, retry-enabled, JSON-safe.
// ═══════════════════════════════════════════════════════════════════════════════

const API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL_NAME = "z-ai/glm-5.1";

// ═══════════════════════════════════════════════════════════════════════════════
// تصحيح: استخدام متغير عام بدلاً من process.env (غير متاح في المتصفح)
// ═══════════════════════════════════════════════════════════════════════════════
const NVIDIA_KEY = window.NVIDIA_API_KEY || "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";

const CONFIG = Object.freeze({
  timeoutMs: 15000,
  maxRetries: 2,
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 350,
  cacheTtlMs: 1000 * 60 * 60 * 6,
  rateWindowMs: 1000 * 60,
  rateMaxRequests: 10,
  fallbackEnabled: true,
});

const seoCache = new Map();
const rateStore = new Map();

function now() {
  return Date.now();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function clampText(text, maxLen) {
  const value = normalizeText(text);
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen).replace(/[\s,؛-]+$/, "").trim();
}

function cacheKeyFromAnime(animeName) {
  return normalizeText(animeName).toLowerCase();
}

function cleanupExpiredCache() {
  const t = now();
  for (const [key, item] of seoCache.entries()) {
    if (!item || item.expiresAt <= t) seoCache.delete(key);
  }
}

function getCachedSeo(key) {
  const item = seoCache.get(key);
  if (!item) return null;
  if (item.expiresAt <= now()) {
    seoCache.delete(key);
    return null;
  }
  return item.value;
}

function setCachedSeo(key, value) {
  seoCache.set(key, {
    value,
    expiresAt: now() + CONFIG.cacheTtlMs,
  });
}

function checkRateLimit(clientId = "global") {
  const id = normalizeText(clientId) || "global";
  const t = now();

  const current = rateStore.get(id);
  if (!current || current.resetAt <= t) {
    const item = {
      count: 1,
      resetAt: t + CONFIG.rateWindowMs,
    };
    rateStore.set(id, item);
    return {
      ok: true,
      remaining: CONFIG.rateMaxRequests - 1,
      resetAt: item.resetAt,
    };
  }

  if (current.count >= CONFIG.rateMaxRequests) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterMs: Math.max(0, current.resetAt - t),
    };
  }

  current.count += 1;
  rateStore.set(id, current);

  return {
    ok: true,
    remaining: CONFIG.rateMaxRequests - current.count,
    resetAt: current.resetAt,
  };
}

function safeJsonParse(text) {
  const raw = normalizeText(text)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(raw);
  } catch {}

  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }

  throw new Error("Model response is not valid JSON");
}

function validateSeoPayload(payload, animeName) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid SEO payload object");
  }

  const title = clampText(payload.title, 90);
  const description = clampText(payload.description, 160);
  const keywords = normalizeText(payload.keywords);

  if (!title) throw new Error("Missing title");
  if (!description) throw new Error("Missing description");
  if (!keywords) throw new Error("Missing keywords");

  return {
    title,
    description,
    keywords,
    animeName: normalizeText(animeName),
    source: "nvidia",
    generatedAt: new Date().toISOString(),
  };
}

function buildPrompt(animeName) {
  const safeName = normalizeText(animeName);

  return `
أنت خبير SEO عالمي.

المهمة:
أنشئ Meta SEO لأنمي بعنوان: "${safeName}"

المخرجات المطلوبة:
- JSON فقط
- بدون markdown
- بدون شرح
- بدون أسطر إضافية
- بدون أي نص خارج JSON

المعايير:
- الجمهور المستهدف: تونس، شمال أفريقيا، العالم العربي، والباحثون بالإنجليزية والفرنسية
- العنوان يجب أن يكون جذابًا وقابلًا للبحث
- الوصف لا يتجاوز 160 حرفًا
- الكلمات المفتاحية يجب أن تكون عملية ومفصولة بفواصل
- من الأفضل إدخال كلمات عربية + English + Français بشكل طبيعي

الصيغة النهائية:
{
  "title": "title here",
  "description": "description here",
  "keywords": "keyword1, keyword2, keyword3"
}
`.trim();
}

function buildFallback(animeName) {
  const name = normalizeText(animeName) || "Anime";

  return {
    title: clampText(`${name} | أنمي مترجم ومشاهدة أونلاين`, 90),
    description: clampText(
      `شاهد ${name} مترجمًا بجودة عالية مع SEO متعدد اللغات للجمهور العربي والتونسي.`,
      160
    ),
    keywords: normalizeText(
      [
        name,
        "أنمي مترجم",
        "مشاهدة أنمي",
        "anime online",
        "anime streaming",
        "anime français",
        "anime tunisie",
      ].join(", ")
    ),
    animeName: name,
    source: "fallback",
    generatedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// تصحيح: تحسين التحقق من المفتاح ومعالجة الأخطاء
// ═══════════════════════════════════════════════════════════════════════════════
function validateApiKey() {
  if (!NVIDIA_KEY || NVIDIA_KEY.trim() === "") {
    console.warn("[SEO] NVIDIA_API_KEY is not configured. Using fallback mode.");
    return false;
  }
  if (NVIDIA_KEY.startsWith("nvapi-") === false) {
    console.warn("[SEO] NVIDIA_API_KEY format may be invalid.");
    return false;
  }
  return true;
}

async function callNvidiaApi(prompt, { timeoutMs, maxRetries } = {}) {
  if (!validateApiKey()) {
    throw new Error("NVIDIA_API_KEY is not configured or invalid");
  }

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[SEO] Calling NVIDIA API (attempt ${attempt + 1}/${maxRetries + 1})`);

      const response = await fetch(API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${NVIDIA_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            {
              role: "system",
              content:
                "You are a strict multilingual SEO assistant. Return only valid JSON and nothing else.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: CONFIG.temperature,
          top_p: CONFIG.topP,
          max_tokens: CONFIG.maxTokens,
          extra_body: {
            chat_template_kwargs: {
              enable_thinking: true,
            },
          },
        }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        lastError = new Error(`NVIDIA API error ${response.status}: ${rawText}`);
        console.error(`[SEO] API Error (${response.status}):`, rawText);

        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < maxRetries) {
          console.log(`[SEO] Retrying in ${400 * Math.pow(2, attempt)}ms...`);
          await sleep(400 * Math.pow(2, attempt));
          continue;
        }

        throw lastError;
      }

      const data = JSON.parse(rawText);
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty model content");
      }

      console.log("[SEO] Successfully generated SEO data");
      return content;
    } catch (error) {
      lastError = error;
      console.error(`[SEO] Attempt ${attempt + 1} failed:`, error?.message || error);

      const retryable =
        error?.name === "AbortError" ||
        String(error?.message || "").toLowerCase().includes("fetch") ||
        String(error?.message || "").toLowerCase().includes("network");

      if (retryable && attempt < maxRetries) {
        console.log(`[SEO] Retrying after error in ${400 * Math.pow(2, attempt)}ms...`);
        await sleep(400 * Math.pow(2, attempt));
        continue;
      }

      throw lastError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error("Unknown NVIDIA API failure");
}

/**
 * توليد بيانات SEO ذكية لأنمي معيّن
 *
 * @param {string} animeName
 * @param {object} options
 * @param {string} [options.clientId="global"]
 * @param {boolean} [options.useCache=true]
 * @param {boolean} [options.allowFallback=true]
 * @returns {Promise<{
 *   title: string,
 *   description: string,
 *   keywords: string,
 *   animeName: string,
 *   source: string,
 *   generatedAt: string
 * } | null>}
 */
export async function fetchGlobalSEO(animeName, options = {}) {
  const {
    clientId = "global",
    useCache = true,
    allowFallback = CONFIG.fallbackEnabled,
  } = options;

  const startTime = performance.now();

  try {
    cleanupExpiredCache();

    const name = normalizeText(animeName);
    if (!name) {
      throw new Error("animeName is required");
    }

    const rate = checkRateLimit(clientId);
    if (!rate.ok) {
      const err = new Error("Rate limit exceeded");
      err.code = "RATE_LIMIT_EXCEEDED";
      err.retryAfterMs = rate.retryAfterMs;
      throw err;
    }

    const key = cacheKeyFromAnime(name);
    if (useCache) {
      const cached = getCachedSeo(key);
      if (cached) {
        console.log(`[SEO] Cache hit for: "${name}"`);
        return cached;
      }
      console.log(`[SEO] Cache miss for: "${name}"`);
    }

    const prompt = buildPrompt(name);
    const modelText = await callNvidiaApi(prompt, {
      timeoutMs: CONFIG.timeoutMs,
      maxRetries: CONFIG.maxRetries,
    });

    const parsed = safeJsonParse(modelText);
    const result = validateSeoPayload(parsed, name);

    setCachedSeo(key, result);

    const duration = Math.round(performance.now() - startTime);
    console.log(`[SEO] Generated SEO for "${name}" in ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(`[SEO] Error generating SEO for "${animeName}" after ${duration}ms:`, error);

    if (allowFallback) {
      console.log(`[SEO] Using fallback for "${animeName}"`);
      return buildFallback(animeName);
    }

    return null;
  }
}

export function getSeoRateLimitInfo(clientId = "global") {
  const id = normalizeText(clientId) || "global";
  const current = rateStore.get(id);
  const t = now();

  if (!current || current.resetAt <= t) {
    return {
      limited: false,
      remaining: CONFIG.rateMaxRequests,
      resetAt: t + CONFIG.rateWindowMs,
    };
  }

  return {
    limited: current.count >= CONFIG.rateMaxRequests,
    remaining: Math.max(0, CONFIG.rateMaxRequests - current.count),
    resetAt: current.resetAt,
  };
}

export function clearSeoEngineMemory() {
  seoCache.clear();
  rateStore.clear();
  console.log("[SEO] Cache and rate limit store cleared");
}

// ═══════════════════════════════════════════════════════════════════════════════
// تصحيح: إضافة دالة لتعيين المفتاح ديناميكياً (اختياري)
// ═══════════════════════════════════════════════════════════════════════════════
export function setNvidiaApiKey(key) {
  if (key && typeof key === "string" && key.startsWith("nvapi-")) {
    window.NVIDIA_API_KEY = key;
    console.log("[SEO] NVIDIA API key updated successfully");
    return true;
  }
  console.error("[SEO] Invalid API key format");
  return false;
}

export function getSeoConfig() {
  return {
    apiUrl: API_URL,
    modelName: MODEL_NAME,
    hasApiKey: validateApiKey(),
    cacheSize: seoCache.size,
    config: { ...CONFIG },
  };
}

console.log("✅ [SEO] OraaSlayer SEO Engine v3.1 loaded successfully");