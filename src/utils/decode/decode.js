import $ from 'jquery';

// By Ofer Faigon, DecodeChess Ltd.
// Copyright (c) DecodeChess Ltd 2022
// Last update: 2022-11-13
//
// This is a demonstration of requesting and following a decode from the
// DecodeChess server through a 3rd party server.
//
// This code runs in the browser, but the requests must come from a web
// server with a fixed and known IP address, so that the DecodeChess server
// will be able to trust it with user IDs. This means that the requests sent
// from the code below must be sent to an intermediary web server that will
// add a user ID (the 'u' parameter) and send them to DecodeChess, then relay
// the DecodeChess reply back to the client. Do not send the user ID from code
// running in the browser for security reasons.
//

// The URL to send API calls to.
// Do not include the schema and domain parts in the api url, because that triggers
// a cross-site scripting violation error. Without the schema+domain then requests
// will be sent to the 3rd party server, which will relay them to the DecodeChess
// server.



// Start a decode process.
// decode_type: The type of decode to do. Either 'short' or 'deep'.
// fen: The position in the game, in FEN format.
// next_move_uci: The move played in the game in this position, in UCI format,
//     or null or an empty string if no move was played.
// avoid_working: What to do if the answer is not already in the database:
//     0: start a decode job.
//     1: fail.
// lang: The language to use in the reply. If the language is not one of the
//     supported ones, it will default to 'en'.
// Calls on_progress(percent, partial_info) a few times during decode.
//     percent: A number between 0 and 100.
//     partial_info: An object with optional keys {best_move, good_moves,
//         threats, functionality, ...}. This is only relevant when decode_type="deep".
//         The structure of the partial info object is documented elsewhere.
// Calls on_success(html_text) when the decode ends successfully.
// Calls on_failure(error_code, msg) if the decdode fails.
//     error_code:
//         'invalid' The request is invalid (e.g., malformed FEN, or invalid next_move_uci).
//         'failed' Processing failed for some unspecified reason.
//         'nocredit' the user does not have any credits.
//         'outofcredits' The current billing period quota has been all used up.
//         'noquota' The plan the user is on does not allow any decodes.
//         'wouldwork' or 'wouldcost' The answer is not in the database and avoid_working=1.
//         'needs_premium' The requested action requires a paying account.
//         There are more possible error codes, but they are not relevant in this context.
//     msg: An optional debugging message (which should NOT be shown to the user)
function start_decode(decode_type, fen, next_move,
    avoid_working, lang,
    on_progress, on_success, on_failure) {
    fen = fen.replaceAll(' ', '+')
    fen = fen.replaceAll('/', '%2F')
    let API_URL = `/billing/get_decode_signature?query=t=deep&l=en&a=0&f=${fen}`.replaceAll('&', '%26');
    if (next_move && next_move.move !== undefined) {
        const { move } = next_move;
        API_URL = API_URL + `&next_move=${move}`;
    }
    var curr_parts = "";

    function on_reply(data) {
        console.log('on_reply(), data:', data);
        if (!data) {
            on_failure("failed", "No response received");
            return;
        }
        var status = data.status;
        if (["working", "started", "queued", "restarted"].includes(status)) {
            on_progress(data.pct);
            curr_parts = data.parts;
            if (data.poll_delay) setTimeout(send_decode_request, data.poll_delay * 1000);
            return;
        }
        if (status === "answered") {

            on_progress(data.pct, data.partial); //TODO: parse JSON?
            on_success(data.text);
            return;
        }
        on_failure(status, data.msg);
    };

    function send_decode_request() {
        const decode_url = API_URL;
        $.get(decode_url)
            .done(on_reply)
            .fail(function (response) {
                on_failure("failed", "Failed to send the HTTP request")
            });
    }

    if (decode_type !== "short" && decode_type !== "deep") {
        on_failure("invalid", "decode_type is not 'short' or 'deep'")
        return;
    }

    send_decode_request();
}

export default start_decode;
