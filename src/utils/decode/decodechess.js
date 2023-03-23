import $ from 'jquery';
import ArrowMaker from './dc_arrows'

//
// By Ofer Faigon, DecodeChess Ltd.
// Copyright (c) DecodeChess Ltd 2022
// Last update: 2022-11-19
//
// A minimal code example to display the DecodeChess summary section of
// a deep decode. Showing other sections is very similar.

// Things you may want to add or change:
// - Add horizontal scroll in .dcpath and in the user-move best play.
// - Show piece pictures instead of the letters KQRNB in moves.
// - Keyboard support (left/right move to the orevious/next move in a path,
//   etc).
// - Color changes on hover above a clickable item.
// - Clicking on an explanation with arrows should highlight the arrows.
// - Clicking on an arrow should highlight and unfold the corresponding
//   explanation.
// - Move the user-move part to inside the summary, right after the
//   .gist element.
// - Translating the More/Less buttons to the user's language.
// - Leave a frame around the move whose explanation is shown even when
//   it is deselected.
// - Replace the src="" in all <img class="symbol"> tags with a URL that
//   contains a delta symbol or replace these elements with &#916;
//   and hide all the elements that follow until the end of the path.
//   Attach a click handler to show the rest when clicking on the delta
//   symbol.


// To display a summary, call this function with the HTML text received from
// a DecodeChess 'decode' API call and the element in which to show it.
// For showing the positions on a ChessBoard.js board, also pass the board
// variable.
function display_explanation(htmlText, containerEl, board) {
    // Extract only the summary and user-move parts and discard everything
    // else. This is better than using CSS to hide the irrelevant parts,
    // as it uses less resources.

    // Convert the input HTML text into a DOM.
    var root = $('<div></div>').append($(htmlText));
    // Find the summary part.
    var summaryEl = $('.summary,.dshort-best-move', root);
    var summaryInnerEl = $('.summary-inner', summaryEl);
    var summaryIntro = $('.summary-intro2', summaryInnerEl);

    var adv2El = $('.adv2', summaryIntro);
    var gistEl = $('.gist', summaryIntro);
    var attentionEl = $('.summary-attention', summaryIntro);
    var threatsEl = $('.threats_before', root);

    // Find the played move part.
    var usermoveEl = $('.user_move', root);
    // Create a new element with only the summary and played move parts.

    var explanationsEl = $('<div></div>').append(
        $('<div class="summary"/>').append(
            $('<div class="summary-inner"/>').append(
                $('<div class="summary-intro2"/>').append(adv2El, gistEl,
                    $('<div></div>')
                        .addClass('summary-threats-cont')
                        .append(
                            $('<div class="mf-hdr" data-clk="zztht8io">Threats</div>'),
                            $('<div data-fold="zztht8io"></div>').append(threatsEl)
                        ), attentionEl, usermoveEl)
            )
        )
    )

    // Add a copy of the Threats tab into the summary

    // Insert the new element into the container DIV so it will be shown
    // in the browser.
    containerEl
        .empty()
        .append(explanationsEl);

    // Make some changes to the explanation DOM (fold long explanations,
    // add importance indicators, etc.)
    prepareSummary(explanationsEl, board);
    // Make all clickable elements do what they are supposed to do.
    attachEventHandlers(explanationsEl, board);
}

// Make some changes to the summary DOM to prepare it for display.
function prepareSummary(root, board) {
    var threatsEl = $('.threats_before', root);
    var gist = $('.gist', root);
    // If the explanation contains debugging information, remove it.
    removeDebugElements(root);
    // Hide or fold everything that can be shown by user actions.
    hideAllExplanations(root);
    // Initially, show the explanation of the best move.
    selectMove($('.move[data-bpmfe]', root).first(), board, true);
    selectMove($('.move', gist).first(), board);
    var threatsHdrEl = $('.mf-hdr', threatsEl).first()
    var fold_id = threatsHdrEl.attr('data-clk');
    var bodies = $('[data-fold="' + fold_id + '"]');
    threatsHdrEl.toggleClass('unfolded');
    if (threatsHdrEl.hasClass('unfolded')) {
        bodies.show(200);
    } else {
        bodies.hide(200);
    }
    // Add nice importance indicators where relevant.
    paintWeights(root);
    // Hide excessive elements in long lists.
    hideIfTooMany(root);
}

