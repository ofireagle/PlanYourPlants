const Plant = require('../models/plantsModel')
const Family = require('../models/familiesModel');
const User = require('../models/usersModel');
const Location = require('../models/locationsModel');
const MethodOfIrrigation = require('../models/methodOfIrrigationModel');
const asyncWrapper = require('../middleware/async');
const {createCustomError} = require('../middleware/custom-error');
const sharp = require('sharp');
const {scopedFilter, view} = require('../db/userPermissions');
const { default: mongoose } = require('mongoose');
const WeatherApi = require('../api/Weather_API');
const PlantApi = require('../api/Plant_API');
const MainApi = require('../api/Main_API');
const APIFiltering = require('../middleware/APIFiltering')

exports.resizeUserPhoto = (req, res, next) =>{
      req.body.images = [];
    Promise.all(req.files.map(async(file, i) =>{
        const fileName = `ID_user-${req.user.id}-${Date.now()}-${i+1}.jpeg`
        sharp(file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 80})
        .toFile(`public/images/${fileName}`);
        req.body.images.push(fileName); // מארך של כל התמונות
    }))
    next();
};

const filterObj = (obj, ...allowedFields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredObj[key] = obj[key]
      }
    })
    return filteredObj;
}

exports.addPlant = asyncWrapper(async (req, res, next) => {
    const plantDetails = filterObj(req.body, 'name', 'family', 'creator', 'imgUrl', 'description');

    // Check if family ID is entered in the correct structure and if the family exists in the database
    const familyId = plantDetails.family;
    if (!mongoose.Types.ObjectId.isValid(familyId)) {
        return next(createCustomError('Enter valid family ID', 400));
    }
    const family = await Family.findById(familyId);
    if (!family) {
        return next(createCustomError('Family not found', 404));
    }

    const newPlant = await Plant.create(plantDetails);

    // Check if creator field is entered in the body to update the users newPlants
    const userId = plantDetails.creator;
    if (userId) {
        // Check if user ID is entered in the correct structure and if the user exists in the database
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(createCustomError('Enter valid user ID', 400));
        }
        const user = await User.findById(userId);
        user.newPlants.push(newPlant._id);
        await user.save({validateBeforeSave:false});
    }

    res.status(201).json({
        status: 'success',
        details: newPlant
    });
});


exports.getPlant = asyncWrapper(async (req, res, next) =>{
    const {id:plant_id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(plant_id)) return next (createCustomError('No Data Enter, or not valid id', 404))
    const plant = await Plant.findOne({_id:plant_id})
    if(!plant){
        return next(createCustomError("Not Found", 404))
    }
    res.status(200).json({
        status:'success',
        details:plant
    })
});

exports.updatPlant = asyncWrapper(async (req, res, next) =>{
    const {id:plant_id} = req.params
    if(!mongoose.Types.ObjectId.isValid(plant_id)) return next (createCustomError('No Data Enter, or not valid id', 404))

    const data = filterObj(req.body, 'name', 'imgUrl', 'description', 'creator');
    const plant = await Plant.findOneAndUpdate({_id:plant_id},data,{
        new:true,
        runValidators:true
    })
    if(!plant){
        return next(createCustomError("Not Found", 404))
    }
    res.status(200).json({
        status:'success',
        details:plant
    })
});

exports.deletePlant = asyncWrapper(async (req, res, next) => {
    const {id:plant_id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(plant_id)) return next (createCustomError('No Data Enter, or not valid id', 404))
    const plant = await Plant.findByIdAndDelete(plant_id);
    if(!plant) return next(createCustomError('Not Found, or already deleted', 404))
    // Remove the plant from all users lists
    await User.updateMany({ plants: plant_id }, { $pull: { plants: plant_id } });
    await User.updateMany({newPlants: plant}, { $pull: { newPlants: plant_id } });

    res.status(200).json({
      status: 'success',
      message: `Plant ${plant.name}  deleted successfully.`
    });
  });  
  
exports.getAllPlants = asyncWrapper( async(req, res, next) =>{
    const filterResult = new APIFiltering(Plant.find(), req.query);
    filterResult.filter().sort().select().paginate()

    const plants = await filterResult.modelQuery
    res.status(200).json({
        status:'status',
        count:plants.length,
        details:plants
    })
});

exports.getPlants = asyncWrapper(async(req, res, next) =>{
    const ids = req.body.plants;
    const plants = await Plant.find({'_id' : { $in: ids } });
    if(!plants) return next(createCustomError('Bad data', 400));
    res.status(200).json({
        status:'success',
        details:plants
    })
});

