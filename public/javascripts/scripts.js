$(document).ready(function() {
    // function changeSessionContent() {
    //   var sessionContent = $('#session-content');
    //   var sessionTypeValue = $('#session-type').val();
    //   if (sessionTypeValue === 'words') {
    //     sessionContent.attr('placeholder', 'For example: Apple; Banana; Orange....');
    //   } else if (sessionTypeValue == 'sentences') {
    //     sessionContent.attr('placeholder', 'For example: Turn off the TV; Turn on the TV; Turn up the volume....');
    //   } else if (sessionTypeValue == 'paragraphs') {
    //     sessionContent.attr('placeholder', 'Dunno what to say');
    //   } else if (sessionTypeValue == 'speech') {
    //     sessionContent.attr('placeholder', 'For example: Let\'s speak about the Cinderella\'s Story.');
    //   }
    // }

  $('#reminderForm').on('submit', function(e) {
    var data = $(this).serializeArray();
    e.preventDefault();
    $.ajax({
      data: data,
      url: $(this).attr('action'),
      type: 'POST',
      success: function(status){
        // $('p#status').removeClass('hidden').addClass('text-success').text(status);
        $('#remindModal').modal('hide');
        $('#notificationMsg').removeClass('hidden');
        $('#notificationMsg').text(status);
      },
      error: function(err) {
        // $('p#status').removeClass('hidden').addClass('text-danger').text(err);
        $('#remindModal').modal('hide');
        $('#errorMsg').removeClass('hidden');
        $('#errorMsg').text(status);
      }
    });
  });

  $('#emailForm').on('submit', function(e) {
    var data = $(this).serializeArray();
    e.preventDefault();
    $.ajax({
      data: data,
      url: $(this).attr('action'),
      type: 'POST',
      success: function(status){
        $('#successEmailStatus').removeClass('hidden');
        $('#successEmailStatus').text(status);
      },
      error: function(err) {
        $('#errorEmailStatus').removeClass('hidden');
        $('#errorEmailStatus').text(err);
      }
    });
  });


  $('#sessionSelect').on('change', function() {
    if ($(this).val() === 'date') {
      $('#queryInput').attr('type', 'date');
    } else if ($(this).val() === 'type') {
      $('#queryInput').attr('type', 'text');
      $('#queryInput').attr('placeholder', 'words/sentences/paragraph/speech');
    } else {
      $('#queryInput').attr('type', 'text');
    }
  });

  $('#userSelect').on('change', function() {
    if ($(this).val() === 'date_of_birth') {
      $('#queryInput').attr('type', 'date');
    } else {
      $('#queryInput').attr('type', 'text');
    }
  })

});
