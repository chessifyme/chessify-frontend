import $ from 'jquery';
import start_decode from './decode'
import display_explanation from './decodechess';
import init_board from './decodechess_board';

var the_board = null;
    
function initialize() {
    the_board = init_board();
}

// A click handler for the Decode button.
// Collect the information supplied by the user and send a decode request
// to the server.
function run_decode(fen, next_move) {
    $('explanations-container').empty();
    $('#percent').css('width', '0%');
    var decode_type = $('#tdeep').prop("checked") ? 'deep' : 'short';
    var language = 'en';
    start_decode(decode_type, fen, next_move, 0, language,
                 on_progress, on_success, on_failure)
}

// This is called whenever a DC decode request replies with a "working" or
// equivalent status.
// All we do here is update the progress bar.
// A full version can also update the display with the partial reply.
function on_progress(percent, partial_result) {
    console.log('Progress: ' + percent + '%');
    $('#run-decode-button').prop('disabled', true);
    $('#percent').css('width', percent + '%');    // var fen = $('#fen').val();

}

// This is called when a decode request replies with a full explanation.
// Show the reply to the user.
function on_success(html_text) {
    console.log('Finished. html length: ' + html_text.length);
    $('#run-decode-button').prop('disabled', false);
    display(html_text);
}

// This is called when a decode request fails.
// Show an error message in the explanation area.
function on_failure(error_code, msg) {
    $('#run-decode-button').prop('disabled', false);
    console.log('*** Error: ' + error_code);
    console.log('*** Msg: ' + msg)
    var text = 'Error: ' + error_code
    if (msg) text += ' -- ' + msg
    $('.explanations-container').text(text).addClass('flash');
    setTimeout(function() { $('.explanations-container').removeClass('flash'); }, 20);
}

// Display a full explanation that was received from the server.
function display(html_text) {
    var contEl = $('.explanations-container');
    display_explanation(html_text, contEl, the_board);
}

export default run_decode;