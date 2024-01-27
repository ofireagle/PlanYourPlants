const User = require('../models/usersModel');
const asyncWrapper = require('../middleware/async');
const {createCustomError} = require('../middleware/custom-error')
const APIFiltering = require('../middleware/APIFiltering');
const Plant = require('../models/plantsModel');
const {view, scopedFilter} = require('../db/userPermissions');
const { default: mongoose } = require('mongoose');


const filterObj = (obj, ...allowedFields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredObj[key] = obj[key]
      }
    })
    return filteredObj;
  }

exports.getAllUsers = asyncWrapper(async (req,res, next) =>{
    const filterResult = new APIFiltering(User.find(), req.query)
    filterResult.filter().sort().select().paginate()

    const users = await filterResult.modelQuery;
    
    if(users.length < 1){return next (createCustomError('Not Found a match', 404))}
    res.status(200).json({
        status:'success',
        count:users.length,
        details:users
    })
});

exports.createUser = asyncWrapper(async (req,res) =>{
    const filterBody = filterObj(req.body, 'name', 'email', 'password', 'passwordConfirm', 'phone', 'city')
    const user = await User.create(filterBody)
    res.status(201).json({
        status:'success',
        data:user
    })
});

exports.getUser = asyncWrapper(async (req,res, next) =>{
    const {id:user_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(user_id)) return next(createCustomError('Not valid id !', 400))
    const user = await User.findOne({_id:user_id})
    if(!user){
        return next(createCustomError("Not Found", 404))
    }
    res.status(200).json({
        status:'success',
        details:user
    })
});


exports.getUserByToken = asyncWrapper(async (req,res, next) =>{
    if(!req.user){
        return next(createCustomError("Not Found", 404))
    }
    res.status(200).json({
        status:'success',
        details:req.user
    })
});

exports.updateUser = asyncWrapper(async (req, res, next) =>{
    const user_id = req.user._id
    const user = await User.findOneAndUpdate({_id:user_id},req.body,{
        new:true,
        runValidators:true
    })
    if(!user){
        return next(createCustomError("Not Found", 404))
    }
    res.status(200).json({
        status:'success',
        details:user
    })
});

exports.deleteUser = asyncWrapper(async (req, res, next) =>{
    const {id:user_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(user_id)) return next(createCustomError('Not valid id !', 400))
    const user = await User.findOneAndDelete({_id:user_id})
    if(!user){
        return next(createCustomError("Not Found", 404))
    }
    res.status(200).json({
        status:'success',
        data:`User ${user.name} deleted succesfully`
    })
});

exports.deletePlantFromUserList = asyncWrapper(async (req, res, next) =>{
    const {plants} = req.body
    const user = req.user
    const matchingPlantIds = user.plants.filter((id) => plants.includes(id.toString()));
    console.log(matchingPlantIds);
    if(matchingPlantIds.length === 0) return next(createCustomError('Not Found this plants id in user list',404))
    const resp = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { plants: { $in: matchingPlantIds } } }
    ); 

    res.status(200).json({
        status: 'success',
        details: `Plants removed from user list succesfully`
    });
})

exports.getPlantsList = asyncWrapper(async (req, res, next) => {
    const userID = req.user._id;
    const user = await User.findById(userID).populate('plants');
    if (!user) return next(createCustomError("User Not Found", 404));
  
    // Check and remove plants that no longer exist in the DB
    const validPlants = user.plants.filter(plant => plant !== null);
    user.plants = validPlants;
    await user.save({ validateBeforeSave: false });
  
    res.status(200).json({
      status: 'success',
      count:user.plants.length,
      details: user.plants,
    });
  });
  

exports.addPlantToUser =  asyncWrapper(async (req, res, next) =>{
    const userID = req.user._id;
    const plantID = req.body.plantID;
    if(!plantID){
        return next(createCustomError("No Data Enter", 404))
    }
    const plant = await Plant.findById(plantID);
    if(!plant){
        return next(createCustomError("Not Found", 404))
    }
    const user =  await User.findOneAndUpdate(
        { _id: userID },
        { $addToSet: { plants: plant } },
        { new: true }
    );
    
    res.status(200).json({
        status:'success',
        data:user
    })
});

// exports.addImages = asyncWrapper(async(req , res, next) =>{
//     const added = await User.findByIdAndUpdate(req.user._id,{images:req.body.images});
//     if(!added){
//         return next(createCustomError("Not valid", 404))
//     }
//     res.status(200).json({
//         status:'succes',
//         data:added
//     })
// })
