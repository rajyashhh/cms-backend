'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Set up order permissions for authenticated users
    try {
      const pluginStore = strapi.store({
        type: "plugin",
        name: "users-permissions",
      });

      const authenticatedRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: "authenticated" } });

      if (authenticatedRole) {
        const permissions = await strapi
          .query("plugin::users-permissions.permission")
          .findMany({
            where: {
              role: authenticatedRole.id,
              action: {
                $in: [
                  "api::order.order.find",
                  "api::order.order.findOne",
                  "api::order.order.create",
                ],
              },
            },
          });

        // Enable permissions if they exist
        for (const permission of permissions) {
          if (!permission.enabled) {
            await strapi
              .query("plugin::users-permissions.permission")
              .update({
                where: { id: permission.id },
                data: { enabled: true },
              });
          }
        }

        console.log("✅ Order permissions have been set up for authenticated users");
      }
    } catch (error) {
      console.error("Error setting up order permissions:", error);
    }
  },
};
