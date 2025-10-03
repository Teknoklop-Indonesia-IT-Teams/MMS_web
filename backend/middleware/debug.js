const debugMiddleware = (req, res, next) => {
  console.log("Debug Info:");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
};

module.exports = { debugMiddleware };
