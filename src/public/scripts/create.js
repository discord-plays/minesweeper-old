var timerCheckbox, timerTimeSection, timerHours, timerMinutes, timerSeconds, modCheckboxes;

$(document).ready(function () {
  timerCheckbox = $("#MineTimerEnabled");
  timerTimeSection = $("#MineTimerTime");
  timerHours = $("#MineTimerHours");
  timerMinutes = $("#MineTimerMinutes");
  timerSeconds = $("#MineTimerSeconds");
  modCheckboxes = $(".MineModsCheckbox");

  timerCheckbox.click(function () {
    if (timerCheckbox.is(":checked")) timerTimeSection.slideDown();
    else timerTimeSection.slideUp();
  });
});

function generate_json() {
  var data = {
    mines: {},
    board: { timer: 0 },
    customBoardId: $("#MineBoards").val(),
  };

  var $mines = $(".mine-generator-embed");
  for (var i = 0; i < $mines.length; i++) {
    let $mine = $($mines[i]);
    let $mineid = $mine.attr("mineid");
    try {
      var j = parseInt($mine.val());
      if (j > 0 && j != null) {
        data.mines[$mineid] = j;
      }
    } catch (err) {
      /* ignore this? */
    }
  }

  var $board = $(".board-num");
  for (var i = 0; i < $board.length; i++) {
    try {
      var j = parseInt($($board[i]).val());
      if (j > 0 && j != null) {
        data.board[$($board[i]).attr("num")] = j;
      }
    } catch (err) {
      /* ignore this? */
    }
  }

  if (timerCheckbox.is(":checked")) data.board.timer = parseInt(timerHours.val()) * 3600 + parseInt(timerMinutes.val()) * 60 + parseInt(timerSeconds.val());

  return data;
}

function updateDynamicContent() {
  for (var i = 0; i < modCheckboxes.length; i++) {
    var modid = $(modCheckboxes[i]).data("mod");
    var isEnabled = $(modCheckboxes[i]).is(":checked");
    if (isEnabled) {
      $("#MineData-" + modid + "-Section").show(0);
    } else {
      $("#MineData-" + modid + "-Section").hide(0);
    }
  }
}

function errorDialogPressOK() {
  $("#dialog-error-message-wrapper").fadeOut(500);
}

function showErrorDialog(title, msg) {
  $("#dialog-error-message-wrapper h2[data-type=title]").text(title);
  $("#dialog-error-message-wrapper p[data-type=message]").text(msg);
  $("#dialog-error-message-wrapper").fadeIn(500);
}

function isValidNumberOfMines(a) {
  var b = parseInt(a);
  if (isNaN(b)) return false;
  return b > 0;
}

function isValidNumberFromText(a) {
  var b = parseInt(a);
  return [!isNaN(b) && b >= 0, b];
}

function isValidNumberOfHours(a) {
  return isValidNumberFromText(a);
}

function isValidNumberOfMinutes(a) {
  return isValidNumberFromText(a);
}

function isValidNumberOfSeconds(a) {
  return isValidNumberFromText(a);
}

$(document).ready(function () {
  if (timerCheckbox.is(":checked")) timerTimeSection.slideDown(0);
  else timerTimeSection.slideUp(0);

  $(".selector-page").stop().slideUp(0);

  $(".selector-button").click(function () {
    updateDynamicContent();
    var nextRequired = $(this).attr("next-required");
    var toPage = $("#" + $(this).attr("to"));
    var parentForButton = $(this).parent();
    function next() {
      parentForButton.stop().slideUp();
      toPage.stop().slideDown();
    }

    switch (nextRequired) {
      case "mods-selected":
        if (modCheckboxes.is(":checked")) next();
        else showErrorDialog("Discord Plays Minesweeper", "At least one mod must be selected");
        break;
      case "mines-selected":
        var mines = $(".mine-generator-embed");
        var result = false;
        for (var i = 0; i < mines.length; i++) {
          if (isValidNumberOfMines($(mines[i]).val())) result = true;
        }
        if (result) next();
        else showErrorDialog("Discord Plays Minesweeper", "At least one mines must be selected");
        break;
      case "timer-selected":
        var result = true;
        if (timerCheckbox.is(":checked")) {
          var timer1 = isValidNumberOfHours(timerHours.val());
          var timer2 = isValidNumberOfMinutes(timerMinutes.val());
          var timer3 = isValidNumberOfSeconds(timerSeconds.val());
          if (!(timer1[0] && timer2[0] && timer3[0])) result = false;
          if (timer1[1] + timer2[1] + timer3[1] <= 0) result = false;
        }
        if (result) next();
        else showErrorDialog("Discord Plays Minesweeper", "The timer must be valid (values can be bigger than the intended size e.g. minutes can be more than 60 and will just add more hours)");
        break;
      default:
        next();
        break;
    }
  });

  $("#start-button").click(function () {
    $("#start-button").notify("Creating board...", "info");
    $.ajax({
      method: "POST",
      url: "create",
      data: JSON.stringify(generate_json()),
      contentType: "application/json",
      success: function (d) {
        let j = JSON.parse(d);
        if (j.state == 1) $("#start-button").notify("The board was created, go back to Discord to play!", "success");
        else if (j.state == 2) $("#start-button").notify("The board was added to the channel queue. The bot will notify you when the game starts!", "success");
        else if (j.state == 3) $("#start-button").notify("You need to run `/start` in a channel first so the bot knows where to create the game.", "success");
        else if (j.state == 0) $("#start-button").notify("Your board was rejected. Maybe you don't have permission to create boards for this channel?", "error");
        else if (j.state == 999) $("#start-button").notify("Error: " + j.message);
        else $("#start-button").notify("Your board was rejected. The data you sent was probably invalid, this shouldn't happen LUL!", "error");
      },
      error: function (err) {
        console.error(err);
        $("#start-button").notify("There was an error creating the board!", "error");
      },
    });
  });

  $("#reset-button").click(function () {
    $(".selector-page").stop().slideUp();
    $("#info-selector").stop().slideDown();
  });
});
