module.exports = async (mongoose) => {
    const exampleEventModel = mongoose.data.model('done', new mongoose.Schema({
        controlIndexHash: {type: String, required: true},
        network: {type: String},
        created: {type: Date, required: true, default: Date.now},
        code: {type: String}      
      }));
      new exampleEventModel({code: 444, controlIndexHash: 444, 
        created: moment().add(-20, 'hours').toISOString()}).save();
      new exampleEventModel({code: 445, controlIndexHash: 445, 
        created: moment().add(-20, 'hours').toISOString()}).save();
      new exampleEventModel({code: 446, controlIndexHash: 446}).save();
      new exampleEventModel({code: 447, controlIndexHash: 447}).save();
      new exampleEventModel({code: 448, controlIndexHash: 448}).save();


      return exampleEventModel;
}