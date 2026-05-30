<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? null;

if ($email) {
    // JOIN attendees with events to show the event title on the ticket
    $sql = "SELECT a.*, e.title, e.event_date, e.venue 
            FROM attendees a 
            JOIN events e ON a.event_id = e.id 
            WHERE a.email = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $tickets = [];
    while ($row = $result->fetch_assoc()) {
        $tickets[] = $row;
    }

    echo json_encode(["status" => "success", "tickets" => $tickets]);
} else {
    echo json_encode(["status" => "error", "message" => "Email is required."]);
}
?>  