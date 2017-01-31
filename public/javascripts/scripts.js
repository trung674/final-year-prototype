$(document).ready(function() {
    $('#re-password, #password').keyup(function () {
        if ($('#re-password').val() == $('#password').val()) {
            
            $('#form-password').removeClass('has-error').addClass('has-success');
            $('#form-re-password').removeClass('has-error').addClass('has-success');
        } else {
            $('#form-password').removeClass('has-success').addClass('has-error');
            $('#form-re-password').removeClass('has-success').addClass('has-error');
        }; 
    });
});