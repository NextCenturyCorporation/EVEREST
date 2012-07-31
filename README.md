## Running the code:
* Install [Node.js] (http://nodejs.org/#download)
* Install the modules - run `npm install` in the Centurion directory
* Run `node app.js` to start the single threaded version, or `node app-cluster.js` to start the threaded version

### Envornment variables

| Name | Description |
|------|-------------|
| DB_PORT | Override the database port from config.js |
| DB_HOST | Override the database hostname from config.js |
| DB_COLLECTION | Override the database collection from config.js |
| DB_DISABLE | Set to 1 to not connect to a database, and store all data in memory. Will load some default data, and clear on exit. |
| NODATA | Set to 1, and use with `DB_DISABLE` to run without loading any default data. |
| PORT | The port to listen for HTTP requests |

To use these, on Unix systems, use `VARNAME=value node app.js` to specify only for that execution, or set them with `export VARNAME=value`.  
On Windows: use `SET VARNAME=value`, then run Node


## Running the API tests
You need Mocha installed globally, run `sudo npm install -g mocha` to install it. Then either run `mocha` in the main directory, or
use `npm test`

Check the [System Setup](https://github.com/ploats/centurion-student-alerting/wiki/System-Setup) wiki page for more information
