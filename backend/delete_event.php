<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

// RECTIFIED: Decode JSON input from Axios
$data = json_decode(file_get_contents("php://input"), true);

// Support both JSON and standard POST
$event_id = $data['event_id'] ?? $_POST['event_id'] ?? null;
$user_id = $data['user_id'] ?? $_POST['user_id'] ?? null;

if($event_id && $user_id) {
    // Secure delete: Only owner can delete
    $stmt = $conn->prepare("DELETE FROM events WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $event_id, $user_id);

    if($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Event deleted."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Event not found or unauthorized."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "SQL Error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing event ID ($event_id) or user ID ($user_id)."]);
}

$conn->close();
?>