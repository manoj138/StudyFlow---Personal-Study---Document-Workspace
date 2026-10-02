export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error Handler] ${err.message}`, err.stack);
  res.status(statusCode).json({
    success: false,
    error: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};
