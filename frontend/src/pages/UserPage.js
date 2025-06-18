import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUser, deleteUser, blockUser, unblockUser, resetUserPassword, registerUser } from '../api';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        role: '',
        password: ''
    });
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            setUsers([]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                // Cập nhật người dùng hiện có
                const updateData = { ...formData };
                delete updateData.password; // Không cập nhật mật khẩu khi sửa
                await updateUser(editingUserId, updateData);
            } else {
                // Thêm người dùng mới
                const registerData = { ...formData };
                if (!registerData.password) {
                    registerData.password = '1'; // Mật khẩu mặc định là "1" nếu không nhập
                }
                await registerUser(registerData);
            }
            
            // Reset form và fetch lại danh sách
            setFormData({ firstname: '', lastname: '', email: '', mobile: '', role: '', password: '' });
            setEditingUserId(null);
            fetchUsers();
        } catch (error) {
            console.error('Lỗi khi thao tác với người dùng:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            password: ''
        });
        setEditingUserId(user._id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            fetchUsers();
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
        }
    };
    const handleBlock = async (id) => {
        try {
            await blockUser(id);
            fetchUsers();
        } catch (error) {
            console.error('Lỗi khi chặn người dùng:', error);
        }
    };
    
    const handleUnblock = async (id) => {
        try {
            await unblockUser(id);
            fetchUsers();
        } catch (error) {
            console.error('Lỗi khi bỏ chặn người dùng:', error);
        }
    };
    
    const handleResetPassword = async (id) => {
        const newPassword = prompt("Nhập mật khẩu mới:");
        if (newPassword) {
            try {
                await resetUserPassword(id, newPassword);
                alert("Đặt lại mật khẩu thành công");
            } catch (error) {
                console.error('Lỗi khi đặt lại mật khẩu:', error);
            }
        }
    };

    return (
        <div className="container">
            <h1 className="my-4">Quản lý Người dùng</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} className="form-control mb-2" placeholder="Tên" required />
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} className="form-control mb-2" placeholder="Họ" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control mb-2" placeholder="Email" required />
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="form-control mb-2" placeholder="Số điện thoại" />
                <select name="role" value={formData.role} onChange={handleChange} className="form-control mb-2" required>
                    <option value="">Chọn vai trò</option>
                    <option value="user">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                </select>
                {!editingUserId && (
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="form-control mb-2" 
                        placeholder="Mật khẩu (mặc định: 1)" 
                    />
                )}
                <button type="submit" className="btn btn-success">{editingUserId ? 'Cập nhật' : 'Thêm'} Người dùng</button>
                {editingUserId && (
                    <button 
                        type="button" 
                        className="btn btn-secondary ms-2"
                        onClick={() => {
                            setEditingUserId(null);
                            setFormData({ firstname: '', lastname: '', email: '', mobile: '', role: '', password: '' });
                        }}
                    >
                        Hủy
                    </button>
                )}
            </form>
            <h2>Danh sách Người dùng</h2>
            <ul className="list-group mb-4">
    {users.map(user => (
        <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <h3>{user.firstname} {user.lastname}</h3>
                <p>Email: {user.email} | SĐT: {user.mobile} | Vai trò: {user.role} | Trạng thái: {user.isBlocked ? 'Đã chặn' : 'Hoạt động'}</p>
            </div>
            <div>
                <button className="btn btn-warning me-2" onClick={() => handleEdit(user)}>Sửa</button>
                <button className="btn btn-danger me-2" onClick={() => handleDelete(user._id)}>Xóa</button>
                {user.isBlocked ? 
                    <button className="btn btn-success me-2" onClick={() => handleUnblock(user._id)}>Bỏ chặn</button> :
                    <button className="btn btn-secondary me-2" onClick={() => handleBlock(user._id)}>Chặn</button>
                }
                <button className="btn btn-info" onClick={() => handleResetPassword(user._id)}>Đặt lại mật khẩu</button>
            </div>
        </li>
    ))}
</ul>
        </div>
    );
};

export default UserPage;