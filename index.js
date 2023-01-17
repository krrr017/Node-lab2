const http = require('http');
const path = require('path');
const fs = require('fs');


const server = http.createServer();

server.on('request', (req, res) => {
    //console.log(req);

    if(req.url === '/'){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html')
        res.write('<h1>Hello Node!</h1>')
        res.write('<a href=/write-message>write a message</a>')
        res.write('<br>')
        res.write('<a href=/read-message>read a message</a>')
        res.end();
    }



    if(req.url ==='/write-message' && req.method === 'GET'){
        res.write(`
            <html>
                <head>
                    <title>Send a message</title>
                </head>
                <body>
                    <form action="/write-message" method="POST">
                        <input type="text" name="message" placeholder="Enter your message">
                        <button type="submit">Submit</button>
                    </form>
                </body>
            </html>
        `)
    }

    if(req.url === '/write-message' && req.method === 'POST'){

        const body = [];

        req.on('data', (chunk) => {
            body.push(chunk);
        })

        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();

            const message = parsedBody.split('=')[1];

            fs.writeFile('message.txt', message, (err) => {
                if(err) throw err;
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
            })
        })
    }


    
    if(req.url === '/read-message') {
        fs.readFile('message.txt', 'utf-8', (err, content) => {
            if(err){
                if(err.code === 'ENOENT'){
                    fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                        res.writeHead(404, {'Content-Type': 'text/html'});
                        res.end(content, 'utf8');
                    })
                }else{
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            }else{
                console.log(content);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(`
                    <html>
                        <head>
                            <title>Read a message</title>
                        </head>
                        <body>
                            <h1> ${content}</h1>
                        </body>
                    </html>
                `)
                return res.end();
            }
        })
        
    }
});



server.on('listening', () => {
    console.log('Listening on port 8000');
})

server.listen(8000)