#include <pebble.h>

enum BUTTONS {
  NULL_BUTTON = 0x0,
  UP_BUTTON = 0x1,
  SELECT_BUTTON = 0x2,
  DOWN_BUTTON = 0x3,
  CONTEXT_BUTTON = 0x4,
  LEFT_BUTTON = 0x5,
  RIGHT_BUTTON = 0x6,
  OUTPUT_TEXT = 0x7
};

static Window *window;
static TextLayer *text_layer;

void pebblegap_send_message(enum BUTTONS symbol)
{
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  /*if (iter == NULL) {
    text_layer_set_text(text_layer, "No buffer!");
    return;
  }*/
  Tuplet value = TupletInteger(symbol, symbol);
  dict_write_tuplet(iter, &value);
  dict_write_end(iter);
  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  pebblegap_send_message(SELECT_BUTTON);
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  pebblegap_send_message(UP_BUTTON);
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  pebblegap_send_message(DOWN_BUTTON);
}

static void click_config_provider(void *context) {
  /*window_set_click_context(BUTTON_ID_UP, context);
  window_set_click_context(BUTTON_ID_SELECT, context);
  window_set_click_context(BUTTON_ID_DOWN, context);*/
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

// AppMessage handlers
void in_received_handler(DictionaryIterator *received, void *context)
{
        // incoming message received
        Tuple *output_tuple = dict_find(received, OUTPUT_TEXT);
        if (output_tuple) {
                char *output = output_tuple->value->cstring;
                text_layer_set_text(text_layer, output);
        } else {
                text_layer_set_text(text_layer, "ERROR: invalid message received.");
        }
}
void in_dropped_handler(AppMessageResult reason, void *context)
{
        // incoming message dropped
        text_layer_set_text(text_layer, "OH NO NO no!");
        //get_failure_string(reason)
}
void out_sent_handler(DictionaryIterator *sent, void *context)
{
        // outgoing message was delivered
        text_layer_set_text(text_layer, "Success!");
}
void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context)
{
        // outgoing message failed
        text_layer_set_text(text_layer, "OH NO");
        //get_failure_string(reason)
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  text_layer = text_layer_create((GRect) { .origin = { 0, 72 }, .size = { bounds.size.w, 20 } });
  text_layer_set_text(text_layer, "Press a button");
  text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(text_layer);
}

static void init(void) {
  window = window_create();
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
  
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_sent(out_sent_handler);
  app_message_register_outbox_failed(out_failed_handler);
  const uint32_t inbound_size = 64;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