// Remove debugging info, if it exists.
function removeDebugElements(root) {
    $('.dbg,.weights', root).remove();
}

// Add partly filled bullets before items that have importance levels, with
// the filled part representing the importance.
function paintWeights(root) {
    // The weight indicators appear in the decode reply as DIVs with class
    // mf-weight and a data-w attribute. data-w values are in the range 0-100.
    $('.mf-weight[data-w]', root).each(function (idx, el) {
        el = $(el);
        var w = 1 + parseInt(el.attr('data-w')) / 10.0;
        el.css('border-left-width', w + 'px');
    });
}

// In every list of explanations or paths that has too many items, hide all
// but the first few and show a More button instead.
function hideIfTooMany(root) {
    // Escess items are marked with an "overflow" class. Find their parents
    // and process each parent.
    $('.overflow', root)
        .parent()
        .each(function (idx, el) {
            addMoreLessButtons(el);
        });
}

// Given one parent element with too many children, hide the ones marked
// with class "overflow" and add More and Less buttons to let the user
// show and hide them.
function addMoreLessButtons(parent) {
    var kids = $(parent).children();
    var overflow_kids = $(parent).children('.overflow');
    $(parent).append($('<div>')
        .addClass('btn clk more-items-btn')
        .text('More...'));
    $(parent).append($('<div>')
        .addClass('btn clk less-items-btn')
        .text('Less...')
        .hide());
    overflow_kids.hide();
    // The new buttons don't do anything yet. Their behavior will be added later.
}

// Arrange for all clickable elements to do their thing.
function attachEventHandlers(root, board) {
    attachClickToMoves(root, board);
    attachClickToHeaders(root);
    attachClickToMoreLessBtns(root);
}

function attachClickToMoves(containerEl, board) {
    // Moves with data-bpmfe should show the relevant explanation.
    // Moves with data-fena should update the board.
    $('[data-bpmfe],[data-fena]', containerEl).click(function (ev) {
        onMoveClick(ev, $(this), board);
    });
}

// Handle a click on a move element (including sentinels).
function onMoveClick(ev, moveEl, board) {
    if (ev) ev.stopPropagation();
    selectMove(moveEl, board);
}

// Select a move: show the relevant explanation and update the position on
// the board.
// moveEl: The move to select (a jquery-wrapped element), or null to deselect
//     the selected move without selecting another one.
// board: A chessboard.js board to update, or null to skip updating the
//     position on the board.
function selectMove(moveEl, board, is_initial = false) {
    // Move the blue highlight to the new selected move.
    $('.selected').removeClass('selected');
    if (moveEl)  // Allow passing null to deselect the selected move.
        moveEl.addClass('selected');

    // If the move has attr data-bpmfe, then show the relevant explanation.
    showOnlyRelevantExplanation(moveEl);
    // If the move has attr data-fena then change the position on the board
    var fen = moveEl.attr('data-fena');
    if (fen && !is_initial) {
        window.setFenFromDecode(fen);
    }

    // If the move has attr data-fena then change the position on the board
    // if (board) {
    //     var fen = moveEl.attr('data-fena');
    //     if (fen) board.position(fen.split(' ')[0]);
    // }
}

// Immediately hide all explanations that the user can unfold (without
// any animation).
function hideAllExplanations(root) {
    // Immediately hide all best-play per-move explanations.
    $('.bpmf-item-cont', root).hide();
    // Immediately hide all foldable elements.
    $('[data-fold]', root).hide();
}

