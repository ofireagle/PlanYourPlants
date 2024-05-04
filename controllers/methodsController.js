const Methods = require('../models/methodOfIrrigationModel');
const asyncWrapper = require('../middleware/async');
const { createCustomError } = require('../middleware/custom-error');

exports.getAllMethods = asyncWrapper(async (req, res, next) =>{
    const methods = await Methods.find({});
    res.status(200).json({
        status:'success',
        count:methods.length,
        details:methods
    })
});

exports.getMethod = asyncWrapper(async(req, res, next) =>{
    const {id:method_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(method_id)) return next(createCustomError('Not Valid id!', 400));
    const method = await Methods.findById(method_id)
    if(!method) return next(createCustomError('Not Found', 404))
    res.status(200).json({
        status:'success',
        details:method
    })
});

exports.addMethod = asyncWrapper(async (req, res, next) =>{
    if(!req.body.method) return next(createCustomError('No Valid Data !!!', 400));
    const data = {method:req.body.method}
    
    const method = await Methods.create(data);
    if(!method) return next(createCustomError('Something Went wrong, try again', 400));
    res.status(200).json({
        status:'success',
        details:method
    })
});

exports.deleteMethod = asyncWrapper(async (req, res, next) =>{
    const {id: method_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(method_id)) return next(createCustomError('Not Valid id!', 400));
    const method = await Methods.findByIdAndDelete(method_id);
    if(!method) return next(createCustomError('Not exsist or maybe already deleted', 404))
    res.status(200).json({
        status:'success',
        details:`method: ${method.method} is deleted succesfully from db`
    })
});

exports.editMethod = asyncWrapper(async (req, res, next) =>{
    if(!req.body.method) return next(createCustomError('Not Valid data !!! missing method in request body', 400))
    const {id : method_id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(method_id)) return next(createCustomError("Not valid id", 400))
    const method = await Methods.findByIdAndUpdate(method_id,req.body,{
      new:true,
      runValidators:true
    })
    if(!method) return next(createCustomError('Not Found', 404))
    res.status(200).json({
        status:'success',
        details:method
    })
});