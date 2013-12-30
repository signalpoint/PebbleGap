// Initialize the Drupal JSON object.
Drupal = drupal_init(); // Do not remove this line!

/**
 * Drupal Settings
 */

// Site Path, e.g. http://www.example.com (with no trailing slash)
Drupal.settings.site_path = "http://www.tylerfrankenstein.com";

/**
 * BEGIN: Custom Code
 */

// Place your custom code here... 

/**
 * Implements hook_ready().
 */
function pebble_ready() {
  try {
  }
  catch (error) {
    console.log('pebble_ready - ' + error);
  }
}

/**
 * Implements hook_button_click_handler().
 */
function pebble_button_click_handler(payload, options) {
  try {
    switch (options.button) {
      case 'up':
        break;
      case 'down':
        break;
      case 'select':
        node_load(1000, {
            success:function(node){
              dpm(node);
              pebble_set_message(node.title, {title:"Node loaded!"});
            },
            error:function(xhr, status, message) {
              console.log("Failed to load node, " + message);
            }
        });
        break;
    }
    console.log("Button Clicked: " + options.button);
  }
  catch(error) {
    console.log('pebble_button_click_handler - ' + error);
  }
}

/**
 * END: Custom Code
 */

/*****************|
 *                |
 * PebbleGap Core |
 *                |
 *****************/
 
/******************|
 *                 |
 * PebbleGap Hooks |
 *                 |
 ******************/

// To implement a PebbleGap hook, copy the hook's function template from below
// and paste it into your custom code section above. Then replace the 'hook_'
// with 'pebble_' in your function name.
// 
// For example, to implement hook_ready(), copy the hook_ready() function below,
// paste it into your custom code section above, then change the pasted code's
// function name from hook_ready to pebble_ready.

/**
 * Implements hook_button_click_handler().
 */
function hook_button_click_handler(payload, options) {
  try {
    console.log("Button Clicked: " + options.button);
    switch (options.button) {
      case 'up':
        break;
      case 'down':
        break;
      case 'select':
        break;
    }
  }
  catch(error) {
    console.log('pebble_button_click_handler - ' + error);
  }
}

/**
 * Implements hook_ready().
 */
function hook_ready() {
  try {
    var message = '';
    if (Drupal.user.uid == 0) {
      message = 'Hello World!';
    }
    else {
      message = 'Hello ' + Drupal.user.name + '!';
    }
    pebble_set_message(message);
  }
  catch (error) {
    console.log('pebble_ready - ' + error);
  }
}

/**
 * PebbleGap JSON object.
 */
PebbleGap = {
  "BUTTON":{
    "UP":"1",
    "SELECT":"2",
    "DOWN":"3"
  }
};

/**
 * Set PebbleGap's default settings for Drupal, if they aren't already set.
 */
if (!Drupal.settings.endpoint) {
  Drupal.settings.endpoint = "pebble";
}
if (!Drupal.settings.pebble_module_directory) {
  Drupal.settings.pebble_module_directory = "sites/all/modules/pebble";
}

/**
 * Pebble's appmessage event listener.
 */
Pebble.addEventListener("appmessage", function(e) {
    try {
      pebble_appmessage(e.payload);
    }
    catch (error) {
      console.log('Pebble.addEventListener - appmessage - ' + error);
    }
});

/**
 * Pebble's "ready" event listener.
 */
