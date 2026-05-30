<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

// Fetches ALL events from ALL admins for the public dashboard
$sql = "SELECT e.*, (SELECT COUNT(id) FROM attendees WHERE event_id = e.id) AS booked_seats FROM events e ORDER BY e.event_date ASC";
$result = $conn->query($sql);

$events = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['booked_seats'] = (int)$row['booked_seats'];
        $row['capacity'] = (int)$row['capacity'];
        $events[] = $row;
    }
}

echo json_encode(["status" => "success", "events" => $events]);
$conn->close();
?>