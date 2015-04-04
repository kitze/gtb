# List of current commands:

- gulp projects --- List all the projects defined in projects.json and pick one to run, if there are no projects available prompt for one
- gulp run --- List all projects
- gulp run -n projectName --- Run the project with name "projectName" from projects.json, if there is no "projectName" project show a menu for adding it

-------------------------
# To implement:

- gulp run -n getfood -t copy:images --- Run specific task on a project
- gulp build -n getfood 
- gulp build -b normal -n getfood 
- gulp build -b copy -n getfood
- gulp copy -n getfood