// Hide the shown per-move explanation and show the relevant one with
// a transition effect.
// moveEl: An element with class "move".
function showOnlyRelevantExplanation(moveEl) {
    moveEl = $(moveEl);

    // Prevent hiding the explanation when clicking on a move inside of it
    // (or on any move that is not in the main line, as only these have the
    // 'data-bpmfe' attribute).
    if (!moveEl.attr('data-bpmfe')) return;

    var root = moveEl.parents('.gist').first();
    $('.bpmf-item-cont', root).hide(200);
    if (moveEl.length) {
        var ex_id = moveEl.attr('data-bpmfe');
        $('.bpmf-item-cont[data-e="' + ex_id + '"]', root).show(200);
    }
}

// Make clickable headers show/hide the relevant contents.
function attachClickToHeaders(root) {
    // The decode result includes data-fold attributes to tell the client
    // what to show/hide when an element with a matching data-clk is clicked.
    $('[data-clk]', root)
        .click(function (ev) {
            onHeaderClick(ev, $(this));
        });
}

// A click handler for clicking on a header.
// Show/hide the element(s) matching a clicked header.
function onHeaderClick(ev, hdrEl) {
    if (ev) ev.stopPropagation();
    var fold_id = hdrEl.attr('data-clk');
    var bodies = $('[data-fold="' + fold_id + '"]');
    hdrEl.toggleClass('unfolded');
    if (hdrEl.hasClass('unfolded')) {
        bodies.show(200);
    } else {
        bodies.hide(200);
    }
}

// Attach click handlers to the More/Less buttons that control overflow items
// in long lists of explanations or of paths.
function attachClickToMoreLessBtns(root) {
    $('.more-items-btn', root).click(function () {
        $(this).siblings('.overflow').show(200);
        $(this).hide();
        $(this).siblings('.less-items-btn').show(200);
    });
    $('.less-items-btn', root).click(function () {
        $(this).siblings('.overflow').hide(200);
        $(this).hide();
        $(this).siblings('.more-items-btn').show(200);
    });
}

// --------------- arrows ---------------

// Scan the DOM subtree rooted at contEl for arrow definitions and create
// corresponding arrows on the board.
// This is a no-op if the ArrowMaker class has not been defined, so if you
// don't load the dc_arrows.js file, then no arrows will be drawn.
// Note that we draw *all* the arrows found in the explanation. A real
// implementation should only create arrows that correspond to the selected
// move or explanation, and these arrows should be deleted and replaced with
// new ones whenever the user clicks on a move or on an explanation.
function create_arrows(contEl, boardSelector, boardObj) {
    console.log('-- will draw arrows found under', contEl);
    if (typeof ArrowMaker === undefined) return;

    var am = new ArrowMaker(boardSelector, boardObj.orientation());
    am.removeAllArrows();

    $('[data-a]', contEl).each(function (idx, el) {
        var arrow_defs = $(el).attr('data-a');
        arrow_defs.split(';').forEach(function (arrow_def) {
            create_arrow_from_def(am, arrow_def, boardSelector);
        });
    });
}

// Add an arrow to the board.
// am: an ArrowMaker object.
// arrow_def: A string containing the details of the arrow (e.g., "thr,45,b1 d2 e4,1f6,")
// boardSelector: a CSS selector that identifies the board element in the DOM.
function create_arrow_from_def(am, arrow_def, boardSelector) {
    console.log('arrow_def: ', arrow_def);
    if (!arrow_def) return;
    var parts = arrow_def.split(',');

    var cls = parts[0], weight = parts[1], squares = parts[2].split(' ');
    var ex_ids = parts[3].split(' '), ghost_anims = parts[4];

    // The 'nudges' information can be used to move arrows a little so
    // that they don't pile on top of one another. Creating it is not
    // implemented yet in this example, nor is it documented here.
    var nudges = null;

    am.drawArrow(cls, squares, weight, ex_ids, ghost_anims, nudges);
}

export default display_explanation;