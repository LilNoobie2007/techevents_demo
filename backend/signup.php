<?php
// No empty lines above this!
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// 3. THE "ENGINE" (Keep these lines!)
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// 4. THE DATABASE (Check db.php separately!)
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->password)) {


    $name = $data->name;
    $email = $data->email;

    // Encrypt the password using PHP
    $password = password_hash($data->password, PASSWORD_BCRYPT);

    $admin_type = $data->admin_type ?? 'Independent';
    $organization = $data->organization ?? '';

    // Generate a secure 6-digit OTP
    $otp_code = sprintf("%06d", mt_rand(100000, 999999));

    // Check if user already exists
    $checkStmt = $conn->prepare("SELECT id, is_verified FROM users WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows > 0) {
        $existingUser = $result->fetch_assoc();
       if ($existingUser['is_verified'] == 1) {
            ob_clean();
           echo json_encode(['status' => 'error', 'message' => 'Email already registered and verified. Please login.']);
           exit();
        } else {
            // PERFECT DB MATCH: Only updates password_hash
            $updateStmt = $conn->prepare("UPDATE users SET name=?, password_hash=?, admin_type=?, organization=?, otp_code=? WHERE email=?");
           $updateStmt->bind_param("ssssss", $name, $password, $admin_type, $organization, $otp_code, $email);
           $updateStmt->execute();
       }
    } else {
        // PERFECT DB MATCH: Only inserts into password_hash
      $insertStmt = $conn->prepare("INSERT INTO users (name, email, password_hash, admin_type, organization, otp_code, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)");
        $insertStmt->bind_param("ssssss", $name, $email, $password, $admin_type, $organization, $otp_code);
        $insertStmt->execute();
    }


    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
       $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
       $mail->Username = 'techsol983@gmail.com';
       $mail->Password = 'YOUR_GMAIL_APP_PASSWORD_HERE'; // Paste here
       $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
       $mail->Port = 587;

       $mail->setFrom('techsol983@gmail.com', 'Tech Events by Kevin Makwana');
        $mail->addAddress($email, $name); 

        $mail->isHTML(true); 
        $mail->Subject = 'Verify Your Admin Account - Tech Events';
        $mail->Body = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eef2f5; border-radius: 12px; background-color: #ffffff;'>
                    <div style='text-align: center; margin-bottom: 25px;'>
                        <h2 style='color: #12161f; margin: 0; font-size: 24px;'>Tech Events <span style='color: #007bff; font-weight: normal; font-size: 18px;'>by Kevin Makwana</span></h2>
                    </div>
                    <p style='font-size: 16px; color: #2b2b2b; line-height: 1.6;'>Hello <strong>{$name}</strong>,</p>
                    <p style='font-size: 16px; color: #2b2b2b; line-height: 1.6;'>We received a request to register your email as an administrator for the Tech Events platform. Please use the 6-digit verification code below to complete your secure setup:</p>
                    <div style='text-align: center; margin: 40px 0;'>
                        <span style='font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #12161f; background-color: #f8fafd; padding: 20px 40px; border-radius: 12px; border: 2px dashed #007bff;'>
                            {$otp_code}
                        </span>
                    </div>
                    <p style='font-size: 14px; color: #6c757d; text-align: center; border-top: 1px solid #eef2f5; padding-top: 20px; margin-top: 30px;'>
                        If you did not request an admin account, you can safely ignore and delete this email.
                    </p>
                </div>
            ";
        
        $mail->AltBody = "Hello {$name},\n\nYour Tech Events admin verification code is: {$otp_code}\n\nIf you did not request this, please ignore this email.";

        $mail->send();
        $mail->SMTPDebug = 2; // This will output the full conversation with Google
        
        // Wipe any hidden PHP text and send pure JSON!
        ob_clean();
        echo json_encode([
            "status" => "success", 
            "message" => "Verification code sent to your email!"
        ]);

        // ... (The rest of your mail sending code)
    } catch (Exception $e) {
       echo json_encode(['status' => 'error', 'message' => $mail->ErrorInfo]);
    }
}