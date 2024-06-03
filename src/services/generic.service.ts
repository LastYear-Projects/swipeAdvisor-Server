import mongoose, { Document } from "mongoose"

const service = (Model: mongoose.Model<any>) => {
    const getAll = async () => {
        if(Model.modelName == "benefit"){
            const query = [
                {path: "businessId", select: " -_id"},
                {path: "creditCardId", select: " -_id"}
            ]
            return await Model.find({}).populate(query).exec();
        } 
        return await Model.find({})
    }

    const add = async (item) => {
        const newModel:Document = new Model(item);
        return await newModel.save()
    }

    const deleteAll = async()=> {
        return await Model.deleteMany({})
    }





    return {
        getAll,
        add,
        deleteAll
    }

    
}

export default service;