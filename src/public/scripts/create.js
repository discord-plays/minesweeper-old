var timerCheckbox,timerTimeSection,timerHours,timerMinutes,timerSeconds,modCheckboxes;

$(document).ready(function() {
  timerCheckbox = $("#MineTimerEnabled");
  timerTimeSection = $("#MineTimerTime");
  timerHours = $("#MineTimerHours");
  timerMinutes = $("#MineTimerMinutes");
  timerSeconds = $("#MineTimerSeconds");
  modCheckboxes = $(".MineModsCheckbox");

  timerCheckbox.click(function() {
    if(timerCheckbox.is(':checked')) timerTimeSection.slideDown();
    else timerTimeSection.slideUp();
  });
});

function generate_json() {
  var data = {
    mines: {},
    board: {timer:0},
    customBoardId: $("#MineBoards").val()
  }

  var $mines = $(".mine-generator-embed")
  for (var i = 0; i < $mines.length; i++) {
    let $mine = $($mines[i]);
    let $mineid = $mine.attr('mineid');
    try {
      var j = parseInt($mine.val());
      if (j > 0 && j != null) {
        data.mines[$mineid] = j;
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

  if(timerCheckbox.is(':checked')) data.board.timer = parseInt(timerHours.val()) * 3600 + parseInt(timerMinutes.val()) * 60 + parseInt(timerSeconds.val());

  return data;
}

function updateDynamicContent() {
  for (var i=0; i<modCheckboxes.length; i++) {
    var modid = $(modCheckboxes[i]).data('mod');
    var isEnabled = $(modCheckboxes[i]).is(':checked');
    if(isEnabled) {
      $("#MineData-" + modid + "-Section").show(0);
    } else {
      $("#MineData-" + modid + "-Section").hide(0);
    }
  }
}

$(document).ready(function () {
  $('.selector-page').stop().slideUp(0);

  $(".selector-button").click(function() {
    updateDynamicContent();
    $(this).parent().stop().slideUp();
    $("#"+$(this).attr('to')).stop().slideDown();
  });

  $("#start-button").click(function() {
    $("#start-button").notify("Creating board...", "info");
    $.ajax({
      method: 'POST',
      url: 'create',
      data: JSON.stringify(generate_json()),
      contentType: 'application/json',
      success: function(d) {
        let j=JSON.parse(d);
        if(j.state==1)
          $("#start-button").notify("The board was created, go back to Discord to play!", "success");
        else if(j.state==2)
          $("#start-button").notify("The board was added to the channel queue. The bot will notify you when the game starts!", "success");
        else if(j.state==3)
          $("#start-button").notify("You need to run `/start` in a channel first so the bot knows where to create the game.", "success");
        else if(j.state==0)
          $("#start-button").notify("Your board was rejected. Maybe you don't have permission to create boards for this channel?", "error");
        else if(j.state==999)
          $("#start-button").notify("Error: "+j.message);
        else
          $("#start-button").notify("Your board was rejected. The data you sent was probably invalid, this shouldn't happen LUL!", "error");
      },
      error: function(err) {
        console.error(err);
        $("#start-button").notify("There was an error creating the board!", "error");
      }
    });
  });

  $("#reset-button").click(function() {
    $('.selector-page').stop().slideUp();
    $('#info-selector').stop().slideDown();
  });
});
