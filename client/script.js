var $ = require('jquery');
var todoTemplate = require("../views/partials/todo.hbs");

var initTodoObserver = function () {
  var target = $('ul')[0];
  var config = { attributes: true, childList: true, characterData: true };
  var observer = new MutationObserver(function(mutationRecords) {
    $.each(mutationRecords, function(index, mutationRecord) {
      updateTodoCount();
    });
  });
  observer.observe(target, config);
  updateTodoCount();
};


$(function() {
  $(':button').on('click', addTodo);
  $(":text").on('keypress', function(e) {
    var key = e.keyCode;
    if( key == 13 || key == 169) {
      addTodo();
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });
  $("ul").on('change', 'li :checkbox', function() {
    var $this = $(this),
        $input = $(this)[0],
        $li = $(this).parent(),
        id = $li.attr('id'),
        checked = $input.checked,
        data = { done: checked };
    updateTodo(id, data, function(d) {
      $this.next().toggleClass("checked");
    });
  });

  $('ul').on('keydown', 'li span', function(e){ 
    var $this = $(this),
      $span = $(this)[0],
      $li = $(this).parent(),
      id = $li.attr('id'),
      key = e.keyCode,
      target = e.target,
      text = $span.innerHTML,
      data = { text: text};
    $this.addClass('editing'); 
    if( key === 27) {
      //escape key
      $this.removeClass('editing');
      document.execCommand('undo');
      target.blur();
    } else if (key === 13) {
      //enter key
      updateTodo(id,data,function(d){
        $this.removeClass('editing');
        target.blur();
      });
      e.preventDefault();
    }
  });

  $("ul").on('click', 'li a', function() {
    var $this = $(this),
    $input = $(this)[0],
    $li = $(this).parent(),
    id = $li.attr('id');
    deleteTodo(id, deleteTodoLi($li));
  });

  $('.filter').on('click', '.show-all', function() {
    $('.hide').removeClass('hide');
  });

  $('.filter').on('click', '.show-not-done', function() {
    $('.hide').removeClass('hide');
    $('.checked').closest('li').addClass('hide');
  });

  $('.filter').on('click', '.show-done', function() {
    $('li').addClass('hide');
    $('.checked').closest('li').removeClass('hide');
  });

  $(".clear").on("click", function() {
    var $doneLi = $(".checked").closest("li");
    for (var i = 0; i < $doneLi.length; i++) {
      var $li = $($doneLi[i]); //you get a li out, and still need to convert into $li
      var id = $li.attr('id');
      deleteTodo(id, deleteTodoLi($li));
    }
  });
  initTodoObserver();
});

var addTodo = function() {
  var text = $('.add-todo-text').val();
   $.ajax({
     url: '/api/todos',
     type: 'POST',
     data: {
       text: text
     },
     dataType: 'json',
     success: function(data) {
      var todo = data.todo;
      var newLiHtml = todoTemplate(todo);
      $('form + ul').append(newLiHtml);
      $('.add-todo-text').val('');
    }
  });
};

var updateTodo = function(id, data, cb) {
  $.ajax({
    url: '/api/todos/'+id,
    type: 'PUT',
    data: data,
    dataType: 'json',
    success: function(data) {
      cb();
    }
  });
};

var deleteTodo = function(id, cb) {
  $.ajax({
    url: '/api/todos/'+id,
    type: 'DELETE',
    data: {
      id: id
    },
    dataType: 'json',
    success: function(data) {
      cb();
    }
  });
};

var deleteTodoLi = function($li) {
  $li.remove();
};

var updateTodoCount = function () {
  $(".count").text($("li").length);
};

var pomodoro = {};
$(document).ready(
  function() {
    pomodoro.start = false;
    pomodoro.wTime = 25;
    pomodoro.bTime = 5;
    pomodoro.breakCount = 0;
    pomodoro.inter = "";
    $("#breakTime").text(pomodoro.bTime);
    $("#workTime").text(pomodoro.wTime);

    $("#workPlus").click(function() {
      pomodoro.wTime += 60000;
      $("#workTime").text(Math.floor(pomodoro.wTime / 60000));
    });

    $("#workMinus").click(function() {
      pomodoro.wTime -= 60000;
      $("#workTime").text(Math.floor(pomodoro.wTime / 60000));
    });

    $("#breakPlus").click(function() {
      pomodoro.bTime += 60000;
      $("#breakTime").text(Math.floor(pomodoro.bTime / 60000));
    });

    $("#breakMinus").click(function() {
      pomodoro.bTime -= 60000;
      $("#breakTime").text(Math.floor(pomodoro.bTime / 60000));
    });

    $("#start").click(function() {
      $("#displayTime").css("color", "green");
      if (pomodoro.inter){
        clearInterval(pomodoro.inter);
      }
      pomodoro.breakCount = 0;
      timer(pomodoro.wTime);
    });

    $("#stop").click(function() {
      clearInterval(pomodoro.inter);
      pomodoro.breakCount = 0;
      $("#displayTime").text("Stopped");
    });

    pomodoro.wTime *= 1000 * 60;
    pomodoro.bTime *= 1000 * 60;

    function timer(time) {
        
       pomodoro.inter = setInterval(
        function() {

          var sec = (time / 1000 % 60);
          var min = parseInt(time / 60000);

          if (sec < 10) {

            $("#displayTime").text(min + ":" + "0" + sec);

          } else {

            $("#displayTime").text(min + ":" + sec);
          }
          
          time = time - 1000;

          if (time < 0 && pomodoro.breakCount) {
            document.getElementById("notify1").play();
            clearInterval(pomodoro.inter);
            $("#displayTime").text("Done");
          } else if (time < 0) {
            document.getElementById("notify").play();
            pomodoro.breakCount = 1;
            clearInterval(pomodoro.inter);
            timer(pomodoro.bTime);
            $("#displayTime").css("color", "red");
          }
        }, 1000

      );

      console.log("function ran");
    }

  });