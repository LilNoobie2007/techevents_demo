<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

if (empty($_POST) && empty($_FILES)) {
    echo json_encode(['status' => 'error', 'message' => 'PHP received NOTHING. File size limit exceeded.']);
    exit();
}

// THE SENIOR FIX: Import the centralized database connection
require_once 'db.php';

if (isset($_POST['event_id']) && isset($_POST['user_id'])) {
    
    $image_url = $_POST['image_url'] ?? ''; 
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) { mkdir($upload_dir, 0777, true); }
        
        $file_name = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", basename($_FILES['image_file']['name']));
        $target_path = $upload_dir . $file_name;
        
        if (move_uploaded_file($_FILES['image_file']['tmp_name'], $target_path)) {
            $image_url = 'http://localhost/event-management/backend/' . $target_path;
        }
    }

    $sql = "UPDATE events SET title=?, event_date=?, event_time=?, venue=?, venue_map_link=?, capacity=?, description=?, additional_details=?, image_url=? WHERE id=? AND user_id=?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'SQL Error: ' . $conn->error]);
        exit();
    }
    
    $title = $_POST['title'];
    $date = $_POST['event_date'];
    $time = $_POST['event_time'] ?? '';
    $venue = $_POST['venue'] ?? '';
    $venue_map_link = $_POST['venue_map_link'] ?? '';
    $capacity = $_POST['capacity'];
    $desc = $_POST['description'];
    $add_details = $_POST['additional_details'] ?? '';
    $event_id = $_POST['event_id'];
    $user_id = $_POST['user_id'];

    $stmt->bind_param("sssssisssii", $title, $date, $time, $venue, $venue_map_link, $capacity, $desc, $add_details, $image_url, $event_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Event updated successfully!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database rejection: ' . $stmt->error]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
}
?>