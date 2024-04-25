
const express=require('express');
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../model/Notes');
const Router=express.Router();
const { body, validationResult } = require('express-validator');
const User=require('../model/User');


//Route 1: to create notes of the user
Router.post('/addnote',fetchuser,[
    body('title','ENter a valid title').isLength({ min: 3 }),
    body('description','Enter valid description').isLength({ min: 5 }) ,  
],
async (req,res)=>{
    try{

    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }
    const userid=req.user.id;
    // 1st way to save data in database .create donot require to save it autmaticlay saves the daata
    // const newdata=await Notes.create({
    //     user:userEvent,
    //     title:req.body.title,
    //     description:req.body.description,
    //     tag:req.body.tag
    // })

    // 2nd way to save data is first create object of model NOtes
    const newdata=new Notes({
        user:userid,
        title:req.body.title,
        description:req.body.description,
        tag:req.body.tag
    })
    // now save
    newdata.save() ;
    res.json(newdata)
}
catch(err){
    console.log(err);
    res.send("server error");
}


});


//Route2: to fectn notes from user
Router.get('/fetchnote',fetchuser,
async (req,res)=>{
    try{
    const object_id=req.user.id;
    const fetched_notes=await Notes.find({user:object_id});
    console.log(fetched_notes);
    res.status(200).send(fetched_notes);


    }
    catch(err){
        console.log(err);
        res.send(("Server Error"));
    }


});
// Route3: to updat note
// fro upating we use put request
// int put request we pass the id as params ie parameter
// the rquest is like localhost/api/updatenote/id   here id is the id of note to be updated
// we eill pass the content of the note to be updated in the body section 
// to give params in routing url we have to use : after that we cna use params

Router.put('/updatenote/:id',fetchuser,
async (req,res)=>{
    try{
        // first we have to check the user requesting is valid user
        const user_id=req.user.id;
        const userp=await User.findById(user_id);
        if(!userp){
            return res.status(401).send("Invalid credential");
        }
        // now check a valid user is asking for his own notes updation
        // since he has to prvoide for the notes id we can check from there the user_id because userid is foriegn key
        const note_of_user=await Notes.findById(req.params.id);
        if(!note_of_user){
            return res.status(400).send("Invalid credential");
        }
        if(note_of_user.user.toString()!==user_id){
            return res.status(401).send("Invalid credential");
        }
        // if everything is vlaid then we have to create a Notes object 
        // we don't require notes object we have not_of_user already present
        // we use destructing method to get title .....
        const {title,description,tag}=req.body;
        // if body me title diya gya hai to title changr kar do nahi to purana tittel rhne do
        if(title){
            note_of_user.title=title;
            
        }
        if(description){
            note_of_user.description=description;
        }
        if(tag){
            note_of_user.tag=tag;
        }
        const updated_note=await Notes.findByIdAndUpdate(req.params.id,note_of_user,{new:true});
        res.status(200).send(updated_note);
    }
    catch(err){
        console.log(err);
        res.send(("Server Error"));
    }
});


// ROute4: for delting the note
Router.delete('/deletenote/:id',fetchuser,
async(req,res)=>{
    try{
        // first we have to check the user requesting is valid user
        const user_id=req.user.id;
        const userp=await User.findById(user_id);
        if(!userp){
            return res.status(401).send("Invalid credential");
        }
        // now check a valid user is asking for his own notes updation
        // since he has to prvoide for the notes id we can check from there the user_id because userid is foriegn key
        const note_of_user=await Notes.findById(req.params.id);
        if(!note_of_user){
            return res.status(400).send("Invalid credential");
        }
        if(note_of_user.user.toString()!==user_id){
            return res.status(401).send("Invalid credential");
        }
        const delete_note=await Notes.findByIdAndDelete(req.params.id);
        res.status(200).send("successfully deleted");
    }
    catch(err){
        console.log(err);
        res.send(("Server Error"));
    }

});





module.exports=Router
