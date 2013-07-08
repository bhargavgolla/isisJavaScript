isisJavaScript
==============

GSoC 2013 Project


---
From the command line:

cd myapp
mvn clean package

cd webapp
mvn jetty:run

browse to http://localhost:8080/myapp-webapp/index.html

at login, the defaults are set correctly
- have disabled the basic auth for now, always gets through
- hitting login goes to the (empty) services page.

Can then load up webapp/src/main/webapp/index.html and 
webapp/src/main/webapp/scripts/main.js; Jetty will automatically serve up
any changes (ctrl+R to force reload in Chrome).


---

If you want to develop in Eclipse, and use the 
webapp/ide/eclipse/launch/quickstart_wicket_restful_jdo-webapp.launch to
launch Jetty.  In this case, the webapp will be hosted at the root
(ie http://localhost:8080/) and the IsisURL will need changing accordingly.