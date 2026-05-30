<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once 'db.php';

// Get JSON from TicketScanner.jsx
$data = json_decode(file_get_contents("php://input"), true);

$ticket_id = $data['ticket_id'] ?? null;
$admin_id = $data['admin_id'] ?? null; // Ensure only the event owner can verify

if ($ticket_id) {
    // 1. Check if ticket exists and hasn't been scanned yet
    $stmt = $conn->prepare("SELECT a.id, a.is_scanned, e.user_id 
                            FROM attendees a 
                            JOIN events e ON a.event_id = e.id 
                            WHERE a.id = ?");
    $stmt->bind_param("i", $ticket_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // 2. Security Check: Does this event belong to the logged-in admin?
        if ($row['user_id'] != $admin_id) {
            echo json_encode(["status" => "error", "message" => "❌ Unauthorized: You don't own this event."]);
            exit();
        }

        // 3. Check for double-entry
        if ($row['is_scanned'] == 1) {
            echo json_encode(["status" => "error", "message" => "⚠️ Already Scanned! Duplicate Entry."]);
        } else {
            // 4. Mark as scanned
            $update = $conn->prepare("UPDATE attendees SET is_scanned = 1 WHERE id = ?");
            $update->bind_param("i", $ticket_id);
            
            if ($update->execute()) {
                echo json_encode(["status" => "success", "message" => "✅ Entry Granted! Welcome."]);
            } else {
                echo json_encode(["status" => "error", "message" => "❌ Server Error during update."]);
            }
        }
    } else {
        echo json_encode(["status" => "error", "message" => "❌ Invalid Ticket: Not found in DB."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing Ticket ID."]);
}
$conn->close();
?>