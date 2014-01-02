// Initialize the Drupal JSON object from jDrupal.
var Drupal = Drupal || drupal_init(); // Do not remove this line!
// Initialize the PebbleGap JSON object.
var PebbleGap = PebbleGap || pebblegap_init(); // Do not remove this line!

/**
 * BEGIN: Custom Code
 */

// Site Path. (Do not use a trailing slash)
Drupal.settings.site_path = ""; // http://www.example.com

// Services endpoint path.
Drupal.settings.endpoint = "pebble";

// Place your custom code here... try implementing hook_ready() for starters.

/**
 * END: Custom Code
 */

/*****************|
 *                |
 * PebbleGap Core |
 *                |
 *****************/

/**
 * The code below is what powers PebbleGap core. For now, the PebbleKit JS
 * Framework only allows us to use one JavaScript file to power our Pebble App.
 * This means all of our code has to live in one file. We imagine (and hope)
 * this will not be the case in the future. Feel free to make modifications to
 * the code below and tell us about your changes to help us make PebbleGap
 * better!
 *
 * PebbleGap is also powered by jDrupal, a JavaScript Library for Drupal. So
 * the jDrupal source code must also be included in this file. See the "jDrupal"
 * section below, it is under all of PebbleGap core code.
 *
 * Download jDrupal: http://www.easystreet3.com/jDrupal
 *
 */
 
/******************|
 *                 |
 * PebbleGap Hooks |
 *                 |
 ******************/

/**
 * To implement a PebbleGap hook, copy the hook's function template from below
 * and paste it into your custom code section above. Then replace the 'hook_'
 * with 'pebble_' in your function name.
 * 
 * For example, to implement hook_ready(), copy the hook_ready() function below,
 * paste it into your custom code section above, then change the pasted code's
 * function name from hook_ready to pebble_ready. The code contained within the
 * functions below is just example code, feel free to add/edit/remove it. But it
 * is recommended to keep the try/catch clause for error handling.  
 */

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
 * Implements hook_user_login().
 */
function hook_user_login(result) {
  try {
    pebble_set_message('Hi, ' + Drupal.user.name);
  }
  catch (error) { console.log('pebble_user_login - ' + error); }
}

/**
 * Implements hook_user_logout().
 */
function hook_user_logout(result) {
  try {
    pebble_set_message('Logged out!');
  }
  catch (error) { console.log('pebble_user_logout - ' + error); }
}

/**
 * Implements hook_user_register().
 */
function hook_user_register(result) {
  try {
    pebble_set_message('Account registered!');
  }
  catch (error) { console.log('pebble_user_register - ' + error); }
}

/*****************|
 *                |
 * PebbleGap Code |
 *                |
 *****************/

/**
 * Returns the PebbleGap
 */
function pebblegap_init() {
  try {
    return {
      "BUTTON":{
        "UP":"1",
        "SELECT":"2",
        "DOWN":"3"
      },
      settings: {
        pages_path: 'sites/all/modules/pebble'
      }
    };
  }
  catch (error) { console.log('pebblegap_init - ' + error); }
}

/**
 * Set PebbleGap's default settings for Drupal, if they aren't already set.
 */
if (!Drupal.settings.endpoint) {
  Drupal.settings.endpoint = "pebble";
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
         PebbleGap.settings.pages_path + '/pages/' + page;
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
    dpm('Closed page: ' + options.page);
    switch (options.page) {
      case 'user_login':
        user_login(options.name, options.pass, {
            success:function(result) {
              if (function_exists('pebble_user_login')) {
                pebble_user_login(result);
              }
            },
            error:function(xhr, status, message) {
              pebble_set_message(message);
            }
        });
        break;
      case 'user_register':
        var account = {
          "name":options.name,
          "mail":options.mail
        };
        user_register(account, {
            success:function(result) {
              if (function_exists('pebble_user_register')) {
                pebble_user_register(result);
              }
            },
            error:function(xhr, status, message) {
              pebble_set_message(message);
            }
        });
        break;
      case 'user_logout':
        user_logout({
            success:function(result) {
              if (function_exists('pebble_user_logout')) {
                pebble_user_logout(result);
              }
            },
            error:function(xhr, status, message) {
              pebble_set_message(message);
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

/**
 * Since the PebbleKit Javascript Framework currently only allows one .js file
 * to power a Pebble App, we must copy the contents of the jdrupal.js file (or
 * the jdrupal.min.js file) and paste its content below.
 *
 * Download jDrupal: http://www.easystreet3.com/jDrupal
 *
 */

// Paste the contents of jdrupal.js here...

