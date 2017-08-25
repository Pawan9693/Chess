var board, game, username, player, chan = location.pathname == "/" ? null : location.pathname.substr(1), socket = io();

socket.on('waiting', function(data) {
	chan = data.chan;
	$('#joinLink').html('<a href="/'+chan+'">' + location.host + '/' + chan + '</a>');
});

socket.on('hostLeft', function(data) {

});

socket.on('playerLeft', function(data) {

});

socket.on('newBoard', function(data) {
	initBoard(data.pos);
	updateStatus();
});

socket.on('move', function(data) {
	game.move(data.move);
	board.position(data.pos);
	updateStatus();
});

function addPlayer() {
	player = chan ? 'black' : 'white';
	initBoard();
	username = $('#username').val();
	socket.emit('newUser', {user:username, chan:chan, pos:game.fen()});
	$('#login').hide();
}

function checkUsername(event) {
	if (event.keyCode == 13) {
		addPlayer();
	}
}

function initBoard(pos) {
	board = null;
	game = new Chess();
	status = $('#status');

	var config = {
	  draggable: true,
	  position: pos || 'start',
	  onDragStart: onDragStart,
	  onDrop: onDrop,
	  onSnapEnd: onSnapEnd,
	  orientation: player,
	  showNotation: false

	};
	board = ChessBoard('myBoard', config);

	updateStatus();
}


function onDragStart (source, piece, position, orientation) {
  if (game.game_over()) return false
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
      game.turn() !== player.substr(0,1)) {
    return false
  }
}

function onDrop (source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })

  if (move === null) return 'snapback'

  updateStatus(move)
}

function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus (move) {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  else {
    status = moveColor + ' to move'

    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $('#status').html(status);
  if (move) socket.emit('move', {move:move, chan:chan, player:player, board:game.fen()});
}
