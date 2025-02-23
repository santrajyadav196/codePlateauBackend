const cookieOptions = {
  httpOnly: true, // Prevents client-side access
  secure: process.env.NODE_ENV === "production", // Only true in production (HTTPS required)
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Lax for local, None for cross-origin
  path: "/", // Available across the whole site
  expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  // domain:
  //   process.env.NODE_ENV === "production" ? ".yourdomain.com" : "localhost", // Set domain only in production
};

module.exports = cookieOptions;
