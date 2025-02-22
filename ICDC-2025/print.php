<?php
// Edited php file that now has server side validation of uploaded 3D printing (.stl) files 

session_start();

$message = '';
$link = '';
$file_size = 0;

function is_valid_stl($file_path) {
    // Open the file in binary mode ("rb" = read binary)
    $open_file = fopen($file_path, "rb");

    // If the file cannot be opened, return false (invalid file)
    if (!$open_file) return false;

    // Read the first 80 bytes of the file (STL header)
    $header = fread($open_file, 80); 

    // Read the next 4 bytes, which should contain the number of triangles (only in binary STL)
    $triangle_count = fread($open_file, 4);

    // Close the file to free resources
    fclose($open_file);

    // Check if the header starts with "solid", indicating an ASCII STL file
    if (strpos(trim($header), "solid") === 0) {
        return true; // Likely an ASCII STL file
    }

    // Check if exactly 4 bytes were read for the triangle count, indicating a Binary STL file
    if (strlen($triangle_count) == 4) {
        return true; // Likely a Binary STL file
    }

    // If neither ASCII nor Binary STL conditions are met, return false (invalid STL)
    return false;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $target_dir = "/var/www/html/uploads/";

    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0600, true);
    }


    if (isset($_FILES["fileToUpload"])) {
        //$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
        $file_name = basename($_FILES["fileToUpload"]["name"]);
        $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION)); // Get Extension of uploaded file

        $target_file = $target_dir . $file_name;
        $tmp_file = $_FILES["fileToUpload"]["tmp_name"];

        if ($file_extension != 'stl') {
            $message = "ERROR: Invalid file type! Only .stl files are allowed.";
        } elseif (!is_valid_stl($tmp_file)) {
            $message = "ERROR: The file does not appear to be a valid STL file.";
        } else {
            ///$target_file = $target_dir . $file_name;

            if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
                $message = "The file " . basename($_FILES["fileToUpload"]["name"]) . " has been uploaded.";
                $link = "<a href='/uploads/" . htmlspecialchars(basename($_FILES["fileToUpload"]["name"])) . "' class='view-link' target='_blank'>View it here</a>";
                $file_size = filesize($target_file);
                $_SESSION['file_uploaded'] = true;
                $_SESSION['uploaded_file'] = basename($_FILES["fileToUpload"]["name"]);
            } else {
                $message = "Sorry, there was an error uploading your file.";
            }
        }
    
    } else {
        $message = "No file was uploaded.";
    }

    if (isset($_POST['creationName'])) {
        $_SESSION['creationName'] = $_POST['creationName'];
    }
}

$creationName = isset($_SESSION['creationName']) ? $_SESSION['creationName'] : '';
$uploadedFile = isset($_SESSION['uploaded_file']) ? $_SESSION['uploaded_file'] : '';
?>