<?php
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    print("Sending email to $name");

    $name = 'Polly';
    $email = 'pollyanecs@gmail.com';
    $message = 'something';


    $from = 'From: $name';
    $to = 'pollyanecs@gmail.com';
    $subject = '100 Danish Form Submission';
    $body = "From: $name\nE-Mail: $email\n\nMessage:\n$message";



    //mail ($to, $subject, $body, $email);

    $success = mail($to, 'My Subject', $body);
    //print($success);
    if (!$success) {
        $errorMessage = error_get_last()['message'];
    }
  ?>