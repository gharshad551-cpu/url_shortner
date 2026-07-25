const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    console.error("Validation Error for payload:", req.body, "\\nErrors:", error.errors);
    return res.status(400).json({ message: "Invalid input data", errors: error.errors });
  }
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const dateSchema = z.string().refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }).optional().nullable();
const customAliasSchema = z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric and dashes only").or(z.literal('')).optional().nullable();

const shortenSchema = z.object({
  longUrl: z.string().trim().url(),
  customAlias: customAliasSchema,
  password: z.string().min(4).max(50).or(z.literal('')).optional().nullable(),
  expiresAt: dateSchema, // Flexible ISO 8601 or local datetime string
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
  })).optional().nullable(),
  deepLinkScheme: z.string().max(250).optional().nullable(),
  aiSummary: z.string().max(1000).optional().nullable(),
  aiSafetyScore: z.number().min(0).max(100).optional().nullable(),
  aiTags: z.array(z.string()).optional().nullable()
});

const editUrlSchema = z.object({
  longUrl: z.string().url().optional(),
  password: z.string().min(4).max(50).or(z.literal('')).optional().nullable(),
  expiresAt: dateSchema,
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
  })).optional().nullable(),
  deepLinkScheme: z.string().max(250).optional().nullable(),
  aiSummary: z.string().max(1000).optional().nullable(),
  aiSafetyScore: z.number().min(0).max(100).optional().nullable(),
  aiTags: z.array(z.string()).optional().nullable()
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

module.exports = { validate, registerSchema, loginSchema, shortenSchema, editUrlSchema, otpSchema };