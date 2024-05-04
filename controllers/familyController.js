const Family = require('../models/familiesModel');
const Location = require('../models/locationsModel');
const Method = require('../models/methodOfIrrigationModel');
const asyncWrapper = require('../middleware/async');
const {createCustomError} = require('../middleware/custom-error');
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

exports.getAllFamilies = asyncWrapper(async (req, res) =>{
    const families = await Family.find({});
    res.status(200).json({
        status:'success',
        count:families.length,
        details:families
    })
});

exports.createFamily = asyncWrapper(async (req, res, next) => {
    const data = filterObj(req.body, 'family_name', 'frequency_of_irrigation', 'humidity', 'method_of_irrigation', 'location', 'optimal_weather');
    //check id of location and verify if exist
    if(!mongoose.Types.ObjectId.isValid(data.location)) return next(createCustomError('Not valid location id !', 400))
    const location = await Location.findById(data.location)
    if(!location) return next(createCustomError('Not Found location with id that entered', 404))
    //check id of method and verify if exist
    if(!mongoose.Types.ObjectId.isValid(data.method_of_irrigation)) return next(createCustomError('Not valid method id !', 400))
    const method = await Method.findById(data.method_of_irrigation)
    if(!method) return next(createCustomError('Not Found method with id that entered', 404))

    const familyObj = await Family.create(data);
    if (!familyObj) return next(createCustomError('Invalid data', 404));

    res.status(201).json({
        status: 'success',
        details: familyObj,
    });
});

//update
exports.updateFamily = asyncWrapper(async (req, res, next) =>{
  const {id:family_id} = req.params
  if(!mongoose.Types.ObjectId.isValid(family_id)) return next(createCustomError("Not valid id", 404))
  const family = await Family.findOneAndUpdate({_id:family_id},req.body,{
      new:true,
      runValidators:true
  })
  if(!family){
      return next(createCustomError("Not Found", 404))
  }
  res.status(200).json({
      status:'success',
      details:family
  })
});

//delete
exports.deleteFamily = asyncWrapper(async (req, res, next) =>{
    const {id:family_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(family_id)) return next(createCustomError("Not valid id", 404))
    const family = await Family.findOneAndDelete({_id:family_id})
      if(!family){
          return next(createCustomError("Not Found, or already delete", 404))
      }
      res.status(200).json({
          status:'success',
          details:`family ${family.family_name} is deleted succesfully`
      })
});

//search family by name
exports.searchFamilies = asyncWrapper(async (req, res, next) => {
    const searchQuery = req.query.q;
    const sortField = req.query.sortField || 'name'; // Default sorting field is 'name'
    const sortOrder = req.query.sortOrder || 'asc'; // Default sorting order is ascending
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10
  
    const count = await Family.countDocuments({ family_name: { $regex: searchQuery, $options: 'i' } });
  
    const results = await Family.find({ family_name: { $regex: searchQuery, $options: 'i' } })
      .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  
    res.status(200).json({
      status: 'success',
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      details: results,
    });
  });

//search family by id
exports.getFamily = asyncWrapper(async (req,res, next) =>{
  const {id:family_id} = req.params
  if(!mongoose.Types.ObjectId.isValid(family_id)) return next(createCustomError("Not valid id", 404))
  const family = await Family.findOne({_id:family_id})
  if(!family){
      return next(createCustomError("Not Found", 404))
  }
  res.status(200).json({
      status:'success',
      data:family
  })
});