import User from '../model/user.js';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; 

export async function createUser(req, res) {

    const passwordHash = await bcrypt.hash(req.body.password, 10); // Hash the password with a salt round of 10

    try {
        const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: passwordHash,
                        isAdmin: req.body.isAdmin || false,

        });
        
        await newUser.save();
        
        res.json({
            message: 'User created successfully',
        });
    } catch (error) {
                console.error("Full error:", error); // Add this line

        res.status(500).json({
            message: 'Error creating user',
        });
    }
}
export async function loginUser(req, res) { 
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

            const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password); // Compare the provided password with the hashed password
            if(isPasswordCorrect) {
                const payload = {
                    
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    isBlocked: user.isBlocked,
                    isEmailVerified: user.isEmailVerified,
                    Image: user.Image

                };

                const token = jwt.sign(payload, "I-CoMputerS10Batch"); // Sign the JWT with a secret key and set an expiration time
 
                res.json({
                    
                    token: token
                });
       
            } else {           
                res.json({
                    message: 'Incorrect password',
                });
            
        }
    } }

        catch(error) {
            console.error("Full error:", error); // Add this line

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