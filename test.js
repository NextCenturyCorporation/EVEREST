var sys = require("util"),  
	http = require("http"),  
	url = require("url"),  
	path = require("path"),  
	fs = require("fs");  

http.createServer(function(request, response) {  
	var uri = url.parse(request.url).pathname;
	console.log("URI: "+uri);
	if(uri == "/"){
		uri = "index.html";
	}
	var filename = path.join(process.cwd(), uri);  
	path.exists(filename, function(exists) {  
		if(!exists) {
			console.log("File not found: " + filename);
			response.writeHead(404, {"Content-Type": "text/plain"});  
			response.end("404 Not Found\n");  
			return;  
		}  

		fs.readFile(filename, "binary", function(err, file) {  
			if(err) {
				console.log("Error sending file: "+filename);
				response.writeHead(500, {"Content-Type": "text/plain"});  
				response.end(err + "\n");  
				return;  
			}  

			console.log("Sending "+filename);
			response.writeHead(200);  
			response.end(file, "binary");  
		});  
	});  
}).listen(8080);  

console.log("Server running at http://localhost:8080/");