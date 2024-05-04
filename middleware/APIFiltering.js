class APIfIltering {
    constructor(modelQuery, reqQuery){
        this.modelQuery = modelQuery;
        this.reqQuery = reqQuery;
    }

    filter() {
        const filterObj =  { ...this.reqQuery };
        const filteredOut = ['sort','page','limit','fields'];
        filteredOut.forEach(el=> delete filterObj[el]);
        this.modelQuery = this.modelQuery.find(filterObj);
        return this;
    }

    sort() {
        if(this.reqQuery.sort){ 
            const sortObj = this.reqQuery.sort.split(',').join(" ");
            this.modelQuery = this.modelQuery.sort(sortObj)
        }
        return this;
    }

    select() {
        let fields;
        if (this.reqQuery.fields) {
            fields = this.reqQuery.fields.split(',').join(' ');
        }
        else{
            fields = '-__v';
        }
        this.modelQuery =  this.modelQuery.select(fields);
        return this;
    }
    
    paginate(){
        let page = 1;
        let limit = 10;
        if(this.reqQuery.page){
            page = this.reqQuery.page;
            limit = this.reqQuery.limit ||10;
            const skip = (page - 1) * limit;
            this.modelQuery =  this.modelQuery.skip(skip).limit(limit);
        }
        return this;
    }
}

module.exports = APIfIltering;