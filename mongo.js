const mongoose = require('mongoose')


if (process.argv.length < 2) {
    console.log('give password as argument')
    process.exit(1)
}


const password = process.argv[2]


const url =
    `mongodb+srv://sanseerat99:${password}@cluster0.zfs2jgt.mongodb.net/contacts?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Contact = mongoose.model('contact', contactSchema)




if (process.argv.length === 3) {

    //do a get request to retrive all entries mongo db 
    //console log and exit
    console.log("retrive list")
    Contact.find({}).then(result=>{

        result.forEach(contact => {

            console.log(contact)
            
        })
        mongoose.connection.close()
    })

    //process.exit(1) //since its a callback this line hits before data is retrived

}else{

    const inputName = process.argv[3]
    const inputNumber = process.argv[4]
    const contact = new Contact({
        name: inputName,
        number: inputNumber,
    })    

    if(inputName === undefined || inputNumber === undefined){
        console.log("input name and number undefined")
        process.exit(1)
    }
    contact.save().then(result => {
        console.log(result)
        console.log(`added ${inputName} number ${inputNumber} to phonebook`)
        mongoose.connection.close()
    })

}


