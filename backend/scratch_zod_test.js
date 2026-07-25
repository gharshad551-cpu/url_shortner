const { z } = require('zod');

const shortenSchema = z.object({
  longUrl: z.string().trim().url(),
  customAlias: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric and dashes only").optional().nullable(),
  password: z.string().min(4).max(50).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(), // ISO 8601 string
  ogTitle: z.string().max(100).optional().nullable(),
  ogDescription: z.string().max(200).optional().nullable(),
  ogImage: z.string().url().or(z.string().length(0)).optional().nullable(),
  iphoneUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  androidUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  webhookUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  maxClicks: z.number().int().positive().optional().nullable(),
  fallbackUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  abTestTargets: z.array(z.object({
    url: z.string().url(),
    weight: z.number().int().min(0).max(100)
  })).optional().nullable(),
  splashMessage: z.string().max(200).optional().nullable(),
  splashDelay: z.number().int().min(1).max(30).optional().nullable(),
  isOneTime: z.boolean().optional().nullable(),
  geoTargets: z.array(z.object({
    country: z.string().length(2),
    url: z.string().url()
  })).optional().nullable()
});

try {
  const payload = { longUrl: "https://youtu.be/f8u6ri0K3Qk?si=R3fQlRWsScDvcj0Y" };
  console.log("Input:", payload);
  const result = shortenSchema.parse(payload);
  console.log("Success:", result);
} catch (e) {
  console.error("Zod Error:");
  console.error(JSON.stringify(e.errors, null, 2));
}
