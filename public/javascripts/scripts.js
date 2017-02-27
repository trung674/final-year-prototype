$(document).ready(function() {
    // $('#re-password, #password').keyup(function () {
    //     if ($('#re-password').val() == $('#password').val()) {
    //
    //         $('#form-password').removeClass('has-error').addClass('has-success');
    //         $('#form-re-password').removeClass('has-error').addClass('has-success');
    //     } else {
    //         $('#form-password').removeClass('has-success').addClass('has-error');
    //         $('#form-re-password').removeClass('has-success').addClass('has-error');
    //     };
    // });

    // $('#word-title').text('Testing');
    // $('#items a:first-child').addClass('active');
    // var currentWord = $('#items a:first-child').text();
    // $('#word-title').text(currentWord);
    // $('#items a').click(function() {
    //   $('#items a.active').removeClass('active');
    //   $(this).addClass('active');
    //   currentWord = $(this).text();
    //   $('#word-title').text(currentWord);
    // });

    function changeSessionContent() {
      var sessionContent = $('#session-content');
      var sessionTypeValue = $('#session-type').val();
      if (sessionTypeValue === 'words') {
        sessionContent.attr('placeholder', 'For example: Apple; Banana; Orange....');
      } else if (sessionTypeValue == 'sentences') {
        sessionContent.attr('placeholder', 'For example: Turn off the TV; Turn on the TV; Turn up the volume....');
      } else if (sessionTypeValue == 'paragraphs') {
        sessionContent.attr('placeholder', 'Dunno what to say');
      } else if (sessionTypeValue == 'speech') {
        sessionContent.attr('placeholder', 'For example: Let\'s speak about the Cinderella\'s Story.');
      }
    }

});



// $('#start-recoring').click(function() {
//   $.ajax({
//     url: $(location) + '/recording',
//
//
//   })
// });
