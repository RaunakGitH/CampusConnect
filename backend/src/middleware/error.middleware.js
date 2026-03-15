const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";
  if (err.name === "ValidationError") { status = 400; message = Object.values(err.errors).map(e => e.message).join(", "); }
  if (err.code === 11000) { status = 409; message = `${Object.keys(err.keyValue)[0]} already exists.`; }
  if (err.name === "CastError") { status = 400; message = `Invalid id: ${err.value}`; }
  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };