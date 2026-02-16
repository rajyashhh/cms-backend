/**
 * @param {object} _env - Strapi environment object (unused)
 */
module.exports = (_env) => ({
  // ...existing config
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "1h", // Set JWT expiry to 1 hour
      },
    },
  },
});
