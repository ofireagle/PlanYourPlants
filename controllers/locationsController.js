const Locations = require('../models/locationsModel');
const asyncWrapper = require('../middleware/async');
const { createCustomError } = require('../middleware/custom-error');
const { default: mongoose } = require('mongoose');

exports.getAllLocatins = asyncWrapper(async (req, res, next) =>{
    const locatins = await Locations.find({});
    res.status(200).json({
        status:'success',
        count:locatins.length,
        details:locatins
    })
});

exports.getLocation = asyncWrapper(async(req, res, next) =>{
    const {id:location_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(location_id)) return next(createCustomError('Not Valid id!', 400));
    const location = await Locations.findById(location_id)
    if(!location) return next(createCustomError('Not Found', 404))
    res.status(200).json({
        status:'success',
        details:location
    })
});

exports.addLocation = asyncWrapper(async (req, res, next) =>{
    if(!req.body.location) return next(createCustomError('No Valid Data !!!', 400));
    const location = await Locations.create(req.body);
    if(!location) return next(createCustomError('Something Went wrong, try again', 400));
    res.status(200).json({
        status:'success',
        details:location
    })
});

exports.deleteLocation = asyncWrapper(async (req, res, next) =>{
    const {id: location_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(location_id)) return next(createCustomError('Not Valid id!', 400));
    const location = await Locations.findByIdAndDelete(location_id);
    if(!location) return next(createCustomError('Not exsist or maybe already deleted', 404))
    res.status(200).json({
        status:'success',
        details:`Location: ${location.location} is deleted succesfully from db`
    })
});

exports.editLocation = asyncWrapper(async (req, res, next) =>{
    if(!req.body.location) return next(createCustomError('Not Valid data !!! missing location in request body', 400))
    const {id : location_id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(location_id)) return next(createCustomError("Not valid id", 400))
    const location = await Locations.findByIdAndUpdate(location_id,req.body,{
      new:true,
      runValidators:true
    })
    if(!location) return next(createCustomError('Not Found', 404))
    res.status(200).json({
        status:'success',
        details:location
    })
});