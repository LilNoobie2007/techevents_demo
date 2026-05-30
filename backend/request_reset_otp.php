<?php
ob_start();
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php'; 

ini_set('display_errors', 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if (isset($data->email)) {
    $email = $data->email;

    // Check if user exists
    $stmt = $conn->prepare("SELECT name FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $name = $user['name'];
        $otp_code = sprintf("%06d", mt_rand(100000, 999999));

        // Save OTP to database
        $updateStmt = $conn->prepare("UPDATE users SET otp_code=? WHERE email=?");
        $updateStmt->bind_param("ss", $otp_code, $email);
        $updateStmt->execute();

        // Send Email
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com'; 
            $mail->SMTPAuth = true;
            $mail->Username = 'techsol983@gmail.com'; 
            // ---> PUT YOUR APP PASSWORD HERE <---
           $mail->Password = 'YOUR_GMAIL_APP_PASSWORD_HERE';; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
            $mail->Port = 465;

            $mail->setFrom('techsol983@gmail.com', 'Tech Events Support');
            $mail->addAddress($email, $name); 
            $mail->isHTML(true); 
            $mail->Subject = 'Password Reset Request - Tech Events';
            $mail->Body = "
                <div style='font-family: Arial; padding: 20px;'>
                    <h2>Tech Events Password Reset</h2>
                    <p>Hello {$name},</p>
                    <p>Use the 6-digit code below to reset your password. If you didn't request this, ignore this email.</p>
                    <h1 style='color: #007bff; letter-spacing: 5px;'>{$otp_code}</h1>
                </div>";
            $mail->send();
            
            ob_clean();
            echo json_encode(["status" => "success", "message" => "Reset code sent to your email!"]);
        } catch (Exception $e) {
            ob_clean();
            echo json_encode(["status" => "error", "message" => "Failed to send email."]);
        }
    } else {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "No account found with that email."]);
    }
} else {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Email is required."]);
}
?>