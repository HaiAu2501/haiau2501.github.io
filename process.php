<?php
// Danh sách mật khẩu hợp lệ
$valid_passwords = array("password1", "password2", "password3"); // Thay các mật khẩu này bằng mật khẩu của bạn

// Nhận mật khẩu từ form
$entered_password = $_POST['password'];

// Kiểm tra mật khẩu
if (in_array($entered_password, $valid_passwords)) {
    // Chuyển hướng tới trang tiếp theo nếu mật khẩu đúng
    header("Location: https://www.facebook.com/"); // Thay thế bằng URL của bạn
    exit();
} else {
    // Thông báo lỗi nếu mật khẩu sai
    echo "Mật khẩu không đúng. Vui lòng thử lại.";
}
