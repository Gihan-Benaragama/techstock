import jwt from "jsonwebtoken";

export default function authenticateUser(req, res, next) {
    const header = req.headers['authorization'];
    if (header) {
        const token = header.replace("Bearer ", "").trim();
        console.log("Token:", token);
        if (token && token !== "null" && token !== "undefined" && token !== "") {
            jwt.verify(token, process.env.JWT_SECRET || "I-CoMputerS10Batch", (error, decoded) => {
                if (error) {
                    return res.status(401).json({
                        message: "Invalid or Expired Token. Please login again."
                    });
                } else {
                    req.user = decoded;
                    next();
                }
            });
            return; // Exit here as jwt.verify is async
        }
    }
    // No token provided, proceed as unauthenticated
    next();
}

export function optionalAuthenticateUser(req, res, next) {
    const header = req.headers['authorization'];
    if (header) {
        const token = header.replace("Bearer ", "").trim();
        if (token && token !== "null" && token !== "undefined" && token !== "") {
            jwt.verify(token, process.env.JWT_SECRET || "I-CoMputerS10Batch", (error, decoded) => {
                if (!error) {
                    req.user = decoded;
                }
                next();
            });
            return;
        }
    }
    next();
}