const Web3 = require('web3');
const express = require ('express');
const app = express();
const Task = require('./build/contracts/TaskCrud.json');
const jsonParse = require('body-parser');
const fileupload = require ('express-fileupload');
require('dotenv').config();
const openssl = require('openssl-nodejs');
const fs = require('fs');
const zlib = new require('zlib');
const https = require('https');
const API_KEY = process.env.API_KEY;
app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({extended:true}));

const abiDecoder = require('abi-decoder');
const { StringDecoder } = require('string_decoder');
const { stringify } = require('querystring');
const { Console } = require('console');
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
    const web3 = new Web3('http://127.0.0.1:9545');

    const id = await web3.eth.net.getId();
    const network = Task.networks[id];
    const address = network.address;
    const contract = new web3.eth.Contract(
        Task.abi,
        address
    );
    
    const addresses = await web3.eth.getAccounts();
    const addressSender = addresses[9];

    app.get('/get/block/:hashBlock', async (req,res,next) => {
        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
        const hashBlock = req.params.hashBlock;
        web3.eth.getTransactionFromBlock(hashBlock).then(console.log)
        .then((leer) => {
            res.status(201).json(leer);
        }).catch(err => {
            res.status(403).send("Impossible to find block");
        });
        }
    })

    app.get('/get/transaction/:hashTransaction', async (req,res,next) => {
        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else if(req.params.hashTransaction === ''){
            res.status(400).send("Invalid transaction hash")
        }else{
        const hashTransaction = req.params.hashTransaction;
        const result = await web3.eth.getTransaction(hashTransaction)
       
        console.log(abiDecoder.decodeMethod(result.input))

        .then((leer) => {
            res.status(201).json(leer);
        }).catch(err => {
            res.status(403).send("Impossible to find transaction");
        });
        }
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
            const leer = await contract.methods.readTask(id).call()

            .then((leer) => {
                res.status(201).json(leer);
            }).catch( err => {
                res.status(403).send("Impossible to find id");
            });
            console.log(leer)
            //res.send(leer); Por si queremos que aparezca en la respuesta
            
        }
        
        
    });

    //Definimos el middleware (respuesta a una petición get al servidor express montando (localhost:3000))
    app.get('/get/contentHash/:hash', async (req, res, next) => {

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
        }else if(req.params.hash === ''){
            res.status(400).send("Invalid content hash")
        }else{
            console.log("El API KEY incluido en la cabecera de la petición es correcto");
            const hash = req.params.hash;
            console.log("Buscando hash:" + hash)
            const leer = await contract.methods.readTaskByHash(hash).call()
            .then((leer) => {
                res.status(201).json(leer);
            }).catch( err => {
                res.status(403).send("Impossible to find hash");
            });
            console.log(leer);
            //res.send(leer); Por si queremos que aparezca en la respuesta
        }
        next();
        
    });
    
    app.post('/post', async (req,res,next) =>{

        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else if(JSON.stringify(req.body) === '' || JSON.stringify(req.body) === '{}'){
            res.status(400).send("Invalid JSON")
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
        res.status(200).json(receipt);
        }

    });

    app.post('/post/file',async (req,res,next) =>{
        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else if(req.files.file === '' || req.files.file === '{}'){
            res.status(400).send("Invalid file")
        }else{

        //const buffer = Buffer.from(req.files.file.data);
        //const buffer = req.files.file.data;
        const file = req.files.file;
        const fileStr = JSON.stringify(file)
        console.log("Información del archivo" + file)
        console.log("JSON que introducimos con la información del archivo" + fileStr) 
        
        const receipt = await contract.methods.createTask(fileStr).send({
            from: addressSender,
            gas: 3000000000
        })
        console.log(receipt)

        res.status(200).json(receipt);
        }
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
        }else if(req.params.id === '' || req.params.id === '{}'){
            res.status(400).send("Invalid JSON")
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
        res.status(200).json(receipt);
        }
        

    });

    app.post('/update', async (req, res,next) => {
        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
        res.status(400).send("Invalid id for update");
        }    
    });

    app.get('/delete/:id', async (req,res,next) =>{

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

    });

    app.post('/delete', async (req, res,next) => {
        if(req.headers.api !== API_KEY){
            next(new Error("El API KEY incluido en la cabecera de la petición es incorrecto"));
        }else{
        res.status(400).send("Invalid id for delete");
        }    
    });


}

init();