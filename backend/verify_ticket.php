<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

$ticket_id = $data['ticket_id'] ?? null;

if ($ticket_id) {
    // RECTIFIED: Simpler query for the demo to avoid "Event ID Required" errors
    $stmt = $conn->prepare("SELECT id, is_scanned, name FROM attendees WHERE id = ?");
    $stmt->bind_param("i", $ticket_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if ($row['is_scanned'] == 1) {
            echo json_encode(["status" => "error", "message" => "⚠️ Already Scanned: " . $row['name']]);
        } else {
            $update = $conn->prepare("UPDATE attendees SET is_scanned = 1 WHERE id = ?");
            $update->bind_param("i", $ticket_id);
            if ($update->execute()) {
                echo json_encode(["status" => "success", "message" => "✅ Entry Granted: " . $row['name']]);
            }
        }
    } else {
        echo json_encode(["status" => "error", "message" => "❌ Invalid Ticket ID"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No Ticket ID received."]);
}
?>