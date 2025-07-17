import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { requireCurrentUser, getCurrentUser } from "./helpers";

// Get user settings
export const getUserSettings = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!settings) {
      // Return default settings if none exist
      return {
        defaultWebhookUrl: null,
        emailNotificationsEnabled: true,
        emailTemplate: null,
        aiAnalysisEnabled: false,
        aiModel: null,
        aiSystemPrompt: null,
        aiMeaningfulChangeThreshold: 70,
        aiApiKey: null,
        emailOnlyIfMeaningful: false,
        webhookOnlyIfMeaningful: false,
      };
    }

    return settings;
  },
});

// Update default webhook URL
export const updateDefaultWebhook = mutation({
  args: {
    webhookUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Validate webhook URL if provided
    if (args.webhookUrl) {
      try {
        new URL(args.webhookUrl);
      } catch {
        throw new Error("Invalid webhook URL");
      }
    }

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        defaultWebhookUrl: args.webhookUrl || undefined,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        defaultWebhookUrl: args.webhookUrl || undefined,
        emailNotificationsEnabled: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Toggle email notifications
export const toggleEmailNotifications = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        emailNotificationsEnabled: args.enabled,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        emailNotificationsEnabled: args.enabled,
        defaultWebhookUrl: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Update email template
export const updateEmailTemplate = mutation({
  args: {
    template: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        emailTemplate: args.template,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        emailTemplate: args.template,
        emailNotificationsEnabled: true,
        defaultWebhookUrl: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Update AI analysis settings
export const updateAISettings = mutation({
  args: {
    enabled: v.boolean(),
    model: v.optional(v.union(
      v.literal("gpt-4o"),
      v.literal("gpt-4o-mini")
    )),
    systemPrompt: v.optional(v.string()),
    threshold: v.optional(v.number()),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    // Default system prompt if not provided
    const defaultPrompt = `You are an AI assistant specialized in analyzing website changes. Your task is to determine if a detected change is "meaningful" or just noise.

Meaningful changes include:
- Content updates (text, images, prices)
- New features or sections
- Important announcements
- Product availability changes
- Policy updates

NOT meaningful (ignore these):
- Rotating banners/carousels
- Dynamic timestamps
- View counters
- Session IDs
- Random promotional codes
- Cookie consent banners
- Advertising content
- Social media feed updates

Analyze the provided diff and return a JSON response with:
{
  "score": 0-100 (how meaningful the change is),
  "isMeaningful": true/false,
  "reasoning": "Brief explanation of your decision"
}`;

    const updateData = {
      aiAnalysisEnabled: args.enabled,
      ...(args.model && { aiModel: args.model }),
      ...(args.systemPrompt !== undefined && { aiSystemPrompt: args.systemPrompt || defaultPrompt }),
      ...(args.threshold !== undefined && { aiMeaningfulChangeThreshold: args.threshold }),
      ...(args.apiKey !== undefined && { aiApiKey: args.apiKey }),
      updatedAt: now,
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, updateData);
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        emailNotificationsEnabled: true,
        defaultWebhookUrl: undefined,
        ...updateData,
        aiSystemPrompt: updateData.aiSystemPrompt || defaultPrompt,
        aiMeaningfulChangeThreshold: updateData.aiMeaningfulChangeThreshold || 70,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

// Update notification filtering settings
export const updateNotificationFiltering = mutation({
  args: {
    emailOnlyIfMeaningful: v.optional(v.boolean()),
    webhookOnlyIfMeaningful: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingSettings) {
      const updateData: any = {
        updatedAt: now,
      };
      
      if (args.emailOnlyIfMeaningful !== undefined) {
        updateData.emailOnlyIfMeaningful = args.emailOnlyIfMeaningful;
      }
      
      if (args.webhookOnlyIfMeaningful !== undefined) {
        updateData.webhookOnlyIfMeaningful = args.webhookOnlyIfMeaningful;
      }

      await ctx.db.patch(existingSettings._id, updateData);
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        emailNotificationsEnabled: true,
        defaultWebhookUrl: undefined,
        emailOnlyIfMeaningful: args.emailOnlyIfMeaningful || false,
        webhookOnlyIfMeaningful: args.webhookOnlyIfMeaningful || false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Internal query to get user settings by userId
export const getUserSettingsInternal = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return settings;
  },
});