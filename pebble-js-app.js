/**
 * Pebble's "ready" event listener.
 */
Pebble.addEventListener("ready", function(e) {
    try {
      
      /** Drupal Settings **/
      // Site Path, e.g. http://www.example.com (with no trailing slash)
      Drupal.settings.site_path = "http://www.tylerfrankenstein.com";
      
      // Initialize Drupal.
      drupal_bootstrap({
          success:function(data){
            
            // PLACE YOUR CUSTOM CODE HERE...
            
            if (Drupal.user.uid == 0) {
              // Anonymous user...
            }
            else {
              // Authenticated user...
            }
            
          }
      });

    }
    catch (error) {
      console.log('Pebble.addEventListener - ready - ' + error);
    }

});

/**
 * Pebble's showConfiguration event listener.
 */
Pebble.addEventListener("showConfiguration", function() {
    try {
      var user_login = drupal_page_url('user.html');
      Pebble.openURL(user_login);
    }
    catch (error) {
      console.log('Pebble.addEventListener - showConfiguration - ' + error);
    }
});

/**
 * Pebble's webviewclosed event listener.
 */
Pebble.addEventListener("webviewclosed", function(e) {
    try {
      if (e.response) {
        drupal_webviewclosed(JSON.parse(decodeURIComponent(e.response)));
      }
    }
    catch (error) {
      console.log('Pebble.addEventListener - webviewclosed - ' + error);
    }
});

/**
 * The handler for Pebble's webviewclosed event listener.
 */
function drupal_webviewclosed(options) {
  try {
    switch (options.page) {
      case 'user_login':
        user_login({
            "name":options.name,
            "pass":options.pass,
            success:function(data) {
              drupal_set_message('You logged in ' + Drupal.user.name + '!');
            }
        });
        break;
      case 'user_register':
        user_register({
            "name":options.name,
            "mail":options.mail,
            success:function(data) {
              drupal_set_message('Registered user #' + data.uid + '!');
            }
        });
        break;
      default:
        break;
    }
  }
  catch (error) {
    console.log('drupal_webviewclosed - ' + error);
  }
}

/**
 * pebble-drupal (https://github.com/signalpoint/pebble-drupal)
 */
Drupal = {};
Drupal.user = drupal_user_defaults();

/**
 * Default settings. Do not change values here, instead change the values in
 * your "ready" EventListener for Pebble.
 */
Drupal.settings = {
  site_path:"",
  base_path:"/",
  endpoint:"pebble",
  pebble_module_directory:"sites/all/modules/pebble"
};

/**
 * The bootstrap function for Pebble and Drupal.
 */
function drupal_bootstrap(options) {
  try {
    // Make sure the site_path is set.
    if (Drupal.settings.site_path == "") {
      drupal_set_message("The Drupal site_path is not set!");
    }
    else {
      /*user_logout({
          success:options.success
      });*/
      // Call system connect and return to Pebble's "ready" event handler.
      system_connect({
          success:options.success
      });
    }
  }
  catch (error) {
    console.log('drupal_bootstrap - ' + error);
  }
};

/**
 * BEGIN: Drupal Service Resource Implementations
 */
// System Connect
function system_connect(options) {
  try {
    Drupal.services.call({
        method:"POST",
        path:"system/connect.json",
        success:function(data){
          Drupal.user = data.user;
          options.success(data);
        }
    });
  }
  catch (error) {
    console.log('system_connect - ' + error);
  }
}
// User Login
function user_login(options) {
  try {
    Drupal.services.call({
        method:"POST",
        path:"user/login.json",
        data:"username=" + encodeURIComponent(options.name) + 
             "&password=" + encodeURIComponent(options.pass),
        success:function(data){
          Drupal.user = data.user;
          options.success(data);
        }
    });
  }
  catch (error) {
    console.log('user_login - ' + error);
  }
}
// User Logout
function user_logout(options) {
  try {
    Drupal.services.call({
        method:"POST",
        path:"user/logout.json",
        success:function(data){
          Drupal.user = drupal_user_defaults();
          options.success(data);
        }
    });
  }
  catch (error) {
    console.log('user_login - ' + error);
  }
}
// User Register
function user_register(options) {
  try {
    Drupal.services.call({
        method:"POST",
        path:"user/register.json",
        data:"name=" + encodeURIComponent(options.name) + 
             "&mail=" + encodeURIComponent(options.mail),
        /*data:options.data,*/
        success:function(data){
          Drupal.user = data.user;
          options.success(data);
        }
    });
  }
  catch (error) {
    console.log('user_register - ' + error);
  }
}
/**
 * END
 */

/**
 * Given a JSON object or string, this will print it to the console.
 */
function dpm(data) {
  if (data) {
    if (typeof data === 'object') { console.log(JSON.stringify(data)); }
    else { console.log(data); }
  }
}

/**
 *
 */
function drupal_page_url(page) {
  return Drupal.settings.site_path + 
         Drupal.settings.base_path +
         Drupal.settings.pebble_module_directory + '/pages/' + page;
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

/**
 * Returns a default JSON object representing an anonymous Drupal user account.
 */
function drupal_user_defaults() {
  return {
    "uid":"0",
    "roles":{"0":"anonymous user"}
  };
}

/**
 * Drupal Services XMLHttpRequest Object
 */
Drupal.services = {
  call:function(options) {
    try {
      
      // Build the Request, URL and extract the HTTP method.
      var request = new XMLHttpRequest();
      var url = Drupal.settings.site_path + 
                Drupal.settings.base_path + '?q=' +
                Drupal.settings.endpoint + '/' + options.path;
      var method = options.method;
      console.log(method + ': ' + url);
      
      // Request Success Handler
      request.onload = function(e) {
        if (request.readyState == 4) {
          var title = "";
          switch (request.status) {
            case 200: title = "OK"; break;
            case 401: title = "Unauthorized"; break;
            case 404: title = "Not Found"; break;
          }
          var title = request.status + " - " + title;
          console.log(title);
          if (request.status != 200) {
            // Not OK
            drupal_set_message(url, {"title":title});
          }
          else {
            // OK
            options.success(JSON.parse(request.responseText));
          }
        }
        else {
          console.log('request.readyState = ' + request.readyState);
        }
      }
      
      // Open the request.
      request.open(method, url, true);
      
      // Set any headers.
      if (method.toUpperCase() == 'POST') {
        request.setRequestHeader(
          "Content-type",
          "application/x-www-form-urlencoded"
        );
      }
      
      // Send the request.
      if (typeof options.data !== 'undefined') { request.send(options.data); }
      else { request.send(null); }
      
    }
    catch (error) {
      console.log('Drupal.services - error - ' + error);
    }
  }
};

