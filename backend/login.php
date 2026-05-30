<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
// ... rest of your login logic

// 2. Read the incoming JSON from React
$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = $data->email;
    $password = $data->password;

    // 3. Search for the user by email
    $stmt = $conn->prepare("SELECT id, name, password_hash FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // 4. Check if the user exists
    if($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // 5. Verify the typed password against the encrypted hash
        if(password_verify($password, $user['password_hash'])) {
            
            // Success! Send back the user details (but NEVER send the password back)
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name']
                ]
            ]);

        } else {
            // Password was wrong
            echo json_encode(["status" => "error", "message" => "Incorrect password."]);
        }
    } else {
        // Email wasn't found
        echo json_encode(["status" => "error", "message" => "User not found."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing email or password."]);
}

$conn->close();
?>