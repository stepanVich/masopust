$(document).ready(function() {
    function urlencodeFormData(fd){
        var s = '';
        var e = fd.entries();
        function encode(s){ return encodeURIComponent(s).replace(/%20/g,'+'); }
        while( (o = e.next()) && !o.done){
            pair = o.value;
            if(typeof pair[1]=='string'){
                s += (s?'&':'') + encode(pair[0])+'='+encode(pair[1]);
            }
        }
        return s;
    }

    function replaceValidationUI( form ) {
        // Suppress the default bubbles
        form.addEventListener( "invalid", function( event ) {
            event.preventDefault();
        }, true );

        // Support Safari, iOS Safari, and the Android browser—each of which do not prevent
        // form submissions by default
        form.addEventListener( "submit", function( event ) {
            if ( !this.checkValidity() ) {
                event.preventDefault();
            }
        });

        var submitButton = form.querySelector( "button:not([type=button]), input[type=submit]" );
        submitButton.addEventListener( "click", function( event ) {
            var invalidFields = form.querySelectorAll( ":invalid" ),
                errorMessages = form.querySelectorAll( ".error-message" ),
                parent;

            // Remove any existing messages
            for ( var i = 0; i < errorMessages.length; i++ ) {
                errorMessages[ i ].parentNode.removeChild( errorMessages[ i ] );
            }

            for ( var i = 0; i < invalidFields.length; i++ ) {
                parent = invalidFields[ i ].parentNode;
                parent.insertAdjacentHTML( "beforeend", "<div class='error-message'>" + 
                    invalidFields[ i ].validationMessage +
                    "</div>" );
            }

            // If there are errors, give focus to the first invalid field
            if ( invalidFields.length > 0 ) {
                invalidFields[ 0 ].focus();
            }
        });
    }

    // Replace the validation UI for all forms
    var forms = document.querySelectorAll( "form" );
    for ( var i = 0; i < forms.length; i++ ) {
        replaceValidationUI( forms[ i ] );
    }

    document.querySelector('#contact-form').addEventListener('submit', function(event){
        event.preventDefault();
        var form = this;
        var data = new FormData(form);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                json = JSON.parse(xhttp.responseText);
                if(json.status && json.status == 'ok'){
                    form.reset();
                    document.querySelector('#errors').innerHTML = 'Your message has been sent.';
                    setTimeout(function(){
                        document.querySelector('#errors').innerHTML = '';
                    }, 5000);
                }
            }
        };
        xhttp.open("POST", form.getAttribute('action'), true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(urlencodeFormData(data));
    });
});
