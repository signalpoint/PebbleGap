/**
 * Pebble's "ready" event listener.
 */
Pebble.addEventListener("ready", function(e) {

    // Set Drupal site_path, e.g. http://www.example.com (no trailing slash)
    Pebble.drupal.settings.site_path = "";
    
    // Initialize pebble-drupal.
    if (Pebble.drupal.bootstrap()) {
      
      // Place your custom code here...
      //drupal_set_message(Pebble.drupal.settings.site_path, {title:"Hello World"});
      
      system_connect({success:function(data){
          
      }});
      
    }

});

/**
 * pebble-drupal (https://github.com/signalpoint/pebble-drupal)
 */
Pebble.drupal = {};

/**
 * Default settings. Do not change values here, instead change the values in
 * your "ready" EventListener for Pebble.
 */
Pebble.drupal.settings = {
  site_path:"",
  base_path:"/",
  endpoint:"pebble"
};

/**
 * The bootsrap function for Pebble and Drupal.
 */
Pebble.drupal.bootstrap = function() {
  var result = true;
  // Make sure the site_path is set.
  if (this.settings.site_path == "") {
    result = false;
    drupal_set_message("The Drupal site_path is not set!");
  }
  return result;
};

/**
 * Drupal Services Resource Implementations.
 */
Pebble.drupal.services = {};
// API
Pebble.drupal.services.api = {
  call:function(options) {
    try {
      var response;
      var request = new XMLHttpRequest();
      var method = options.method;
      var url = Pebble.drupal.settings.site_path + 
                Pebble.drupal.settings.base_path + '?q=' +
                Pebble.drupal.settings.endpoint + '/' + options.path;
      request.onreadystatechange = function(e) {
        console.log('readyState = ' + request.readyState);
        console.log('status = ' + request.status);
        if (request.readyState == 4 && request.status == 200) {
          console.log(request.responseText);
          response = JSON.parse(request.responseText);
          options.success(response);
        }
      }
      dpm(url);
      request.open(method, url, true);
      if (method.toUpperCase() == 'POST') {
        request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      }
      request.send(null);
      //request.send();
    }
    catch (error) {
      console.log('Pebble.drupal.services.api - error - ' + error);
    }
  }
};
// System Connect
function system_connect(options) {
  Pebble.drupal.services.api.call({
      method:"POST",
      path:"system/connect.json",
      success:function(data){
        var user = data.user;
        drupal_set_message("Hello User #" + user.uid + "!");
        options.success(data);
      }
  });
}

/**
 * Given a JSON object or string, this will print it to the console.
 */
function dpm(data) {
  if (data) {
    if (typeof data === 'object') {
      console.log(JSON.stringify(data));
    }
    else {
      console.log(data);
    }
  }
}

/**
 * Given a string, this will display a simple notification on Pebble. You may
 * optionally pass in a second argument as a JSON object, with these properties:
 *   title - a string to display as the title of the notification.
 */
function drupal_set_message(message) {
  var title = "Message";
  if (arguments[1]) {
    var options = arguments[1];
    if (options.title) { title = options.title; }
  }
  Pebble.showSimpleNotificationOnPebble(title, message);
}