Pebble.addEventListener("ready", function(e) {
    try {
      pebble_bootstrap({
          success:function(data){
            var hook = 'pebble_ready';
            if (function_exists(hook)) {
              var fn = window[hook];
              fn();
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
      var url = '';
      if (Drupal.user.uid == 0) {
        url = pebble_page_url('user.html');
      }
      else {
        url = pebble_page_url('user.html#account');
      }
      dpm(url);
      Pebble.openURL(url);
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
        pebble_webviewclosed(JSON.parse(decodeURIComponent(e.response)));
      }
    }
    catch (error) {
      console.log('Pebble.addEventListener - webviewclosed - ' + error);
    }
});

/**
 * Handles Pebble's appmessage event listener.
 */
function pebble_appmessage(payload) {
  try {
    // Determine the payload, and if a hook is implemented, call it.
    var button = false;
    if (payload[PebbleGap.BUTTON.DOWN]) { button = 'down'; }
    else if (payload[PebbleGap.BUTTON.UP]) { button = 'up'; }
    else if (payload[PebbleGap.BUTTON.SELECT]) { button = 'select'; }
    var hook = false;
    var options = {};
    if (button) {
      hook = 'pebble_button_click_handler';
      options.button = button;
    }
    if (function_exists(hook)) {
      var fn = window[hook];
      fn(payload, options);
    }
  }
  catch (error) {
    console.log('pebble_appmessage - ' + error);
  }
}

/**
 * The bootstrap function for Pebble and Drupal.
 */
function pebble_bootstrap(options) {
  try {
    // Make sure the site_path is set.
    if (Drupal.settings.site_path == "") {
      pebble_set_message("The Drupal site_path is not set!");
    }
    else {
      // Call system connect and return to Pebble's "ready" event handler.
      system_connect({
          success:options.success
      });
    }
  }
  catch (error) {
    console.log('pebble_bootstrap - ' + error);
  }
};

/**
 *
 */
function pebble_page_url(page) {
  try {
    return Drupal.settings.site_path + 
         Drupal.settings.base_path +
         Drupal.settings.pebble_module_directory + '/pages/' + page;
  }
  catch (error) {
    console.log('pebble_page_url - ' + error);
  }
}

/**
 * Given a string, this will display a simple notification on Pebble. You may
 * optionally pass in a second argument as a JSON object, with these properties:
 *   title - a string to display as the title of the notification.
 */
function pebble_set_message(message) {
  try {
    var title = "Message";
    if (arguments[1]) {
      var options = arguments[1];
      if (options.title) { title = options.title; }
    }
    Pebble.showSimpleNotificationOnPebble(title, message);
  }
  catch (error) {
    console.log('pebble_set_message - ' + error);
  }
}

/**
 * The handler for Pebble's webviewclosed event listener.
 */
function pebble_webviewclosed(options) {
  try {
    switch (options.page) {
      case 'user_login':
        user_login({
            "name":options.name,
            "pass":options.pass,
            success:function(data) {
              pebble_set_message('You logged in ' + Drupal.user.name + '!');
            }
        });
        break;
      case 'user_register':
        user_register({
            "name":options.name,
            "mail":options.mail,
            success:function(data) {
              pebble_set_message('Registered user #' + data.uid + '!');
            }
        });
        break;
      case 'user_logout':
        user_logout({
            success:function(data) {
              pebble_set_message('Logged out!');
            }
        });
        break;
    }
  }
  catch (error) {
    console.log('pebble_webviewclosed - ' + error);
  }
}

/**********|
 *         |
 * jDrupal |
 *         |
 **********/

// All of the code below is a copy of jDrupal.js available here:
//   https://github.com/easystreet3/DrupalJS/blob/7.x-1.x/jDrupal.js
//
// Since the PebbleKit Javascript Framework currently only allows one .js file
// to power a Pebble App, we must copy the contents of the jDrupal.js and paste
// it below.

/**
 * Add additional properties to the Drupal JSON object.
 */
Drupal.sessid = null;
Drupal.user = drupal_user_defaults();

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
 * Returns a default JSON object for Drupal.
 */
function drupal_init() {
  return {
    settings:{
      site_path:"",
      base_path:"/",
      language_default:"und"
    }
  };
}

/**
 * Returns a default JSON object representing an anonymous Drupal user account.
 */
function drupal_user_defaults() {
  return {
    "uid":"0",
    "roles":{"1":"anonymous user"}
  };
}

/**
 *
 */
function entity_assemble_data(entity_type, bundle, entity, options) {
  try {
    var data = '';
    for (var property in entity) {
      console.log(property);
      if (entity.hasOwnProperty(property)) {
        var type = typeof entity[property];
        // Assemble field items.
        if (type === 'object') {
          for (var language in entity[property]) {
            if (entity[property].hasOwnProperty(language)) {
              for (var delta in entity[property][language]) {
                if (entity[property][language].hasOwnProperty(delta)) {
                  for (var value in entity[property][language][delta]) {
                    if (entity[property][language][delta].hasOwnProperty(value)) {
                      data += property +
                        '[' + language + '][' + delta + '][' + value + ']=' +
                        encodeURIComponent(entity[property][language][delta][value]) + '&';   
                    }
                  }
                }
              }
            }
          }
        }
        // Assemble flat properties.
        else {            
          data += property + '=' + encodeURIComponent(entity[property]) + '&';
        }
      }
    }
    if (data != '') { data = data.substring(0, data.length - 1); }
    return data;
  }
  catch (error) { console.log('entity_assemble_data - ' + error); }
}

/**
 *
 */
function entity_load(entity_type, ids, options) {
  try {
    switch(entity_type) {
      case 'node':
        node_retrieve(ids, options);
        break;
      default:
        console.log('WARNING: entity_load - unsupported type: ' + entity_type);
        break;
    }
  }
  catch (error) { console.log('entity_load - ' + error); }
}

/**
 *
 */
function entity_save(entity_type, bundle, entity, options) {
  try {
    switch(entity_type) {
      case 'node':
        if (!entity.language) { entity.language = language_default(); }
        if (!entity.nid) {
          node_create(entity, options);
        }
        else {
          node_update(entity, options);
        }
        break;
      default:
        console.log('WARNING: entity_save - unsupported type: ' + entity_type);
        break;
    }
  }
  catch (error) { console.log('entity_save - ' + error); }
}

/**
 * Given a JS function name, this returns true if the function exists in the
 * scope, false otherwise.
 */
function function_exists(name) {
  try {
    return (eval('typeof ' + name) == 'function');
  }
  catch (error) {
    alert('function_exists - ' + error);
  }
}

/**
 * Given an integer http status code, this will return the title of it.
 */
function http_status_code_title(status) {
  try {
    var title = "";
    switch (status) {
      case 200: title = "OK"; break;
      case 401: title = "Unauthorized"; break;
      case 404: title = "Not Found"; break;
      case 406: title = "Not Acceptable"; break;
    }
    return title;  
  }
  catch (error) {
    console.log('http_status_code_title - ' + error);
  }
}

/**
 *
 */
function language_default() {
  try {
    return Drupal.settings.language_default;
  }
  catch (error) { console.log('language_default - ' + error); }
}

/**
 *
 */
function node_load(nid, options) {
  try {
    entity_load('node', nid, options);
  }
  catch (error) { console.log('node_load - ' + error); }
}

/**
 *
 */
function node_save(node, options) {
  try {
    entity_save('node', node.type, node, options);
  }
  catch (error) { console.log('entity_save - ' + error); }
}

/**
 * Checks if the needle string, is in the haystack array. Returns true if it is
 * found, false otherwise. Credit: http://stackoverflow.com/a/15276975/763010
 */
function in_array(needle, haystack) {
  return (haystack.indexOf(needle) > -1);
}

/***********************|
 *                      |
 * Drupal Services Core |
 *                      |
 ***********************/

Drupal.services = {};

/**
 *
 */
function entity_create(entity_type, bundle, entity, options) {
  try {
    Drupal.services.call({
        method:options.method,
        path:options.path,
        data:entity_assemble_data(entity_type, bundle, entity, options),
        success:function(data){
          options.success(data);
        },
        error:function(xhr, status, message) {
          options.error(xhr, status, message);
        }
    });
  }
  catch (error) { console.log('entity_create - ' + error); }
}

/**
 *
 */
function entity_retrieve(entity_type, ids, options) {
  try {
    Drupal.services.call({
        method:options.method,
        path:options.path,
        success:function(data){
          options.success(data);
        },
        error:function(xhr, status, message) {
          options.error(xhr, status, message);
        }
    });
  }
  catch (error) { console.log('entity_retrieve - ' + error); }
}

/**
 *
 */
function node_create(node, options) {
  try {
    options.method = "POST";
    options.path = "node.json";
    entity_create('node', node.type, node, options);
  }
  catch (error) { console.log('node_create - ' + error); }
}

/**
 *
 */
function node_retrieve(ids, options) {
  try {
    options.method = "GET";
    options.path = "node/" + ids + ".json";
    entity_retrieve('node', ids, options);
  }
  catch (error) { console.log('node_retrieve - ' + error); }
}

// System Connect
function system_connect(options) {
  try {
    Drupal.services.call({
        method:"POST",
        path:"system/connect.json",
        success:function(data){
          Drupal.user = data.user;
          options.success(data);
        },
        error:function(xhr, status, message) {
          options.error(xhr, status, message);
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
          // Now that we are logged in, we need to get a new CSRF token.
          var token_request = new XMLHttpRequest();
          var token_url = Drupal.settings.site_path +
                    Drupal.settings.base_path +
                    '?q=services/session/token';
          // Token Request Success Handler
          token_request.onload = function(e) {
            if (token_request.readyState == 4) {
              var title = token_request.status + " - " +
                http_status_code_title(token_request.status);
              if (token_request.status != 200) { // Not OK
                console.log('user_login - ' + token_url + ' - ' + title);
                console.log(token_request.responseText);
              }
              else { // OK
                // Save the token to local storage as sessid, set Drupal.sessid
                // with the token, then return the user login data to the
                // success function.
                //token = JSON.parse(token_request.responseText);
                token = token_request.responseText;
                window.localStorage.setItem('sessid', token);
                Drupal.sessid = token;
                dpm('got new token after user login: ' + token);
                options.success(data);
              }
            }
            else {
              console.log('user_login token_request.readyState = ' + token_request.readyState);
            }
          }
          
          // Open the token request.
          token_request.open('GET', token_url, true);
          
          // Send the token request.
          dpm('grabbing new token after user login...');
          token_request.send(null);
          
          //Drupal.sessid = data.sessid;
          //window.localStorage.setItem('sessid', data.sessid);
          //options.success(data);
        },
        error:function(xhr, status, message) {
          options.error(xhr, status, message);
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
          Drupal.sessid = null;
          window.localStorage.removeItem('sessid');
          options.success(data);
        },
        error:function(xhr, status, message) {
          options.error(xhr, status, message);
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
        success:function(data){
          Drupal.user = data.user;
          options.success(data);
        },
        error:function(xhr, status, message) {
          options.error(xhr, status, message);
        }
    });
  }
  catch (error) {
    console.log('user_register - ' + error);
  }
}

/**
 * Drupal Services XMLHttpRequest Object
 */
Drupal.services.call = function(options) {
  try {
    // Build the Request, URL and extract the HTTP method.
    var request = new XMLHttpRequest();
    var url = Drupal.settings.site_path + 
              Drupal.settings.base_path + '?q=' +
              Drupal.settings.endpoint + '/' + options.path;
    var method = options.method.toUpperCase();
    console.log(method + ': ' + url);
    
    // Request Success Handler
    request.onload = function(e) {
      if (request.readyState == 4) {
        var title = request.status + " - " +
          http_status_code_title(request.status);
        if (request.status != 200) { // Not OK
          console.log(url + " - " + title);
          console.log(request.responseText);
          if (typeof options.error !== 'undefined') {
            options.error(request, request.status, request.responseText);
          }
        }
        else { // OK
          options.success(JSON.parse(request.responseText));
        }
      }
      else {
        console.log('request.readyState = ' + request.readyState);
      }
    }
    
    // Generate Token and Make the Request.
    Drupal.services.csrf_token(method, url, request, {
        "path":options.path,
        success:function(token){
          
          // Open the request.
          request.open(method, url, true);
          
          // Set any headers.
          if (method == 'POST') {
            request.setRequestHeader(
              "Content-type",
              "application/x-www-form-urlencoded"
            );
          }
    
          if (token) {
            dpm('Adding token to header: ' + token);
            request.setRequestHeader("X-CSRF-Token", token);
          }
          if (typeof options.data !== 'undefined') {
            if (options.path != 'user/login.json') { console.log(options.data); }
            request.send(options.data);
          }
          else { request.send(null); }      
        }
    });
  }
  catch (error) {
    console.log('Drupal.services.call - error - ' + error);
  }
};

/**
 * Drupal Services CSRF TOKEN
 */
Drupal.services.csrf_token = function(method, url, request, options) {
  try {
    var token = false;
    // Do we potentially need a token for this call? We most likely need one if
    // the call option's type is not one of these types.
    if (!in_array(method, ['GET', 'HEAD', 'OPTIONS', 'TRACE'])) {
      // Anonymous users don't need the CSRF token, unless we're calling system
      // connect, then we need to pass along the token if we have one.
      if (Drupal.user.uid == 0 && options.path != 'system/connect.json') {
        dpm(method + ' - anonymous token not needed');
        options.success(false);
        return;
      }
      // Is there a token available in local storage?
      token = window.localStorage.getItem('sessid');
      if (token) {
        dpm('grabbed token from local storage: ' + token);
      }
      // If we don't already have a token, is there one on Drupal.sessid?
      if (!token && Drupal.sessid) {
        token = Drupal.sessid;
        dpm('Grabbed token from drupal: ' + token);
      }
      // If we still don't have a token to use, let's grab one from Drupal.
      if (!token) {
        // Build the Request, URL and extract the HTTP method.
        var token_request = new XMLHttpRequest();
        var token_url = Drupal.settings.site_path +
                  Drupal.settings.base_path +
                  '?q=services/session/token';
        // Token Request Success Handler
        token_request.onload = function(e) {
          if (token_request.readyState == 4) {
            var title = token_request.status + " - " +
              http_status_code_title(token_request.status);
            console.log('TOKEN REQUEST COMPLETE: ' + title);
            if (token_request.status != 200) { // Not OK
              console.log(token_url + " - " + title);
              console.log(token_request.responseText);
            }
            else { // OK
              // Save the token to local storage as sessid, set Drupal.sessid
              // with the token, then return the token to the success function.
              dpm(token_request.responseText);
              token = token_request.responseText;
              dpm('Grabbed a new token, saving it to local storage: ' + token);
              window.localStorage.setItem('sessid', token);
              Drupal.sessid = token;
              options.success(token);
            }
          }
          else {
            console.log('token_request.readyState = ' + token_request.readyState);
          }
        }
        
        // Open the token request.
        token_request.open('GET', token_url, true);
        
        // Send the token request.
        dpm(token_url + ' - previous token not available, grabbing one...');
        token_request.send(null);
      }
      else {
        // We had a previous token available, let's use it.
        dpm(method + ' - previous token available and being used');
        Drupal.sessid = token;
        options.success(token);
      }
    }
    else {
      dpm(method + ' - token not needed');
      // This call's HTTP method doesn't need a token, so we return via the
      // success function.
      options.success(false);
    }
  }
  catch (error) {
    console.log('Drupal.services.call - error - ' + error);
  }
};

