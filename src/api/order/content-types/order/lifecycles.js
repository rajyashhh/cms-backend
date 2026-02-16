module.exports = {
  async beforeCreate(event) {
    const { params } = event;

    // Validate user is set (log warning instead of throwing to avoid 500 errors)
    if (!params.data.user) {
      console.error("WARNING: Order created without user association");
      return; // Exit early if no user
    }

    // If user ID is provided but userEmail is missing, fetch it
    if (!params.data.userEmail) {
      try {
        const user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          params.data.user,
          { fields: ["email"] }
        );
        if (user && user.email) {
          params.data.userEmail = user.email;
        }
      } catch (error) {
        console.error("Failed to fetch user email:", error);
        // Don't crash the order creation if email fetch fails
      }
    }
  },
};
