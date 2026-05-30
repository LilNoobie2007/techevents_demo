<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->otp)) {
    $email = $data->email;
    $otp = $data->otp;

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND otp_code = ? AND is_verified = 0");
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // OTP is correct! Verify the user and clear the OTP.
        $updateStmt = $conn->prepare("UPDATE users SET is_verified = 1, otp_code = NULL WHERE email = ?");
        $updateStmt->bind_param("s", $email);
        $updateStmt->execute();

        echo json_encode(['status' => 'success', 'message' => 'Account verified successfully!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid OTP or account already verified.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing email or OTP.']);
}
?>