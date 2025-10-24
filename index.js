// index.js
const http = require('http');
const {handleReqRes} = require('./handlers/handleReqRes')
const chapterly = {};

chapterly.handleReqRes = handleReqRes;

chapterly.config = {
    port: 3000,
};

chapterly.createServer = () =>{
    const server = http.createServer(chapterly.handleReqRes);
    server.listen(chapterly.config.port, ()=>{
        console.log(`Listening to server at http://localhost:${chapterly.config.port}`);
    })
};

chapterly.createServer();