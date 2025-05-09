const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const parts = authHeader.split(" ");
		// Check if the header is in the format "Bearer <token>"
		if (parts.length === 2 && parts[0] === "Bearer") {
			const token = parts[1];

			jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
				if (err) {
					// Token is invalid (e.g., expired, signature mismatch)
					return res.status(403).json({ message: "Forbidden: Invalid token" });
				}

				req.user = user; // Attach user payload to request object
				next();
			});
		} else {
			// Header is malformed
			return res
				.status(401)
				.json({ message: "Unauthorized: Token is malformed" });
		}
	} else {
		// No Authorization header provided
		return res.status(401).json({ message: "Unauthorized: No token provided" });
	}
};

module.exports = authenticateJWT;
