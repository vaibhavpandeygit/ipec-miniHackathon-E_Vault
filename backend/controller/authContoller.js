const { comparePassword} = require('../helpers/authHelper')
const {hashPassword} = require('../helpers/authHelper')
const { userModel } = require('../models/userModel')
const JWT = require('jsonwebtoken')

//---dotenv---//
require('dotenv').config()


//---- Register Controller ----//

const registerController= async(req,res)=>{
    try {
        const {name,email,password,phone} = req.body;

        //----Validations----
        if(!name){
            return res.send({message: "Name is required"})
        }
        else if(!email){
            return res.send({message: "Email is required"})
        }
        else if(!password){
            return res.send({message: "Password is required"})
        }
        else if(!phone){
            return res.send({message: "Phone is required"})
        }

        //----Check existing User----
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.status(200).send({
                success: false,
                message: "User allready registered please login"
            })
        }

        //----register----
        const hashedPassword = await hashPassword(password)

        //----registering----
        const user = await new userModel({name,email,phone,password:hashedPassword}).save();
        res.status(201).send({
            success: true,
            message: "User Registered Successfully",
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: error.message,
            
        })
    }
}

//---- Login Controller ----//

const loginController=async(req,res)=>{
    
    try {
        const {email,password} = req.body;

        //----Validation of email & password----
        if(!email || !password){
            return res.status(404).send({
                success: false,
                message: "Invalid email or password"
            })
        }

        //----check user----
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success: false,
                message: "Email is not registered"
            })
        }

        //----password match----
        const match = await comparePassword(password,user.password)
        if(!match){
            return res.status(200).send({
                success: false,
                message: 'Incorrect password'
            })
        }

        //----token generation----
        const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET,{
            expiresIn: "7d"
        })
        res.status(200).send({
            success: true,
            name: user.name,
            email: user.email,
            phone: user.phone,
            token
        })
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
}

module.exports = {registerController,loginController}