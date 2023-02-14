const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to ', url)

mongoose.connect(url)
.then(result=>{
    console.log('connected to MongoDB');
})
.catch((error) =>{
    console.log('error connecting to MonoDB:', error.message)
})

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        require: true
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
                return /\d{2,3}-\d{1,}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number of two digits and "-" and digits format.`
        },
        require: [true, 'User number required']
    }
})

contactSchema.set('toJSON', {
    transform:(document, returnedObject) =>{
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Contact', contactSchema)