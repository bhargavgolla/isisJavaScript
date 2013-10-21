# IsisJavaScript

GSoC 2013 Project to create a JS viewer for [Apache ISIS](http://isis.apache.org/)


## Libraries Used:
* [jQuery](http://jquery.com/)
* [jQuery Mobile](http://jquerymobile.com/)
* [jQuery livequery](https://github.com/brandonaaron/livequery/)
* [jQuery Base64](https://github.com/yatt/jquery.base64/)
* [toastr](https://github.com/CodeSeven/toastr/)

## License
isisJavaScript is licensed under [Apache License v2.0](http://www.apache.org/licenses/LICENSE-2.0)

##YouTube Demos
List of youtube demos prepared during GSoC 2013
* [Demo 1 - Dt. Jul 31, 2013](http://youtu.be/AeG0qjNC17c)
* [Demo 2 - Dt. Aug 21, 2013](http://youtu.be/mnvXvqFyU2w)	
* [Demo 3 - Dt. Sep 7, 2013](http://youtu.be/o_REbP2OlNU)	

## Packaging as Phonegap App
You can build this app as a Phonegap using two methods, one is through [Phonegap Build](http://build.phonegap.com/) or using Maven.
### Phonegap Build
* Sign up for [Phonegap Build](http://build.phonegap.com/)
* Create a new app and provide the Github URL https://github.com/bhargavgolla/isisJavaScript.git to create the app. 
* You can make more customizations as per your need by editing the config.xml in the repo by forking this repo.
* After the build is done, you can download apps as per your Platform requirement.

To use a Phonegap built app, you can also download the same [here](https://build.phonegap.com/apps/562086/share). iOS build isn't available in this.

### Maven Build

You need to install the cordova android JAR manually into your local maven repository. There is cordova-2.9.0.jar available in libs/ folder in this repo. You can install this jar using the following command:

	mvn install:install-file -DgroupId=org.apache.cordova -DartifactId=cordova -Dversion=2.9.0 -Dfile=<YOUR_PHONEGAP_ANDROID_JAR>  -Dpackaging=jar

Then run following command from isisJavaScriptViewer/ folder:

    mvn -Dandroid.sdk.path=<YOUR_SDK_PATH> clean install android:apk

Note: android.sdk.path dependency is optional in above command if you have ANDROID_HOME environment variable defined.

This should create an APK for you which can then be installed. You can install the apk on an emulator and run the app.

