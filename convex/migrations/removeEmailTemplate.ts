import { internalMutation } from "../_generated/server";

// Migration to remove emailTemplate field from existing userSettings records
export const removeEmailTemplateField = internalMutation({
  handler: async (ctx) => {
    const userSettings = await ctx.db.query("userSettings").collect();
    
    for (const setting of userSettings) {
      if ('emailTemplate' in setting) {
        // Remove the emailTemplate field by patching without it
        const { emailTemplate, ...settingWithoutTemplate } = setting;
        await ctx.db.replace(setting._id, {
          ...settingWithoutTemplate,
          updatedAt: Date.now(),
        });
      }
    }
    
    console.log(`Migrated ${userSettings.length} userSettings records`);
  },
});