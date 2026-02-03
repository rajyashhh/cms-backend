module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
    expiresIn: 900, // 15 minutes in seconds
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
  secrets: {
    encryptionKey: env("ENCRYPTION_KEY"),
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
});
