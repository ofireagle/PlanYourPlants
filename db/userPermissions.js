const ROLE = {
    ADMIN: 1,
    BASIC: 0
};

//control the view
exports.view = (user, model) =>{
    return user.role === ROLE.ADMIN || model.userId === user.id
};

//filter the result scope
exports.scopedFilter = (user, model) =>{
    if(user.role === ROLE.ADMIN) return model;
    return model.filter(model => model.userId === user.id)
};
