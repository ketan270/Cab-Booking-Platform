const http = require("http");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === "GET") {
        handleGetRequest(req, res);
    } else if (method === "POST") {
        handlePostRequest(req, res);
    } else {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed");
    }
});

function handleGetRequest(req, res) {
    if (req.url === '/getdata') {
        // Read user data and render the data.ejs template
        fs.readFile('User.json', 'utf8', (err, data) => {
            let users = [];
            if (!err) {
                users = JSON.parse(data);
            }
            
            renderEjsTemplate('data.ejs', { users }, res);
        });
    } else if (req.url === '/api/users') {
        fs.readFile('User.json', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server Error");
            } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(data);
            }
        });
    } else if (req.url === '/dashboard') {
        // Redirect to localhost:3000 instead of rendering dashboard.ejs
        res.writeHead(302, { Location: 'http://localhost:3000' });
        res.end();
    } else if (req.url === '/') {
        renderEjsTemplate('index.ejs', {}, res);
    } else if (req.url === '/register' || req.url === '/register.html') {
        renderEjsTemplate('register.ejs', {}, res);
    } else {
        // Serve static files
        const filePath = path.join(__dirname, req.url);
        const extname = path.extname(filePath);
        const contentType = getContentType(extname);

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("File Not Found");
                } else {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Server Error");
                }
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content);
            }
        });
    }
}

function renderEjsTemplate(template, data, res) {
    const templatePath = path.join(__dirname, template);
    
    ejs.renderFile(templatePath, data, (err, html) => {
        if (err) {
            console.error('EJS Error:', err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server Error: " + err.message);
        } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        }
    });
}

function handlePostRequest(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const data = JSON.parse(body);
        if (req.url === '/register') {
            handleRegister(data, res);
        } else if (req.url === '/login') {
            handleLogin(data, res);
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
        }
    });
}

function handleRegister(data, res) {
    fs.readFile('User.json', 'utf8', (err, fileContent) => {
        if (err && err.code !== 'ENOENT') {
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Server Error");
        }

        let users = fileContent ? JSON.parse(fileContent) : [];
        if (users.some(user => user.email === data.email)) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            return res.end("Email already exists");
        }

        users.push(data);
        fs.writeFile('User.json', JSON.stringify(users, null, 2), err => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                return res.end("Server Error");
            }
            // Log new user data to terminal
            console.log("\n--- New User Registered ---");
            console.log(`Name: ${data.name}`);
            console.log(`Email: ${data.email}`);
            console.log(`Phone: ${data.phone || 'Not provided'}`);
            console.log("-------------------");
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Registration successful");
        });
    });
}

function handleLogin(data, res) {
    fs.readFile('User.json', 'utf8', (err, fileContent) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Server Error");
        }

        const users = JSON.parse(fileContent);
        const user = users.find(u => u.email === data.email && u.password === data.password);
        if (user) {
            // Log successful login to terminal
            console.log("\n--- User Logged In ---");
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log("-------------------");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(`Login successful for ${user.name}`);
        } else {
            res.writeHead(401, { "Content-Type": "text/plain" });
            res.end("Invalid email or password");
        }
    });
}

function getContentType(extname) {
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'application/javascript';
        case '.json':
            return 'application/json';
        case '.ejs':
            return 'text/html';
        default:
            return 'text/plain';
    }
}

server.listen(5001, () => {
    console.log("Server listening on port 5001");
    console.log("Cabbiez Cab Booking Platform running at http://localhost:5001");
});