exports.searchPlants = asyncWrapper(async (req, res, next) => {
    const searchQuery = req.query.q;
    const sortField = req.query.sortField || 'name'; // Default sorting field is 'name'
    const sortOrder = req.query.sortOrder || 'asc'; // Default sorting order is ascending
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10
  
    const count = await Plant.countDocuments({ name: { $regex: searchQuery, $options: 'i' } });
  
    const results = await Plant.find({ name: { $regex: searchQuery, $options: 'i' } })
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

exports.getWeather = asyncWrapper(async(req, res, next) => {
    const {id:user_id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(user_id)) return next(createCustomError('Not valid id', 400))
    const user = await User.findOne({_id:user_id})
    if(!user) return next(createCustomError('Not Found', 404));
    const weather_api = new WeatherApi(process.env.WEATHER_API_KEY);
    const weatherData = await weather_api.getCurrentWeather(user.city);
    res.status(200).json({
        status:'success',
        details:weatherData
    })
});

exports.getPlan = asyncWrapper(async(req, res, next) => {
    const {id:user_id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(user_id)) return next(createCustomError('Not Valid id !', 400))
    const user = await User.findById(user_id)
    if(!user) return next(createCustomError('Not Found', 404));
    const weather_api = new WeatherApi(process.env.WEATHER_API_KEY);
    const weatherData = await weather_api.getCurrentWeather(user.city);

    const plants = await Plant.find({'_id' : { $in: user.plants } });

    if(!plants) return next(createCustomError('Bad data', 400));
    var families = [];
    for (let i = 0; i < plants.length; i++){
        const family_id = plants[i].family
        if(!mongoose.Types.ObjectId.isValid(family_id)){
            return next(createCustomError("Not valid id", 404))
        }
        let f = await Family.findById(family_id)
        if(!f){
            return next(createCustomError("Not Found", 404))
        }
        let family = {};
        family._id = f._id;
        family.name = f.family_name;
        family.frequency_of_irrigation = f.frequency_of_irrigation;
        family.humidity = f.humidity;
        family.location =  (await Location.findById(f.location)).location;
        family.method_of_irrigation = (await MethodOfIrrigation.findById(f.method_of_irrigation)).method;
        family.optimal_weather = f.optimal_weather;
        families.push(family);
    }
//    families = families.filter((obj, index, self) =>
//         index === self.findIndex((t) => (t._id.equals(obj._id))));
//     console.log(families);
// console.log(families);
    const main_api = await MainApi.calculate(user.date_created, plants, families, weatherData.current.temp_c);
    res.status(200).json({
        status:'success',
        details: main_api
    })
    
});

exports.getRadmonPlant = asyncWrapper(async (req, res, next) =>{
    const countAll = await Plant.count();
    const randomNumber = Math.floor(Math.random() * countAll);
    const radmonPlant = await Plant.findOne().skip(randomNumber);
    res.status(200).json({
        status:'success',
        index:randomNumber + 1,
        details:radmonPlant
    })
});

const findMatch = async (array) => {
    for (const item of array) {
      const existingPlant = await Plant.findOne({ name: { $regex: item, $options: 'i' } });
      if (existingPlant) {
        return existingPlant;
      }
    }
    return null;
}

const doPlantAction = async(plant, family, response, userID) =>{
    if(plant && family){
        if(!plant.imgUrl){
            const updatePlantImg = await Plant.findOneAndUpdate({_id: plant._id},{imgUrl: response.plant_details.image.value})
        }
        if(!plant.description){
            const updatePlantImg = await Plant.findOneAndUpdate({_id: plant._id},{ description: response.plant_details.wiki_description.value})
        }
        return {msg: 'Plant alerady exist in DB' , plant: plant};
    }
    else if(!plant && family){
        const plantSchema = {name: response.plant_name, family: family._id, creator: userID, imgUrl: response.plant_details.image.value, description: response.plant_details.wiki_description.value}
        const newPlant = await Plant.create(plantSchema);
        const user = await User.findById(userID)
        if(user){
            let updateUserNewPlants = await User.findOneAndUpdate(
                { _id: user._id },
                { $push: { newPlants: newPlant._id } },
                { new: true }
            );
        }
        return {msg: 'Plant Added to DB successfully' ,new_Plant: newPlant};
    }
    else{
        return {msg: 'Family does not exist, cannot create', link: response.plant_details.url}
    }
}

exports.IdentifyPlant = asyncWrapper(async (req, res, next) => {
    const apiPlant = new PlantApi(process.env.PLANT_API_KEY);
    const file = req.file;
    if (!file) {
        return next(createCustomError('Please upload image', 404))
    }
    //call to indentify function
    const response = await apiPlant.identifyPlant(file);

    //check if plant already exist in db
    const plantName = response.plant_name
    const commonNames = response.plant_details.common_names
    commonNames.unshift(plantName)
    const searchPlant = await findMatch(commonNames)

    //check if family exist in db
    const familyName = response.plant_details.taxonomy.family
    const searchFamily = await Family.findOne({ family_name: { $regex: familyName, $options: 'i' } })
    const userID = req.user._id
    const dbResponse = await doPlantAction(searchPlant, searchFamily, response, userID)
    res.status(200).json({
      status: 'success',
      dbResponse: dbResponse,  
      details: response
    });
});