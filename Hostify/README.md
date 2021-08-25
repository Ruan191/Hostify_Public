# Hostify

## Distinctiveness and Complexity:

Hostify is a webapplication that allowes users to easily create and share webpages with friends without the need to worry about the backend or hosting, by providing the user with hostify's very own ide. Hostify's ide will enable users to easily make / edit and view their webpage. Hostify also provide security to its users by removing javascript from the page to ensure the safety of the webpage when shared of the webpage and enable the developer to set the privacy of their webpage, if set to private only the owner would be able to see the webpage.

As you might have guest most of the complexity lies with the IDE developed the ide such as Visual Code Hostify IDE provides the following:

* Syntax highlighting.
* Key press logic.
* Remembers the state of the design.
* The way the code is structured in the design does not influence the view of the page.
* Selected lines are boxed to help users see what line they are working on.
* Rendering are line based so that instead of updating the entire text, only the line that has been worked on will be updated when needed. This helps with performance of the IDE.
* Enable users to make use of tabs (Alt key must be pressed to trigger a tab).


## Content of DL files:

#### main

* **models.py:** Defines all the entities in the database and their relations.
* **urls.py:** Contains all the links used on the server side.
* **views.py:** Contains all the logic on what happens when a user send a request to the a url link of the server

#### templates\DL

* **doc_design.html:** The html page for the IDE where users will create / edit their webpage.
* **Index.html:** The first page that will be seen once logged in and provides access to the creating a new webpage and navigating  through the already made webpages.
* **layout.html:** The layout of the navigation bar seen on index.html.
* **login.html:** Used to login to the server.
* **register.html:** Used to register a new account to the server.
* **view.html:** Used for displaying the webpage the user made. 

#### static\DL

* **doc_design.css:** Contains the style for the design page / ide.
* **doc_design.js:** Contains all the logic for the ide such as syntax highlighting, design rendering, saving design to server, link to the view page, paste logic, keypress logic, setting the privacy etc
* **doc_view.js:** Handles the logic on how the page should be rendered that is received from the server.
* **Layout.css:** Styles for the index, login and register page.
* **Nav.js:** Contains the logic for travelling trough sections of the index page.

## How to run the server

All requirements can be found in requirements.txt.

Note, you will need to fill in a secret key in settings.py aswell as an email address for the email verifications. Email address should also be filled in views.py in the register function. You will also need setup a mysql server and fill the details in settings.py. After all these are doen run these commands in the terminal:

* python manage.py makemigrations
* python manage.py migrate
* python manage.py runserver
