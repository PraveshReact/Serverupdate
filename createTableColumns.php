<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

class DBConnection {
    private $servername = "localhost";
    private $username = "Public_DBUser";
    private $password = "Smalsus@123";
    private $dbname = "h16635_HHHH_PublicDB";
    public $con;

    public function __construct() {
        // Create connection
        $this->con = new mysqli($this->servername, $this->username, $this->password, $this->dbname);

        // Check connection
        if ($this->con->connect_error) {
            die("Connection failed: " . $this->con->connect_error);
        }
    }

    // Close the connection
    public function close() {
        $this->con->close();
    }
}

// Create DBConnection instance
$conDB = new DBConnection();

// Set character encoding for database connection
mysqli_set_charset($conDB->con, "utf8mb4");

$request = $_SERVER['REQUEST_METHOD'];

if ($request == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['ApiType']) && isset($data['tableName']) && isset($data['data'])) {
        $apiType = mysqli_real_escape_string($conDB->con, $data['ApiType']);
        $table_name = mysqli_real_escape_string($conDB->con, $data['tableName']);
        $columns = $data['data']; // Now columns is an associative array

        if (is_array($columns) && !empty($columns)) {
            // Check if table exists, if not create it
            $tableExistsQuery = "SHOW TABLES LIKE '$table_name'";
            $result = mysqli_query($conDB->con, $tableExistsQuery);
            if (mysqli_num_rows($result) == 0) {
                // Create the table if it doesn't exist
                $createTableQuery = "CREATE TABLE `$table_name` (id INT AUTO_INCREMENT PRIMARY KEY)";
                $createTableResult = mysqli_query($conDB->con, $createTableQuery);
                if (!$createTableResult) {
                    echo json_encode([
                        'success' => false,
                        'status' => 500,
                        'message' => "Failed to create table: " . mysqli_error($conDB->con),
                    ]);
                    exit;
                }
            }

            if ($apiType == 'postData') {
                // Ensure all columns exist in the table, if not, create them dynamically
                foreach ($columns as $column => $value) {
                    $columnExistsQuery = "SHOW COLUMNS FROM `$table_name` LIKE '$column'";
                    $columnResult = mysqli_query($conDB->con, $columnExistsQuery);
                    if (mysqli_num_rows($columnResult) == 0) {
                        // Add column if it doesn't exist (all columns will have LONGTEXT type)
                        $columnType = getColumnType($value);  // Always return LONGTEXT
                        $addColumnQuery = "ALTER TABLE `$table_name` ADD COLUMN `$column` $columnType";
                        $addColumnResult = mysqli_query($conDB->con, $addColumnQuery);
                        if (!$addColumnResult) {
                            echo json_encode([
                                'success' => false,
                                'status' => 500,
                                'message' => "Failed to add column: " . mysqli_error($conDB->con),
                            ]);
                            exit;
                        }
                    }
                }

                // Prepare INSERT query
                $column_names = implode(", ", array_map(function ($col) use ($conDB) {
                    return "`" . mysqli_real_escape_string($conDB->con, $col) . "`";
                }, array_keys($columns)));

                // Prepare column values
                $column_values = implode(", ", array_map(function ($val) use ($conDB) {
                    if (is_array($val)) {
                        // Convert array to JSON string for storage
                        return "'" . mysqli_real_escape_string($conDB->con, json_encode($val)) . "'";
                    }
                    return "'" . mysqli_real_escape_string($conDB->con, $val) . "'";
                }, array_values($columns)));

                $query = "INSERT INTO `$table_name` ($column_names) VALUES ($column_values)";
                $result = mysqli_query($conDB->con, $query);

                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'status' => 200,
                        'message' => "Data inserted successfully",
                    ]);
                } else {
                    // Log the MySQL error
                    error_log("Insert Error: " . mysqli_error($conDB->con));
                    echo json_encode([
                        'success' => false,
                        'status' => 500,
                        'message' => "Failed to insert data: " . mysqli_error($conDB->con),
                    ]);
                }
            } elseif ($apiType == 'updateData') {
                // Ensure columns exist in the table
                foreach ($columns as $column => $value) {
                    $columnExistsQuery = "SHOW COLUMNS FROM `$table_name` LIKE '$column'";
                    $columnResult = mysqli_query($conDB->con, $columnExistsQuery);
                    if (mysqli_num_rows($columnResult) == 0) {
                        // Add column if it doesn't exist (all columns will have LONGTEXT type)
                        $columnType = getColumnType($value);  // Always return LONGTEXT
                        $addColumnQuery = "ALTER TABLE `$table_name` ADD COLUMN `$column` $columnType";
                        $addColumnResult = mysqli_query($conDB->con, $addColumnQuery);
                        if (!$addColumnResult) {
                            echo json_encode([
                                'success' => false,
                                'status' => 500,
                                'message' => "Failed to add column: " . mysqli_error($conDB->con),
                            ]);
                            exit;
                        }
                    }
                }

                // Prepare UPDATE query
                $id = mysqli_real_escape_string($conDB->con, $columns["id"]);
                $set_clause = [];
                foreach ($columns as $column => $value) {
                    $column = mysqli_real_escape_string($conDB->con, $column);
                    if (is_array($value)) {
                        // Handle array case, convert to JSON string
                        $value = json_encode($value);
                    } else {
                        $value = mysqli_real_escape_string($conDB->con, $value);
                    }
                    $set_clause[] = "`$column` = '$value'";
                }
                $set_clause = implode(", ", $set_clause);

                $query = "UPDATE `$table_name` SET $set_clause WHERE `id` = '$id'";
                $result = mysqli_query($conDB->con, $query);

                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'status' => 200,
                        'message' => "Data updated successfully",
                    ]);
                } else {
                    // Log the MySQL error
                    error_log("Update Error: " . mysqli_error($conDB->con));
                    echo json_encode([
                        'success' => false,
                        'status' => 500,
                        'message' => "Failed to update data: " . mysqli_error($conDB->con),
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'status' => 400,
                    'message' => "Invalid ApiType or missing ID for update",
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'status' => 400,
                'message' => "Invalid columns data",
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'status' => 400,
            'message' => "Required data missing",
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'status' => 405,
        'message' => "Request method must be POST",
    ]);
    exit;
}

/**
 * Helper function to determine the column type based on the value's type.
 * @param mixed $value The value to check.
 * @return string The MySQL column type (LONGTEXT in this case).
 */
function getColumnType($value) {
    return "LONGTEXT"; // Always use LONGTEXT for all columns
}
?>
