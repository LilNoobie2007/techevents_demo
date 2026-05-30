<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->otp) && isset($data->new_password)) {
    // Adding trim() to instantly destroy any accidental blank spaces
    $email = trim($data->email);
    $otp = trim($data->otp);
    $new_password_raw = $data->new_password;

    // Check if OTP matches
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND otp_code = ?");
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Hash the new password
        $hashed_password = password_hash($new_password_raw, PASSWORD_BCRYPT);
        
        // PERFECT DB MATCH: Only update password_hash and clear the OTP!
        $updateStmt = $conn->prepare("UPDATE users SET password_hash=?, otp_code=NULL WHERE email=?");
        $updateStmt->bind_param("ss", $hashed_password, $email);
        
        if($updateStmt->execute()) {
            ob_clean();
            echo json_encode(['status' => 'success', 'message' => 'Password reset successfully!']);
        } else {
            ob_clean();
            echo json_encode(['status' => 'error', 'message' => 'Database error during reset.']);
        }
    } else {
        ob_clean();
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired verification code.']);
    }
} else {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Missing data.']);
}
?>