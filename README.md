# GTB (Gulp The Builder)

[![Join the chat at https://gitter.im/kitze/gtb](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/kitze/gtb?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Use gulp without the hassle of actually learning and writing gulp.

What is it?
-------
**GTB** is a npm module which with the help of gulp and node.js can help you make your front-end development blazing fast, no matter what frameworks, libraries or languages you use.

What does GTB do?
-------

 1. **Watch**: watches your project directory for changes and acts accordingly depending on what you've changed
 2. **LiveReload**: if you make a change in a ```.js, .html, .jade, .json, .coffee``` file it will automatically refresh your browser when you save
 3. **Auto-inject changed CSS in the browser**: if you make a change in a ```.css, .scss, .sass``` file it will automatically inject the changes in the browser so you don't even have to do a full page reload. If you're viewing your application on multiple browsers you will see the changes reflect
This may especially come in handy when you're writing/debugging css for a part of your application that isn't visible or reachable at a first glance. For example if you're debugging a dialog that can only be shown with doing few clicks, or a section that's far down your page. 
A full page refresh will throw you off track every time you make a change, but when your css is auto-injected you will see the changes instantly no matter which part of your site your editing.
 4. **Compile SASS**: Compiles sass/scss, suports **sass globbing** so you can import whole folders (not default feature of sass) so for example you can write ```@import "sections/*";``` and have your whole folder imported.
 5. **Compile Jade/Coffeescript**: Compiles .jade to .html and .coffee to .js
 6. **Autoprefix CSS**: It makes your css development a little bit easier so you don't have to put all the browser prefixes by yourself. They'll be automatically added so when you write ``` display:flex ``` it will add the ```-webkit and -ms-``` prefixes automatically.
 7. **Image Minification**: Your png and jpg images are going to get optimizied and minified by imagemin automatically.
 8. **Concatenate, Minify & Annotate JS**: Your js files will be joined in one ``` app.js ``` file, no matter how much files you have in your js folder. If you're using angular your code will be automatically annotated so you don't [have to write your dependencies as strings](https://docs.angularjs.org/tutorial/step_05). If you're building the app in production mode  the code will be uglified (minified).
 9. **Notifications on compile errors**. If you have an error in a sass/jade/coffeescript file you don't have to open the terminal everytime to check what the error was. You will get a native Linux/Windows/OS X notification with the error so you can start fixing it immediately.
 10. **Include bower dependencies**: If you have some bower dependencies installed it will find their main files and include them in their final build, no matter if they're css or js. So for example if in your project directory you run ```bower install angular jquery --save ``` the angular and jquery main files would end up in your lib.js library. And if you ``` bower install normalize.css --save ``` the normalize.css will end up in your lib.css file. 
 11. **Custom bower logic**: If you install a bower dependency that includes many files by default and you just want to include one or few files from the whole library you can use some custom logic in your ```gulp-config.json``` file that will be generated inside your project. So if i have installed ```ngDialog``` with bower and i just want to include the js file without the themes, i can have this logic in my ```gulp-config.json```.
 12. **Watch bower.json for changes**: If you modify your bower.json file while gtb's watcher is running the dependencies you've added/deleted will be automatically added/deleted from your ```bower_components``` folder. Same logic goes if you pull a change from github and some of your collaborators added a new library in the bower.json it will be automatically be installed and you will get a notification.
 13. **Include library fonts**: Let's say you have **bootstrap** or **fontawesome** installed as a bower dependencies. GTB will take the fonts out of the library and copy them in your build folder and it will also modify their css files to link to the fonts properly. So you don't need to bother  to manually  copy or include the fonts.
 14. **Run a server**: Your app (actually the final build folder) will be ran on a server ```http://localhost:9000``` (9000 is default you can change the port for every project). 
 This has few benefits. The first one is that you open http://localhost:9000 on multiple devices on your home network and debug the changes on a pc, laptop, tablet and phone simultaneously.
 The second one is if you're creating an angular app, by default you cannot just open index.html in your browser because you will get a cross origin request error when angular tries to load the templates and other files it needs from your local machine. Also you cannot use html5 routes (without hashbang #) When the app is run with a server the requests and the html5 mode are not a problem anymore.
 15. **History API Fallback**: The connect server has the [historyApiFallback](https://github.com/bripkens/connect-history-api-fallback) plugin as a middleware. So if you're using angular and you want to use ```  $locationProvider.html5Mode(true);``` so your app can run without a hashbang in the url then you'll have a problem because if you have a route called http://my.app/#!/users it will work but if the route is http://my.app/users it won't work and the browser will throw an error that the route is not found. The history api fallback plugin can proxy requests through a specified index page, so no matter which url you're accessing the index.html page can be served, which is the only way to debug angular apps in html5 mode.
 16. **Zip the build**: With the zip command you can easily archive a production version of your project in a zipfile with an added timestamp in the filename so you can send the zip version to someone in few seconds. You can have as many zip files, they will be generated in the zip folder.

 
Files that GTB adds to your project
-------

 - GTB stores the names and directories of your project in a **projects.json** file in your home directory. So if you want to manually edit it on 
 Linux/OS X you can go to
 ```/home/username/projects.json```
 or in Windows
  ```C:\Users\Username\projects.json``` 
 - GTB generates a **gulp-config.json** file for your project so inside of it you can specify the ```additionalBowerFiles```, ```ignoredFiles``` or all the settings that you want to set on a project level. If you use a revision control system like git or svn and add that file then the same config will be used by all of the contributors to the project.
 - GTB also generates a **custom-gulp-config.json** that in the beginning is a simple copy of **gulp-config.json** and it will override every setting from **gulp-config.json** So for example if on a project level the ```livereload``` setting is set to ```true``` but for some weird reason you hate livereload and want to disable it on your pc then you can edit the setting in the **custom-gulp.json**. If you use git or svn that file won't be added to the repository.

How to install?
-------
First, you have to have [node.js](https://nodejs.org/) on your machine.
Then make sure you have bower installed as a global npm module:
 ```npm install bower -g``` 
Then just install gtb as a global npm module:
 ``` npm install gtb -g ```.

List of commands
-------
 - ``` gtb ``` - List of gtb features
 - ``` gtb projects``` - List all of your projects and pick one to run
 - ``` gtb . ``` - Run current directory that's opened in terminal
 - ``` gtb run -n example ``` -  Run the project with the name "example", if - "example" doesn't exist in your projects, a prompt will be shown to add it
 - ``` gtb run -n example -c copy:images ``` - Execute just specific gulp task on the project
  
-------------------------
# Commands to implement:

- ``` gtb build example ``` - shorthand for building a project in production mode
- ``` gtb -n example -c compile:sass, copy:images, server``` - execute a specific list of tasks on the project

# Features to implement

 - automatically remove console.logs in production mode
 - synchronize clicks, forms and inputs if debugging the project on multiple devices at once
 - FTP integration
 - integrate fontello api for easier downloading and management of icons without the hassle of extracting archives, copying and pasting files
 - minify class names
 - LESS compile support
 - if using angular put all the .html templates in angular templateCache so they're not loaded separately
 - use cachebusting (i.e app.js?ver=134818) for getting the hash value of the files, to prevent the browser from caching js/css files that we need to be updated  
 - use Andy Osmani's critical css plugin for extracting critical css to the head of the page, so the user can see the content faster
 - use gulp-spritesmith for joining small png files together in a sprite and automatically generate css for them