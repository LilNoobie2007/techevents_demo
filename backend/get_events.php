<?php
// CORS Headers for React handshake
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

if(isset($_GET['user_id'])) {
    $user_id = (int)$_GET['user_id']; // Cast to int for safety

    // Fetch events where user_id matches the logged-in admin
    $stmt = $conn->prepare("SELECT e.*, (SELECT COUNT(id) FROM attendees WHERE event_id = e.id) AS booked_seats FROM events e WHERE e.user_id = ? ORDER BY e.event_date ASC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $events = [];
    while($row = $result->fetch_assoc()) {
        // Fix: Ensure numerical values are sent as numbers, not strings
        $row['booked_seats'] = (int)$row['booked_seats'];
        $row['capacity'] = (int)$row['capacity'];
        $events[] = $row;
    }

    echo json_encode(["status" => "success", "events" => $events]);
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing user ID."]);
}

$conn->close();
?>