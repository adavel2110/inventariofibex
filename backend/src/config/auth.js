module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'inventariofibex_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
