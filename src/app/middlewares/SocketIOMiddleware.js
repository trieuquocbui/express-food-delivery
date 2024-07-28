module.exports = (io) => (req, res, next) => {
    req.io = io;
    next();
  };