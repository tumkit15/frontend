var leg = null;

function configureSocketEventsVenue(socket) {
    socket.on('venue_new_match', function (data) {
        if (!leg || leg.is_finished) {
            location.reload();
        }
    });
}

function configureSocketEvents(socket, leg, playersMap, liveScoreUpdate, venueSocket) {
    leg = leg;
    // Reverse the rows in the table to show newest throws first
    var tbody = $('#table-leg-visits tbody');
    tbody.html($('tr', tbody).get().reverse());

    if (leg.is_finished) {
        // Don't setup any sockets if leg is finished
        return;
    } else {
        // Add a row to the top of the table which contains the current throw for a given player
        var html =
            "<tr class='block-container-mid'>" +
            "<td id='current-player' style='vertical-align: baseline;'>" + playersMap[leg.current_player_id].name + "</td>" +
            "<td class='col-sm-2 dart-score-container no-border'><label id='first' text='0'></label></td>" +
            "<td class='col-sm-2 dart-score-container no-border'><label id='second' text='0'></label></td>" +
            "<td class='col-sm-2 dart-score-container no-border'><label id='third' text='0'></label></td>" +
            "<td><label id='total' text='0'>0</label></td>" +
            "</tr>";
        $('#table-leg-visits').prepend(html);
    }

    socket.on('connected', function (data) {
        // Send message to client announcing that we are spectating
        socket.emit('spectator_connected', '');
    });

    socket.on('possible_throw', function (data) {
        console.log(data);
        leg.is_finished = data.is_finished;
        if (data.is_finished) {
            showAlert(playersMap[data.current_player_id].name + ' won the leg', function () {
                alertify.success('Leg finished');
            });
            var legsWon = $('#player-legs-' + data.current_player_id);
            legsWon.text(parseInt(legsWon.text()) + 1)
            return;
        }

        var dart;
        if (data.darts_thrown === 1) {
            dart = $('.visits-active .first');
        }
        else if (data.darts_thrown === 2) {
            dart = $('.visits-active .second');
        }
        else if (data.darts_thrown === 3) {
            dart = $('.visits-active .third');
        }
        else {
            console.log("Unknown darts_thrown: " + data.darts_thrown);
            return;
        }
        dart.text(data.dart_text);

        dart.removeClass('dart-score-single dart-score-double dart-score-triple');
        if (!data.is_undo) {
            if (data.multiplier == 3) {
                dart.addClass('dart-score-triple');
            }
            else if (data.multiplier == 2) {
                dart.addClass('dart-score-double');
            }
            else {
                dart.addClass('dart-score-single');
            }
        }

        if (liveScoreUpdate) {
            var playerScore = $('#player-score-' + data.current_player_id);
            playerScore.text(parseInt(playerScore.text()) - data.score);
            $('.visits-active .total-score').text(data.score + parseInt($('.visits-active .total-score').text()));
        }
    });

    socket.on('undo_visit', function (data) {
        $('#table-leg-visits > tbody > tr').eq(1).remove();
    });

    socket.on('score_update', function (data) {
        var players = data.players;
        for (key in players) {
            var player = players[key];
            var playerScoreCard = $('#scorecard-player-' + player.player_id);
            var playerScore = $('#player-score-' + player.player_id);
            var playerVisits = $('#player-visit-' + player.player_id);
            playerScore.text(player.current_score);
            if (player.is_current_player) {
                playerScoreCard.removeClass().addClass('scorecard scorecard-active');
                playerVisits.removeClass().addClass('visits-active');
            } else {
                playerScoreCard.removeClass().addClass('scorecard scorecard-inactive');
                playerVisits.removeClass().addClass('visits-inactive');
            }
        }
        // Set round number and current player
        $('#round-number').text('R' + (Math.floor(data.leg.visits.length / data.leg.players.length) + 1));
        $('#current-player').text(playersMap[data.leg.current_player_id].name);

        // Reset UI elements
        resetThrowContainer($('.visits-active .first'));
        resetThrowContainer($('.visits-active .second'));
        resetThrowContainer($('.visits-active .third'));

        // Update the visits table
        if (!data.is_undo) {
            var visit = data.leg.visits[data.leg.visits.length - 1];
            var playerName = playersMap[visit.player_id].name;
            var total = (visit.first_dart.multiplier * visit.first_dart.value) +
                (visit.second_dart.multiplier * visit.second_dart.value) +
                (visit.third_dart.multiplier * visit.third_dart.value);
            if (visit.is_bust) {
                total = 'BUST';
            }
            // Append the score to the beginning of the table
            var html =
                "<tr class='block-container-mid'>" +
                "<td>" + playerName + "</td>" +
                "<td class='col-sm-2 dart-score-container no-border'><label class='" + getDartCSS(visit.first_dart) + "'>" + getScoreString(visit.first_dart) + "</label></td>" +
                "<td class='col-sm-2 dart-score-container no-border'><label class='" + getDartCSS(visit.second_dart) + "'>" + getScoreString(visit.second_dart) + "</label></td>" +
                "<td class='col-sm-2 dart-score-container no-border'><label class='" + getDartCSS(visit.third_dart) + "'>" + getScoreString(visit.third_dart) + "</label></td>" +
                "<td><label>" + total + "</label></td>" +
                "</tr>";
            $('#table-leg-visits > tbody > tr:first').after(html);
        }
    });

    function resetThrowContainer(container) {
        container.text('').removeClass('dart-score-single dart-score-double dart-score-triple');
    }

    socket.on('leg_finished', function (data) {
        if (location.href.includes('/venues/')) {
            if (venueSocket) {
                venueSocket.emit('get_next_match', venue.id);
            }
            return;
        }
        if (location.href.includes('/matches/')) {
            location.reload();
        }
        else {
            location.href = '/legs/' + data.new_leg_id + '/spectate';
        }
    });

    function getDartCSS(dart) {
        if (dart.value === null) {
            return '';
        }
        switch (dart.multiplier) {
            case 3: return 'dart-score-triple';
            case 2: return 'dart-score-double';
            default: return 'dart-score-single';
        }
    }

    function getScoreString(dart) {
        var score = dart.value;
        if (score === null) {
            return '';
        }
        if (score === 0) {
            return 'Miss';
        }
        else if (score === 25) {
            score = 'Bull';
        }

        if (dart.multiplier === 3) {
            return 'T-' + score;
        }
        else if (dart.multiplier === 2) {
            return 'D-' + score;
        }
        return score;
    }
}