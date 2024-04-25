const express=require('express');
const Router=express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser')


const User=require('../model/User');;
const Course=require('../model/Course')
const Certificate=require('../model/Certificate')
const { body, validationResult } = require('express-validator');
const JWT_SECRET = process.env.JWT_SECRET;




// The Model.create() method of the Mongoose API is used to create single or many documents in the collection. Mongoose by default triggers save() internally when we use the create() method on any model.
// to create a new user
Router.post('/auth', 
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
async (req, res) => {
    try{
        let success=false

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let message="Invalid Credentials";
        return res.status(400).json({success,msg});
    }
    

    var salt =await bcrypt.genSaltSync(10);
    var secPas = bcrypt.hashSync(req.body.password, salt);
    
    let p=await User.findOne({email:req.body.email});
    console.log(`value od p  is ${p}  value of email ${req.body.email}`);
    if(p){
        let msg=`User with ${req.body.email} already exist`;
        res.send({success,msg});
    }
    else{
    user= await User.create({
        name:req.body.name,
        email:req.body.email,
        password:secPas,
        isAdmin:req.body.isAdmin

    });
    success=true;


    
    // now creatig auth token
    //  here data is second part of jwt that is payload
    const data={
        user:{
            id:user.id
        }
    }
    console.log(user.id)
 
    const authToken= await jwt.sign(data,JWT_SECRET)  //it require a data which is encoded on header portion for that we give it objectid bcz objectid is accessible in fstest way
    console.log(authToken)
    res.json({authToken,success});


    console.log(req.body);
    // res.send({secPas});
}
}
catch(err){
    console.log(err.message);
    res.send(err.message);

}
});

// jwt.verify return decoded payload


// Now we have to check for login info for existing user
Router.post('/login', 
   
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
async (req, res) => {
    try{
        let success=false;
        const email=req.body.email;
         
        const exist=await User.findOne({email});
        if(!exist){
            
            return res.status(401).send({success});
        }
        const r=await bcrypt.compare(req.body.password, exist.password);
        if(!r){
            return res.status(401).send({success});
        }
        const data={
            user:{
                id:exist.id
            }
        }
        success=true
        const isAdmin=exist.isAdmin

        const authToken= await jwt.sign(data,JWT_SECRET)
        res.status(200).json({authToken,success,isAdmin,email});
    }
    catch(err){
        res.send("Server error");
        console.log(err);
    }
});


// now we have to give authorization on the basic of auth key
// if auth key provided by broweer matches with auth key generated then acesss given 
// the server doesnot have stored the value of auth key in case jwt method 
// brower to give auth key for authentication form header portion the jwt key is stored
// from auth key we acn get payload that is dta when we fhave genrated auth key it thepayload was objectid
// middleware is the middle function given to router function or any fucntoino so after middleware gets fully compiled the 3rd function will compilke
// in middleware we comapre for the sauth key

Router.post('/getuser',fetchuser,
async (req,res)=>{
    try{
    obejctid=req.user.id;
    const user_data=await User.findById(obejctid).select("-password");
    res.send(user_data);
    }
    catch(err){
        console.log(err);
        res.status(500).send("Server Error");
    }



});

Router.put('/updateUser', async (req, res) => {
    try {
        const { username, email, newUrl } = req.body;

        // Find the user based on the provided email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Add the new certificate URL to the user's certificate array
        user.certificate.push(newUrl);

        // Save the updated user
        await user.save();

        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


Router.get('/fetchAllUser', async (req, res) => {
    try {
        const fetchedUsers = await User.find().select('-password').populate('certificates');
        res.status(200).send(fetchedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});



Router.post('/create/certificate', async (req, res) => {
    try {
        const { certificateID, courseName, teacher, certificateLink, email } = req.body;

        // Check if the user exists
        console.log( certificateID, courseName, teacher, certificateLink, email )
        const user = await User.findOne({ email });
        console.log(user)
        const userId=user._id
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the certificate
        const certificate = new Certificate({
            certificateID,
            courseName,
            teacher,
            certificateLink,
            user: userId
        });

        // Save the certificate
        await certificate.save();

        // Add the certificate to the user's certificates array
        user.certificates.push(certificate._id);
        await user.save();

        res.status(201).json({ message: "Certificate created successfully", certificate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: {err} });
    }
});

Router.get('/users/certificates', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by userId
        const user = await User.findById(userId).populate('certificates');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get the certificates of the user
        const certificates = user.certificates;

        res.json(certificates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

Router.get('/user/details/:email', async (req, res) => {
    const email = req.params.email;

    try {
        // Find the user by userId
        const user = await User.findOne({email}).populate('certificates');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get the certificates of the user
        const certificates = user.certificates;

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});


Router.post('/create/course', async (req, res) => {
    try {
        // Extract course data from request body
        const { Name, Time, Date, Company, Role } = req.body;

        // Create a new Course document
        const newCourse = new Course({
            Name,
            Time,
            Date,
            Company,
            Role
        });

        // Save the new course to the database
        await newCourse.save();

        // Respond with success message
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        // Respond with error message if something goes wrong
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Failed to create course' });
    }
});
Router.get('/courses', async (req, res) => {
    try {
        // Fetch all courses from the database
        const courses = await Course.find();
        // Respond with the fetched courses
        res.status(200).json(courses);
    } catch (error) {
        // Respond with error message if something goes wrong
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
});
Router.delete('/courses', async (req, res) => {
    try {
        // Delete all courses from the database
        await Course.deleteMany();
        // Respond with success message
        res.status(200).json({ message: 'All courses deleted successfully' });
    } catch (error) {
        // Respond with error message if something goes wrong
        console.error('Error deleting courses:', error);
        res.status(500).json({ message: 'Failed to delete courses' });
    }
});

Router.put('/courses/:date', async (req, res) => {
    const courseDate = req.params.date;
    const updateFields = req.body;

    try {
        // Find the course by date
        let course = await Course.findOne({ date: courseDate });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Update only fields with non-null or non-empty string values
        for (const [key, value] of Object.entries(updateFields)) {
            if (value !== null && value !== '') {
                course[key] = value;
            }
        }

        // Save the updated course to the database
        await course.save();

        // Respond with success message and the updated course
        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        // Respond with error message if something goes wrong
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Failed to update course' });
    }
});




Router.get('/auth',(req,res)=>{
    res.send("heloooooo");
});
Router.get('/',(req,res)=>{
    res.send("THis is");
});
module.exports=Router

