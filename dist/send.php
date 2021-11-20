<?php
if ($_POST['uid'] != '') {
  die('{"status":"fail","error":"zzz"}');
}

if ($_POST['name'] == '') {
  die('{"status":"fail","error":"Please fulfill your name"}');
}

if ($_POST['email'] == '') {
  die('{"status":"fail","error":"Please fulfill your email"}');
}

if ($_POST['phone'] == '') {
  die('{"status":"fail","error":"Please fulfill your phone"}');
}

if ($_POST['message'] == '') {
  die('{"status":"fail","error":"Please fulfill your message"}');
}

function get_client_ip() {
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if(isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}

// Passes back true (it's spam) or false (it's ham)
function akismet_comment_check( $key, $data ) {
    $request = 'blog='. urlencode($data['blog']) .
               '&user_ip='. urlencode($data['user_ip']) .
               '&user_agent='. urlencode($data['user_agent']) .
               '&referrer='. urlencode($data['referrer']) .
               '&permalink='. urlencode($data['permalink']) .
               '&comment_type='. urlencode($data['comment_type']) .
               '&comment_author='. urlencode($data['comment_author']) .
               '&comment_author_email='. urlencode($data['comment_author_email']) .
               '&comment_author_url='. urlencode($data['comment_author_url']) .
               '&comment_content='. urlencode($data['comment_content']);
    $host = $http_host = $key.'.rest.akismet.com';
    $path = '/1.1/comment-check';
    $port = 443;
    $akismet_ua = "WordPress/4.4.1 | Akismet/3.1.7";
    $content_length = strlen( $request );
    $http_request  = "POST $path HTTP/1.0\r\n";
    $http_request .= "Host: $host\r\n";
    $http_request .= "Content-Type: application/x-www-form-urlencoded\r\n";
    $http_request .= "Content-Length: {$content_length}\r\n";
    $http_request .= "User-Agent: {$akismet_ua}\r\n";
    $http_request .= "\r\n";
    $http_request .= $request;
    $response = '';
    if( false != ( $fs = @fsockopen( 'ssl://' . $http_host, $port, $errno, $errstr, 10 ) ) ) {

        fwrite( $fs, $http_request );

        while ( !feof( $fs ) )
            $response .= fgets( $fs, 1160 ); // One TCP-IP packet
        fclose( $fs );

        $response = explode( "\r\n\r\n", $response, 2 );
    }

    if ( 'true' == $response[1] )
        return true;
    else
        return false;
}

// Call to comment check
$data = array('blog' => 'https://smartppc.solutions',
          'user_ip' => get_client_ip(),
          'user_agent' => $_SERVER['HTTP_USER_AGENT'],
          'referrer' => $_SERVER['HTTP_REFERER'],
          'permalink' => (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]",
          'comment_type' => 'contact-form',
          'comment_author' => $_POST['name'],
          'comment_author_email' => $_POST['email'],
          'comment_author_url' => $_POST['url'],
          'comment_content' => $_POST['message']);
$isSpam = akismet_comment_check( '76c614388148', $data );

if ($isSpam) {
  error_log(print_r($data, true));
  die('{"status":"fail","error":"zzz"}');
}

require __DIR__ . '/../vendor/autoload.php';

// 1. mail
try {
	//$mail->isSMTP();
	$mail = new PHPMailer;
	$mail->CharSet = 'UTF-8';
	$mail->Host = 'smtp.forpsi.com';
	$mail->SMTPAuth = true;
	$mail->Username = 'diana@smartppc.solutions';
	$mail->Password = '';
	$mail->SMTPSecure = 'tls';
	$mail->Port = 587;
	//$mail->SMTPDebug = 2;

	// 1. mail
	$mail->setFrom($_POST['email'], $_POST['name']);
	$mail->addAddress('diana@smartppc.solutions');
	$mail->isHTML(false);
	$mail->Subject = 'Lead from your website';
	$mail->Body = 'Hello,

	Your Name: '.$_POST['name'].'
	Your E-mail: '.$_POST['email'].'
	Your Phone: '.$_POST['phone'].'
	Your Website: '.$_POST['url'].'
	Your Message:
	'.$_POST['message'].'

	';
	$mail->send();
} catch (phpmailerException $e) {
    die('{"status":"fail","error":'.json_encode($e->errorMessage()).'}');
} catch (Exception $e) {
	die('{"status":"fail","error":'.json_encode($e->getMessage()).'}');
}

// 2. mail
try {
	$mail = new PHPMailer;
	$mail->CharSet = 'UTF-8';
	$mail->Host = 'smtp.forpsi.com';
	$mail->SMTPAuth = true;
	$mail->Username = 'diana@smartppc.solutions';
	$mail->Password = 'Vx_J9mtVXm';
	$mail->SMTPSecure = 'tls';
	$mail->Port = 587;

	$mail->setFrom('diana@smartppc.solutions', 'Smart PPC Solutions');
	$mail->addAddress($_POST['email'], $_POST['name']);
	$mail->isHTML(true);

	$mail->Subject = 'Your Smart PPC Solution is one step closer';
	$mail->AltBody = 'Dear '.$_POST['name'].'

	Thank you for your interest. I will get back to you in a couple of hours.
	In the meantime, let\'s stay in touch here https://www.linkedin.com/company/smart-ppc-solutions, https://www.facebook.com/smartppc.solutions, https://plus.google.com/ and follow the exciting news
	I\'m sharing on Digital Marketing.
	Have a great day ahead!

	Diana Masopust
	Smart PPC Solutions';

	$mail->Body = 'Dear '.$_POST['name'].'<br>
	<br>
	Thank you for your interest. I will get back to you in a couple of hours.<br>
	In the meantime, let\'s stay in touch here <a href="https://www.linkedin.com/company/smart-ppc-solutions">LinkedIn</a>, <a href="https://www.facebook.com/smartppc.solutions">Facebook</a>, <a href="https://plus.google.com/">G+</a> and follow the exciting news<br>
	I\'m sharing on Digital Marketing.<br>
	Have a great day ahead!<br>
	<br>
	Diana Masopust<br>
	Smart PPC Solutions<br>';

	if(!$mail->send()) {
		die('{"status":"fail","error":'.json_encode($mail->ErrorInfo).'}');
	} else {
	    die('{"status":"ok"}');
	}
} catch (phpmailerException $e) {
    die('{"status":"fail","error":'.json_encode($e->errorMessage()).'}');
} catch (Exception $e) {
	die('{"status":"fail","error":'.json_encode($e->getMessage()).'}');
}
