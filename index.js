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
};

chapterly.createServer();
