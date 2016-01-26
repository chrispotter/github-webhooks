# Octohooks.badevops.com

A framework and method for registering actions to the Blue Acorn octohooks github hook registered for all Blue Acorn or associated repositories.

Octohooks determines and registers the github hooks for your repository based off of the folder structure in the hooks directory of this repository. 

The folder structure is as follows:
```
hooks/
--<username>/
----<repository>/
```
so for the devops-docker repository for BlueAcornInc organization would look like the following:
```
hooks/
--BlueAcornInc/
----devops-docker/
------repo-example-1.js
------repo-example-2.js
```

Organizations can also have scripts associated with them.  To register an action with the BlueAcornInc organization the folder structure would look as follows:
```
hooks/
--BlueAcornInc/
----org-example-1.js
----org-example-2.js
----devops-docker/
------repo-example-1.js
------repo-example-2.js
```

All files are run asynchronously.

# Creating a github-hooks file.

Hook action files should be treated as node module files.  
```
'use strict'
var logger = require('log4js').getLogger();

var exports = module.exports = {};

```


The functions registered in these functions should be the same as the event triggered from the github entity you have registered the hook with.

```
/**
 * Function called when repo is pinged
 *
 * @param payload - object from github
 * @param helper - helper object with customized functions (optional)
 */
exports.ping = function(payload, helper){
    logger.info('Executing ping function for %s repository', payload.repository.full_name);
};
```

## Testing github web events

It is suggested to use the development process outlined [here](https://developer.github.com/webhooks/configuring/)

A consolidated version of this process is outlined below as well.
### 1. Clone and install this repo
```
git clone <repo>
```
Install the repo
```
npm install
```
Change the config.json.sample to config.json and fill out values
Start the app
```
node .
```
### 2. Install and sign up for [ngrok](https://ngrok.com/)
ngrok creates a tunnel to make local sites public
Copy the downloaded/installed ngrok file to the directory with your node app.

### 3. Start ngrok server
```
./ngrok http <port from config.json>
```

### 4. Register Webhook with desired entity as follows:
Under the settings for the github entity:
![register webhook](https://raw.githubusercontent.com/chrispotter/github-webhooks/assets/githooks-wiki.png)

### 5. Perform action for github to register and check action on hook screen
Scrolling down from the above screen you fill find the following
![payload](https://raw.githubusercontent.com/chrispotter/github-webhooks/assets/payload.png)
Every function you create should follow the name of the ``x-github-event`` from the header, and the payload will follow the json structure of the payload section from github.

To test this hook, click the redeliver button of the hook to further test the interaction of the hook with your local server.
