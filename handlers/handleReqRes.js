//dependencies
const url = require("url");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

//handler
const handlers = {};

//session handler

const sessions = {};

//main server handler function
handlers.handleReqRes = (req, res) => {

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const trimmedPath = pathname.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();

  const userDataPath = path.join(__dirname, "database", "users.json");
  const bookDataPath = path.join(__dirname, "database", "booksInfo.json");

  console.log(`Request received: ${method.toUpperCase()} /${trimmedPath}`);

  //Landing page

  if(trimmedPath === ''){

    const landingPath = path.join(__dirname, '..', 'FrontEnd', 'landingPage.html');
    const landingPage = fs.readFileSync(landingPath, 'utf-8');
    res.writeHead(300, { "Content-Type": "text/html"});
    res.end(landingPage);

  }
  //Login Pagee

  else if (trimmedPath === "login" && method === "get") {
    const fileData = fs.readFileSync("./FrontEnd/login.html", "utf-8");
    res.writeHead(303, { "Content-Type": "text/html" });
    res.write(fileData);
    res.end(() => {
      console.log("Login Page Arrived");
    });
  } 

  //Login Request

  else if (trimmedPath === "login" && method === "post") {


    var data = "";

    req.on("data", (chunk) => {
      data += chunk.toString();
    });

    const userDataBaseFile = fs.readFileSync(userDataPath, "utf-8");
    const userInfoAsObject = JSON.parse(userDataBaseFile);

    console.log(userInfoAsObject);

    req.on("end", () => {   
      
      const loginData = querystring.parse(data);
      console.log(loginData);

      const userMail = loginData.mail;
      const userPassword = loginData.password;

      console.log("here ", userMail, "  ", userPassword,);

      const ifUserExists = userInfoAsObject[userMail] ? userInfoAsObject[userMail] : null;
      console.log("excption ", ifUserExists);

      if (ifUserExists === null) { // if user exists

        const redirectUrl = "/login"; 
          res.writeHead(302, {
            Location: redirectUrl,
          });
          res.end();

      }
      else{
        if (ifUserExists.password === userPassword) {

          const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

          sessions[sessionId] = { 
            mail: userMail,
            loggedInAt: Date.now() 
           };

          const redirectUrl = "/dashboard"; 
          res.writeHead(302, {
            Location: redirectUrl,
            'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly` 
           });
          res.end();

        } 
      else {
        //alert('Inncorrect Password')
        const redirectUrl = "/login"; 
          res.writeHead(302, {
            Location: redirectUrl,
           });
          res.end('<html><script>alert("Incorrect Password");</script></html>');
      }
      }

    });

  }

  //Registration Page

  else if (trimmedPath === "register" && method === "get") {
    const fileData = fs.readFileSync("./FrontEnd/register.html", "utf-8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fileData);
  }

  //Login Request

  else if (trimmedPath === "register" && method === "post") {
    var newUserData = "";
    req.on("data", (chunk) => {
      newUserData += chunk.toString();
    });

    req.on("end", () => {
      const newUser = querystring.parse(newUserData);
      console.log(newUser);

      const mail = newUser.mail;

      const userObjectInfo = {
        password: newUser.password,
        name: newUser.name,
      };
      console.log(userObjectInfo);

      const userInfo = fs.readFileSync(userDataPath, "utf-8");
      const userInfoObj = JSON.parse(userInfo);

      const userBookInfo = fs.readFileSync(bookDataPath, "utf-8");
      const userBookInfoObj = JSON.parse(userBookInfo);

      userBookInfoObj[mail] = {};

      const userBookInfoJson = JSON.stringify(userBookInfoObj, null, 2);
      fs.writeFileSync(bookDataPath, userBookInfoJson, 'utf-8');

      console.log("prev");
      userInfoObj[mail] = userObjectInfo;
      console.log(userInfoObj);
      console.log("post");

      const updatedUserInfo = JSON.stringify(userInfoObj, null, 2);
      fs.writeFileSync(userDataPath, updatedUserInfo, "utf-8");

      const redirectUrl = "/login"; 
        res.writeHead(302, {
            Location: redirectUrl,
        });
       res.end();
    });
  }

  //Loggin in to dashboard

  else if(trimmedPath === 'dashboard' && method === 'get'){

    const cookieHeader = req.headers.cookie;
    let sessionId = null;

    if (cookieHeader) {
      
        const cookies = querystring.parse(cookieHeader, '; ', '=');
        sessionId = cookies.sessionId;

    }

    if(sessionId && sessions[sessionId]){

        const filePath = path.join(__dirname, '..', 'FrontEnd', 'dashboard.html');
        const dashboardData = fs.readFileSync(filePath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(dashboardData);
    } else { 
      //If there's no valid session means the user isn't authenticated by the server
        const redirectUrl = "/login"; 
        res.writeHead(302, {
            Location: redirectUrl,
        });
        res.end();
    }
    
  }

  else if(trimmedPath === 'books' && method === 'get'){

    const cookieHeader = req.headers.cookie;
    let sessionId = null;
    if (cookieHeader) {
        const cookies = querystring.parse(cookieHeader, '; ', '=');
        sessionId = cookies.sessionId;
    }

    if(sessionId && sessions[sessionId]){
      const userEmail = sessions[sessionId].mail;
      const booksFile = fs.readFileSync(bookDataPath, 'utf-8');
      const booksData = JSON.parse(booksFile);

      const individualBookData = booksData[userEmail];

      console.log(userEmail , ' THis is the mail');

      console.log(individualBookData);

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(individualBookData));

    } else { 
      //If there's no valid session means the user isn't authenticated by the server
        const redirectUrl = "/login"; 
        res.writeHead(302, {
            Location: redirectUrl,
        });
        res.end();
    }

  }

  else if(trimmedPath === 'books' && method === 'post'){

    const cookieHeader = req.headers.cookie;
    let sessionId = null;
    if (cookieHeader) {
        const cookies = querystring.parse(cookieHeader, '; ', '=');
        sessionId = cookies.sessionId;
    }

    if(sessionId && sessions[sessionId]){

      let newBookInfo ='';

      req.on('data', (chunk) => {
        newBookInfo+=chunk.toString();
      })

      req.on('end', ()=>{
         const newBookObject = JSON.parse(newBookInfo);

         const userEmail = sessions[sessionId].mail;
         const booksFile = fs.readFileSync(bookDataPath, 'utf-8');
         const booksData = JSON.parse(booksFile);

          const newBookId = newBookObject.id;

          booksData[userEmail][newBookId] = newBookObject;

          const updatedBookInfo = JSON.stringify(booksData, null, 2);
          fs.writeFileSync(bookDataPath, updatedBookInfo, "utf-8");

          res.end();
      })

    } else { 
      //If there's no valid session means the user isn't authenticated by the server
        const redirectUrl = "/dashboard"; 
        res.writeHead(302, {
            Location: redirectUrl,
        });
        res.end();
    }
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
}
};

module.exports = handlers;
