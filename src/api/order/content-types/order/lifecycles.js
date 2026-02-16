module.exports = {
  async beforeCreate(event) {
    const { params } = event;
    
    // If user ID is provided but userEmail is missing, fetch it
    if (params.data.user && !params.data.userEmail) {
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        params.data.user,
        { fields: ["email"] }
      );
      if (user && user.email) {
        params.data.userEmail = user.email;
      }
    }
  },
};
