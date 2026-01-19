const debugMiddleware = (req, res, next) => {
  next();
};

module.exports = { debugMiddleware };
