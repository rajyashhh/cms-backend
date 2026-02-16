module.exports = {
  async beforeCreate(event) {
    const { params, context } = event;
    // Attach the authenticated user to the order
    if (context && context.state && context.state.user) {
      params.data.user = context.state.user.id;
    }
  },
};
