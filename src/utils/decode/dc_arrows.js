import $ from 'jquery';

// window.$ = $;
// window.jQuery = jQuery;

// ArrowMaker is a class that can create arrow SVG elements over a given board.
// board_selector: The CSS selector that identifies the (single) board. The board
//     is assumed to have been created using chessboard.js.
// orientation: Which way the board is rotated. "white" if a1 is at the bottom left,
//     "black" if a1 is a the top right.
//
// Usage example:
//     var arrow_maker = new ArrowMaker('#board1', chess_board.orientation());
//     arrow_maker.drawArrow('threat', ['b4', 'c6', 'e5'], 68, ['e402'], '', null);
//     // The parameters correspond to the parts of a data-a attr in DecodeChess
//     // explanations.
//
// Dependencies:
//     The code below uses jquery for finding individual squares on the board,
//     and d3 for manipulating SVG elements.
//
// By Ofer Faigon, DecodeChess Ltd.
// Copyright (c) DecodeChess Ltd 2022
// Last update: 2022-11-19
//

function ArrowMaker(board_selector, orientation) {

    const board_el = $(board_selector);
    const square_size = $(".square-a1", board_el).width();

    // ------ Vector arithmetic functions.
    // A vector is represented by an array of length 2, containing the vector's
    // x and y coordinates.

    // Vector length.
    function vlen(v) {
        var x = v[0], y = v[1]
        return Math.sqrt(x * x + y * y);
    }

    // Subtract vectors.
    function vsub(v1, v2) {
        return [v1[0] - v2[0], v1[1] - v2[1]];
    }

    // Add two vectors.
    function vadd(v1, v2) {
        return [v1[0] + v2[0], v1[1] + v2[1]];
    }

    // Multiply a vector by a number.
    function vmul(v, c) {
        return [v[0] * c, v[1] * c];
    }

    // Return a vector with length L in the same direction as vector v.
    // Vector v must not have zero length.
    function vchopped(v, L) {
        return vmul(v, L / vlen(v));
    }

    // ------ Some helper functions.

    // Return the coords of a square on the board. If 'where' is 'origin'
    // then return the top left corner, else return the square's center.
    function sq2xy(sq, where) {
        var d = (where == "origin") ? 0.0 : 0.5;
        if (orientation == 'white') {
            var x = (col_idx(sq[0]) + d) * square_size;
            var y = (8 - Number(sq[1]) + d) * square_size;
        } else {
            var x = (col_idx(sq[0]) + d) * square_size;
            var y = (Number(sq[1]) - 8 + d) * square_size;
        }
        return [x, y];
    }

    // Return the coords of the given square's top left.
    function sq_origin(sq) {
        return sq2xy(sq, "origin");
    }

    // Return the coords of the given square's center.
    function sq_center(sq) {
        return sq2xy(sq, "center");
    }

    // Round a number to one digit after the decimal point.
    function round01(val) {
        return Math.round(val * 10)/10;
    }

    // Apply 0.1 rounding to both coordinates of a vector.
    function round01pt(pt) {
        return [round01(pt[0]), round01(pt[1])];
    }

    // Translate a column name ('a'..'h') to 0..7.
    function col_idx(col_name) {
        return parseInt(col_name, 36) - 10;
    }

    // Given a list of [x,y] coord pairs, return the SVG string describing a
    // path with round bends sort-of-passing through these points.
    // points: An array of [x,y] points where the path should pass.
    // nudges: An array of [dx,dy] offsets to apply to the segments of the
    //     curve. Its len should be the same as that of points.
    // pregap: The distance to leave between the start point (points[0]) and the
    //     curve start
    // postgap: How far from the last point the curve should end.
    // ingap: How far before each inner point the curve should start turning
    //     towards the next point, and how far after each inner point the arc
    //     should become a straight segment again.
    // Note that all of the following must be non-negative and less than square_size:
    //     pregap, postgap, pregap+ingap, 2*ingap, ingap+postgap, pregap+postgap.
    function make_curve_str(points, nudges, pregap, postgap, ingap) {
        var len;
        // Calculate the points where each arc starts (pia), without nudges.
        var pia = [[0, 0]]; // An unused dummy first item to make indexing of points, pia and pib identical.
        for (var i = 1; i < points.length; i++) {
            // P[i]a = where the arc starts = the point at distance d before P[i]
            //       = P[i] + (P[i-1] - P[i])||len
            len = (i == points.length - 1) ? postgap : ingap;
            pia.push(vadd(points[i], vchopped(vsub(points[i - 1], points[i]), len)));
        }
        // Calculate where each arc ends (pib), without nudges.
        var pib = [];
        for (var i = 0; i < points.length - 1; i++) {
            // P[i]b = where the arc ends = the point at distance d after P[i]
            //       = P[i] + (P[i+1] - P[i])||len=ingap  (for first segment use pregap instead of ingap)
            len = (i == 0) ? pregap : ingap;
            pib.push(vadd(points[i], vchopped(vsub(points[i + 1], points[i]), len)));
        }

        // Add nudges to the arc endpoints
        for (var i = 1; i < pia.length; i++) {
            pia[i] = vadd(pia[i], vmul(nudges[i-1], square_size*0.18));
        }
        for (var i = 0; i < pib.length; i++) {
            pib[i] = vadd(pib[i], vmul(nudges[i], square_size*0.18));
        }

        // Create the SVG curve string.
        // If you need to translate this code from SVG to some other system: in SVG,
        // the string "M10.3,4 L23,19.1 C12,34 23,45 36,11.55" means move (without drawing)
        // to point (10.3,4), then draw a straight line to (23,19.1), and finally draw a
        // cubic spline using control points (12,34) and (23,45) to (36,11.55).
        var curve = '';
        curve = 'M' + round01pt(pib[0]);
        // L = the distance of the control point from the segment end, in square_size units.
        // Be careful when adjusting this not to over/undershoot.
        var L = square_size * (0.72           - 0.2);
        for (var i = 1; i < points.length - 1; i++) {
            // Calculate the 4 beziere control points of the arc that connects the current
            // straight segment to the next one:
            // - pia[i]: The end of the current straight segment.
            // - z1: A little beyond the end of the current segment, in the same direction.
            // - z2: A little before the start of the next segment, in the same direction
            //       as that segment.
            // - pib[i]: The start of the next straight segment.
            var z1 = round01pt(vadd(pia[i], vchopped(vsub(pia[i], pib[i-1]), L)));
            var z2 = round01pt(vadd(pib[i], vchopped(vsub(pib[i], pia[i+1]), L)));
            // Draw a straight line for the current segment and then a cubic spline to the
            // start of the next.
            curve += ' L' + round01pt(pia[i]) + ' C' + z1 + ' ' + z2 + ' ' + round01pt(pib[i]);
        }
        // Add the last segment, with no trailing spline.
        curve += ' L' + round01pt(pia[i]);
        return curve;
    }

    // ------

    // Add an SVG arrow to the board.
    // cls: The CSS class(es) to assign to the new <svg> element, as a single space-
    //     separated string. E.g., "threat primary". The class 'lastmove' is recognized
    //     in the code as describing the last move played. It creates a pair of
    //     highlighted squares instead of an arrow. Other hard-coded class names:
    //     "xray" creates a dotted arrow, and "o_response" creates an arrow with
    //     two gaps in its tail.
    // squares: Array of squares the arrow should pass through. If this has len=1
    //     then the piece at this square should be highlighted instead of adding
    //     an arrow. A square is a length-2 string like "a3".
    // weight: A number between 0-100 specifying the importance of the concept
    //     represented by the arrow. The weight controls the width of the arrow.
    // ex_ids: An array of explanation IDs (short strings) to attach to the arrow.
    //     These strings associate the arrow with parts of the explanation text.
    // ghost_anims: A string "pieceLetter-fromSq-toSq ..." describing the ghost
    //     animations to play when the arrow is clicked.
    // nudges: A list of [dx,dy] offsets of len squares.length - 1, or null/empty.
    //     The nudges are intended for avoiding overlapping arrows and can be
    //     calculated using the Nudges module.
    //     The nudges correspond to the arrow segments, in order, and are multiplied
    //     here by some number to convert them to pixels.
    // The dimensions of the generated arrows are tuned to look good on a board of
    // size 400x400 pixels.
    // The generated SVG elements are assigned the classes from cls, plus "arrow"
    // and "arrow-sq1-sq2...".
    this.drawArrow = function(cls, squares, weight, ex_ids, ghost_anims, nudges) {
        const ARROW_BORDER_WIDTH = square_size * 0.052;
        const data_c = ex_ids ? ex_ids.join(' ').trim() : '';

        if (squares.length === 1) {
            // A single square - highlight the piece in that square. This is done
            // by just adding a class to the square and using CSS to make the piece
            // or the square have the desired style.
            var square = squares[0];
            $(".square-" + square, board_el)
                .addClass(cls)
                .attr('data-c', data_c);
            return;
        }

        // Hard-coded special case - the 'lastmove' class.
        if (squares.length === 2 && cls.split(' ').indexOf('lastmove') !== -1) {
            // The last move played is represented by CSS classes on the from-
            // and to- squares rather than by an actual arrow.
            $(".square-55d63.lastmove", board_el).removeClass('lastmove');
            $(".square-" + squares[0], board_el).addClass('lastmove');
            $(".square-" + squares[1], board_el).addClass('lastmove');
            return;
        }

        // Two or more squares - draw an arrow.

        // Return the SVG curve definition string that draws the arrow.
        // squares: The array of squares through which the arrow runs. E.g., ['a1', 'c3', 'g3'].
        // nudges: An array of [dx,dy] displacements, one per arrow segment. These
        //     displacements are created by .......() and are used to prevent the arrows
        //     from overlapping each other. Passing null or an empty array means no
        //     displacements.
        function createCurveElement(squares, nudges) {
            var fm_e = $(".square-" + squares[0], board_el);
            var origin = sq_origin(squares[0]); // The origin of our coords system is top-left of start square.

            // pregap: The distance from first square center to start of path.
            // postgap: The distance from the path end (without the arrow head) to the
            //     last square's center.
            var pregap, postgap;
            // ingap: The distance from square center to arc endpoints inside the path.
            //     This plus any of the other two must be <1.
            var ingap = square_size * 0.57;

            // Make the arrow a bit shorter if the end square has a piece in it.
            //TODO: this is broken - if the piece is moving, then we usually get
            // here before the piece is added to the square and the result is wrong.
            var to_sq = squares[squares.length - 1];
            if ($('.square-' + to_sq, board_el).children('IMG').length) {
                // The end square contains a piece. Stay away from the center.
                postgap = square_size * 0.40; // Room for the arrow head.
            } else {
                // The end square has no piece, so we can get closer to the center.
                postgap = square_size * 0.27;
            }

            // Make the arrows shorter unless they are a very short single segment.
            pregap = square_size * 0.39;
            if (squares.length === 2) {
                if (vlen(vsub(sq_center(squares[0]), sq_center(squares[1]))) < square_size * 1.5) {
                    // Very short arrows need to be made longer to be noticed.
                    pregap = square_size * 0.33;
                    postgap = square_size * 0.30;
                }
            }

            var points = [];
            for (var i = 0; i < squares.length; i++) {
                points.push(vsub(sq_center(squares[i]), origin));
            }

            // Use zero nudges if no nudges were supplied by the caller.
            if (! nudges || ! nudges.length) {
                nudges = [];
                for (var i = 0; i < squares.length; i++) {
                    nudges.push([0, 0]);
                }
            }

            return make_curve_str(points, nudges, pregap, postgap, ingap);
        }

        function toRadians(angle) {
            return angle * (Math.PI / 180);
        }

        var init_weight = weight;

        var arrow_classes = cls.split(' ');
        var xray = (arrow_classes.indexOf('mseg-xray') !== -1);
        var o_response = (arrow_classes.indexOf('o-atk-lcl') !== -1 || arrow_classes.indexOf('o-thr-lcl') !== -1);

        // Some voodoo to convert concept importance (0..1) to arrow thickness (pixels).
        const thickness = (weight*0.35 + 15) * square_size * 0.0026;

        var ang, cx, cy, lineBackGraph, lineGraph, c2c;
        var coords1 = [];

        var fm_e = board_selector + " .square-" + squares[0];
        var arrow_base = square_size * 0.32;   // This is ugly, but I could not find a better way.
        var attrs_obj = {
            width: arrow_base, height: arrow_base,
            'class': cls + ' arrow arrow-' + squares.join('-'),
            weight: init_weight
        };
        if (data_c.length) {
            attrs_obj['data-c'] = data_c;
        }
        if (ghost_anims != '') {
            attrs_obj['data-aa'] = ghost_anims;
        }
        var svgContainer = window.d3.select(fm_e).append('svg').attr(attrs_obj);

        //var lineFunction = d3.svg.line()
        //    .x(function(d) { return d[0]; })
        //    .y(function(d) { return d[1]; })
        //    .interpolate("linear");

        var lineArrowFunction = window.d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate("none");

        if (1) {
            lineBackGraph = svgContainer.append("path")
            .attr({'d': createCurveElement(squares, nudges),
                   'stroke-width': thickness + ARROW_BORDER_WIDTH,
                   'stroke': '#fff',
                   'stroke-linecap': 'round',
                   'stroke-linejoin': 'round',
                   'fill': 'none',
                   'opacity': 0.5});

            lineGraph = svgContainer.append("path")
                .attr({'d': createCurveElement(squares, nudges),
                       'stroke-width': thickness,
                       'stroke-linecap': 'round',
                       'stroke-linejoin': 'round',
                       'fill': 'none'});

            // A couple of hard-coded classes
            if (xray) {
                // An XRAY arrow is dotted.
                lineGraph.attr('stroke-dasharray', '0,' + (thickness*1.6));
            } else if (o_response) {
                // An opponent-response arrow is mostly solid, except for two gaps in its tail.
                lineGraph.attr('stroke-dasharray', '9,4,5,4,2600');
            }

            var fm_sq = squares[squares.length - 2];
            var to_sq = squares[squares.length - 1];
            if (orientation == 'black') {
                var d_row = -Number(to_sq[1]) + Number(fm_sq[1]);
                var d_col = -col_idx(to_sq[0]) + col_idx(fm_sq[0]);
            } else {
                var d_row = Number(to_sq[1]) - Number(fm_sq[1]);
                var d_col = col_idx(to_sq[0]) - col_idx(fm_sq[0]);
            }
            ang = Math.atan2(-d_row, d_col) * 180 / Math.PI;

            var node = lineGraph.node();
            var totalL = node ? node.getTotalLength() : 1;
            cx = node ? node.getPointAtLength(totalL).x : 0;
            cy = node ? node.getPointAtLength(totalL).y : 0;
            c2c = 0;
        }

        // Arrow head size
        var n_weight = thickness * 1.12;

        // Arrow head shape
        var coords2 = [
            [c2c, n_weight / 2],
            [c2c - 1 * n_weight, 1.23 * n_weight + n_weight / 2],
            [c2c + 2.11 * n_weight, n_weight / 2],
            [c2c - 1 * n_weight, -1.23 * n_weight + n_weight / 2],
            [c2c, n_weight / 2]
        ];

        // Arrow head outline.
        var arrow2 = svgContainer.append("path")
            .attr({'d': lineArrowFunction(coords2),
                    'transform': 'translate(' + (cx + n_weight / 2 * Math.sin(toRadians(ang)).toFixed(2)) + ', ' +
                                                (cy - n_weight / 2 * Math.cos(toRadians(ang)).toFixed(2)) + ') rotate(' + ang + ",0,0)",
                    'stroke-width': ARROW_BORDER_WIDTH,
                    'stroke': '#fff',
                    'fill': '#fff'});

        // Arrow head fill (no color - that will be inherited from outside based
        // on the arrow's CSS class).
        var arrow = svgContainer.append("path")
            .attr({'d': lineArrowFunction(coords2),
                    'class': 'arr-con',
                    'transform': 'translate(' + (cx + n_weight / 2 * Math.sin(toRadians(ang)).toFixed(2)) + ", "
                                            + (cy - n_weight / 2 * Math.cos(toRadians(ang)).toFixed(2)) + ') rotate(' + ang + ",0,0)"});
    };

    // Remove all the arrows from the board.
    this.removeAllArrows = function() {
        // Assume the only SVG elements on the board are our arrow containers.
        $('SVG', board_el).remove();
    };
};


export default ArrowMaker;