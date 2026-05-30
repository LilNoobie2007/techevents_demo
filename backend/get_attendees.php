<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once 'db.php';

if (isset($_GET['event_id'])) {
    $event_id = (int)$_GET['event_id'];

    // RECTIFIED: Pulling directly from attendees using the schema columns
    $sql = "SELECT name, email, is_scanned, registered_at FROM attendees WHERE event_id = ? ORDER BY registered_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $attendees = [];
    while ($row = $result->fetch_assoc()) {
        $attendees[] = $row;
    }

    echo json_encode(["status" => "success", "attendees" => $attendees]);
} else {
    echo json_encode(["status" => "error", "message" => "Missing event_id"]);
}
?>