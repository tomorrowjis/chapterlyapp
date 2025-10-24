//dependencies
const url = require("url");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

//handler
const handlers = {};

let isLogged = 0;
//main server handler function
handlers.handleReqRes = (req, res) => {

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const trimmedPath = pathname.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();

  const userDataPath = path.join(__dirname, "database", "users.json");

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

      console.log("here ", userMail, "  ", userPassword);

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

          const redirectUrl = "/dashboard"; 
          isLogged = 1;
          res.writeHead(302, {
            Location: redirectUrl,
          });
          res.end();

        } 
        else res.end("Incorrect Password");
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

  else if(trimmedPath === 'dashboard' && method === 'get' && isLogged === 1){

    const filePath = path.join(__dirname, '..', 'FrontEnd', 'dashboard.html');
    const dashboardData = fs.readFileSync(filePath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(dashboardData);
    
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found'); // Always close the connection
}
};

module.exports = handlers;
