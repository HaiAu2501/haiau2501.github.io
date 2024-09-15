<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Chỉ xử lý nếu phương thức là POST

    // Danh sách các mật khẩu đã mã hóa SHA-256 rút gọn (10 ký tự)
    $valid_hashes = array(
        "ae050d97b8",
        "8e6a128f5e", /*... thêm mã hash ...*/
    );

    // Nhận mật khẩu từ form
    $entered_password = $_POST['password'];
    $hashed_password = substr(hash('sha256', $entered_password), 0, 10);

    if (in_array($hashed_password, $valid_hashes)) {
        // Đọc đường dẫn từ file link.txt
        $file_path = 'link.txt';  // Đường dẫn tới file link.txt
        if (file_exists($file_path)) {
            $url = trim(file_get_contents($file_path));  // Đọc và xóa khoảng trắng thừa
            // Chuyển hướng tới URL trong file
            header("Location: $url");
            exit();
        } else {
            echo "Lỗi: Không tìm thấy file URL.";
        }
    } else {
        echo "Mật khẩu không đúng. Vui lòng thử lại.";
    }
} else {
    // Nếu không phải là POST, trả về lỗi 405
    header('HTTP/1.1 405 Method Not Allowed');
    echo "Phương thức không được phép.";
}
?>