import User from '../model/user.js';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; 

export async function createUser(req, res) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if email already registered
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            firstName,
            lastName,
            password: passwordHash,
            isAdmin: false,
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Error creating user. Please try again.',
        });
    }
}
export async function loginUser(req, res) {
  console.log('Login request received:', req.body);
    //req.body.email //
    //req.body.password 
    try { 
        const user = await User.findOne(
            { email: req.body.email }
        ) 
        console.log(user) 

        if(user == null) {
            res.status(400).json({
                message: 'User not found',
            });
        } else {

            let isPasswordCorrect = false;
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
                isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
            } else {
                isPasswordCorrect = (req.body.password === user.password);
            }

            if (isPasswordCorrect) {
                const payload = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    isBlocked: user.isBlocked,
                    isEmailVerified: user.isEmailVerified,
                    Image: user.Image
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET || "I-CoMputerS10Batch"); // Sign the JWT with a secret key

                res.json({
                    token: token
                });
            } else {
                res.status(401).json({
                    message: 'Incorrect password',
                });
            }
        }
    }

        catch(error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login. Please try again.' });
        }
    }

     export function isAdmin(req) {
        if(req.user == null) {
            return false;
        }if(req.user.isAdmin) {
            return true;
        } else {
            return false;
        }
     }

     export async function googleLogin(req, res) {
         try {
             let email, firstName, lastName, image;
             
             if (req.body.isMock) {
                 email = req.body.email;
                 firstName = req.body.firstName;
                 lastName = req.body.lastName;
                 image = req.body.image || "";
             } else {
                 const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.idToken}`);
                 if (!googleRes.ok) {
                     return res.status(400).json({ message: "Invalid Google token." });
                 }
                 const payload = await googleRes.json();
                 email = payload.email;
                 firstName = payload.given_name || "";
                 lastName = payload.family_name || "";
                 image = payload.picture || "";
             }
             
             let user = await User.findOne({ email });
             if (!user) {
                 user = new User({
                     email,
                     firstName,
                     lastName,
                     password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
                     isAdmin: false,
                     isBlocked: false,
                     isEmailVerified: true,
                     image
                 });
                 await user.save();
             }
             
             const jwtPayload = {
                 email: user.email,
                 firstName: user.firstName,
                 lastName: user.lastName,
                 isAdmin: user.isAdmin,
                 isBlocked: user.isBlocked,
                 isEmailVerified: user.isEmailVerified,
                 Image: user.image
             };
             const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || "I-CoMputerS10Batch");
             
             res.json({ token });
         } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
             console.error("Google login error:", error);
             res.status(500).json({ message: "Error during Google login." });
         }
     }

     export async function getAllUsers(req, res) {
         if (!isAdmin(req)) {
             return res.status(403).json({ message: "Access denied. Admins only." });
         }
         try {
             const users = await User.find({}, "-password");
             res.json(users);
         } catch (error) {
             console.error("Error fetching users:", error);
             res.status(500).json({ message: "Error fetching users." });
         }
     }