function generate_json() {
  var data = {
    mines: {},
    board: {}
  }

  var $mines = $(".mines-num")
  for (var i = 0; i < $mines.length; i++) {
    try {
      var j = parseInt($($mines[i]).val());
      if (j > 0 && j != null) {
        data.mines[$($mines[i]).attr('num')] = j;
      }
    } catch (err) {
      /* ignore this? */
    }
  }

  var $board = $(".board-num")
  for (var i = 0; i < $board.length; i++) {
    try {
      var j = parseInt($($board[i]).val());
      if (j > 0 && j != null) {
        data.board[$($board[i]).attr('num')] = j;
      }
    } catch (err) {
      /* ignore this? */
    }
  }

  return data;
}

function activateMineDataDropdown(id) {
  let v=$(`.MineDataTab-all[data-rel="${id}"]`);
  let w=$(`.MineData-all[data-rel="${id}-Dropdown"]`);

  $('.MineDataTab-all').removeClass('dropdown-open');
  $('.MineData-all').stop().slideUp(500);

  console.log(v);
  console.log(w);

  if(!w.hasClass('dropdown-open')) {
    $('.MineData-all').removeClass('dropdown-open');
    v.addClass('dropdown-open');
    w.stop().addClass('dropdown-open').slideDown(500);
  } else {
    $('.MineData-all').removeClass('dropdown-open');
  }
}

$(document).ready(function () {
  $('.MineData-all').stop().slideUp(0);

  $('.MineDataTab-all').click(function() {
    activateMineDataDropdown($(this).data('rel'));
  })

  $("#start-button").click(function() {
    $("#start-button").notify("Creating board...", "info");
    $.ajax({
      method:'POST',
      url:'create',
      data:JSON.stringify(generate_json()),
      contentType: 'application/json',
      success:function(d) {
        let j=JSON.parse(d);
        if(j.state==1)
          $("#start-button").notify("The board was created go back to Discord to play!", "success");
        else if(j.state==2)
          $("#start-button").notify("The board was added to the channel queue. The bot will notify you when the game starts!", "success");
        else if(j.state==3)
          $("#start-button").notify("You need to run `>start` in a channel first so the bot knows where to create the game.", "success");
        else if(j.state==0)
          $("#start-button").notify("Your board was rejected. Maybe you don't have permission to create boards for this channel?", "error");
        else if(j.state==999)
          $("#start-button").notify("Error: "+j.message);
        else
          $("#start-button").notify("Your board was rejected. The data you sent was probably invalid, this shouldn't happen LUL!", "error");
      },
      error:function(err) {
        console.error(err);
        $("#start-button").notify("There was an error creating the board!", "error");
      }
    })
    console.log(generate_json());
  });
})
