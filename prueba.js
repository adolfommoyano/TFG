const Web3 = require('web3');
const express = require ('express');
const app = express();
const Task = require('./build/contracts/TaskCrud.json');
const jsonParse = require('body-parser');
const fileupload = require ('express-fileupload');
require('dotenv').config();
const openssl = require('openssl-nodejs');
const fs = require('fs');
const zlib = require ('zlib');
const https = require('https');
const API_KEY = process.env.API_KEY;
app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({extended:true}));

const abiDecoder = require('abi-decoder');
const { StringDecoder } = require('string_decoder');
const { stringify } = require('querystring');
abiDecoder.addABI(Task.abi);



app.listen(3000, () => {
    console.log('HTTP server on port 3000');
});


https.createServer({
    cert: fs.readFileSync('server.crt'),
    key: fs.readFileSync('server.key')
},app).listen(444, () => {
    console.log('HTTPS server on port 444');
});


const init = async () => {
    const web3 = new Web3('http://localhost:9545');

    const id = await web3.eth.net.getId();
    const network = Task.networks[id];
    const address = network.address;
    const contract = new web3.eth.Contract(
        Task.abi,
        address
    );
    
    const addresses = await web3.eth.getAccounts();
    const addressSender = addresses[9];

    app.get('/get/hashBlock/:hashBlock', async (req,res,next) => {
        const hashBlock = req.params.hashBlock;
        web3.eth.getTransactionFromBlock(hashBlock).then(console.log)



    })

    app.get('/get/transaction/:hashTransaction', async (req,res,next) => {
        const hashTransaction = req.params.hashTransaction;
        const result = await web3.eth.getTransaction(hashTransaction)
        console.log (result)
        console.log (result.input)
        console.log(abiDecoder.decodeMethod(result.input))
    })

    

  
       

    //Definimos el middleware (respuesta a una petición get al servidor express montando (localhost:3000))
    app.get('/get/:id', async (req, res, next) => {

        //Queremos ver los detalles de una llamada al método insert usando la dirección 0 de prueba que nos proporciona Truffle 
        //const receipt = await contract.methods.createTask("Hola que tal").send({
          //  from: addressSender,
            //gas:3000000
       // });
        //NUMERO DEL BLOQUE Y BLOCK HASH CORRESPONDIENTE A LA TRANSACCIÓN
        //console.log(receipt);
        //console.log(receipt.blockHash);
        //console.log(receipt.blockNumber);

        //const newResult = await contract.methods.readTask(1).call();
        //console.log(newResult)

        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
            console.log("El API KEY incluido en la cabecera de la petición es correcto");
            const id = req.params.id;
            const leer = await contract.methods.readTask(id).call();
            console.log(leer);
            //res.send(leer); Por si queremos que aparezca en la respuesta
        }
        next();
        
    });

    //Definimos el middleware (respuesta a una petición get al servidor express montando (localhost:3000))
    app.get('/get/hash/:hash', async (req, res, next) => {

        //Queremos ver los detalles de una llamada al método insert usando la dirección 0 de prueba que nos proporciona Truffle 
        //const receipt = await contract.methods.createTask("Hola que tal").send({
          //  from: addressSender,
            //gas:3000000
       // });
        //NUMERO DEL BLOQUE Y BLOCK HASH CORRESPONDIENTE A LA TRANSACCIÓN
        //console.log(receipt);
        //console.log(receipt.blockHash);
        //console.log(receipt.blockNumber);

        //const newResult = await contract.methods.readTask(1).call();
        //console.log(newResult)

        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
            console.log("El API KEY incluido en la cabecera de la petición es correcto");
            const hash = req.params.hash;
            console.log("Buscando hash:" + hash)
            const leer = await contract.methods.readTaskByHash(hash).call();
            console.log(leer);
            //res.send(leer); Por si queremos que aparezca en la respuesta
        }
        next();
        
    });
    
    app.post('/post', async (req,res,next) =>{

        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
        
        console.log("El API KEY incluido en la cabecera de la petición es correcto");

        const stringBody = JSON.stringify(req.body);
        const jsonresult = JSON.parse(stringBody);
        console.log(typeof stringBody,"String que vas a introducir:",stringBody);
        console.log(typeof jsonresult,"JSON que envías en la petición:",jsonresult);

        const receipt = await contract.methods.createTask(stringBody).send({
            from: addressSender,
            gas:3000000
        })
        console.log(receipt);
        //res.send(receipt); Por si queremos que aparezca en la respuesta
        }
        next();

    });

    app.post('/post/file',async (req,res,next) =>{
        const buffer = Buffer.from(req.files.file.data);
        const bufferStr = JSON.stringify(buffer)
        console.log("buffer " + buffer)
        console.log("buffer JSON" + bufferStr) 
        
        const receipt = await contract.methods.createTask(bufferStr).send({
            from: addressSender,
            gas: 3000000000
        })
        console.log(receipt)
        /*
        const buffer = Buffer.from(req.files.file.data)
        const bufferHex = buffer.toString('base64')
        
        
        console.log(bufferStr)

     
        
        const receipt = await contract.methods.createTask(bufferStr).send({
            from: addressSender,
            gas: 300000000
        })
        console.log(receipt);
        /*
        const data = JSON.stringify(file);
        const JSSON = JSON.parse(data)
        console.log(data)
        console.log(JSSON)
        /*
        const data = JSON.stringify(file);
        const jsonresult = JSON.parse(data);
        console.log(typeof jsonresult,"JSON que envías en la petición:",jsonresult);
        /*
        console.log(data)
        console.log(file)
        /*
        const stringBody = JSON.stringify(req.body);
        const jsonresult = JSON.parse(stringBody);
        console.log(typeof stringBody,"String que vas a introducir:",stringBody);
        console.log(typeof jsonresult,"JSON que envías en la petición:",jsonresult);

        const receipt = await contract.methods.createTask(stringBody).send({
            from: addressSender,
            gas:3000000
        })
        console.log(receipt);
        //res.send(receipt); Por si queremos que aparezca en la respuesta
        next();
        */
    });

    app.post('/update/:id',async (req,res,next) =>{

        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
        
        console.log("El API KEY incluido en la cabecera de la petición es correcto");
        console.log("Vas a cambiar el json con id: ",req.params.id);
        console.log("Vas a cambiar su descripcion por: ",req.body.description);

        
        const receipt = await contract.methods.updateTask(req.params.id,req.body.description).send({
            from: addressSender,
            gas:3000000
        })
        console.log(receipt);
        //res.send(receipt); Por si queremos que aparezca en la respuesta
        }

        next();
        

    });

    app.get('/delete/:id', async (req,res, next) =>{

        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
        console.log("El API KEY incluido en la cabecera de la petición es correcto");

        
        const id = req.params.id;
        console.log("El registro con id: ",id,", se pondrá a 0")
        const receipt = await contract.methods.deleteTask(id).send({
            from: addressSender,
            gas:3000000
        });
        console.log(receipt);
        //res.send(receipt); Por si queremos que aparezca en la respuesta
    }
    next();

    });
}

init();