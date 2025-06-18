import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaUserCircle } from 'react-icons/fa';
import { updateUser } from '../api';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        address: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                email: user.email || '',
                mobile: user.mobile || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await updateUser(user._id, formData);
            
            setUser(response.data);
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Cập nhật thông tin thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page py-5">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 mb-4 mb-lg-0">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-body text-center p-4">
                                <div className="avatar-container mx-auto mb-4">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={`${user.firstname} ${user.lastname}`} 
                                            className="rounded-circle img-fluid border"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <FaUserCircle size={150} className="text-secondary" />
                                    )}
                                </div>
                                
                                <h4 className="fw-bold mb-1">{user?.firstname} {user?.lastname}</h4>
                                <p className="text-muted mb-3">{user?.email}</p>
                                
                                <div className="d-grid gap-2 mt-4">
                                    {!isEditing && (
                                        <button 
                                            className="btn btn-primary d-flex align-items-center justify-content-center"
                                            onClick={toggleEdit}
                                        >
                                            <FaEdit className="me-2" /> Chỉnh sửa thông tin
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Thông tin cá nhân</h5>
                                {isEditing && (
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={toggleEdit}
                                        type="button"
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                            
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-4">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-medium">Họ</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <FaUser className="text-muted" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="firstname"
                                                    value={formData.firstname}
                                                    onChange={handleChange}
                                                    readOnly={!isEditing}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-medium">Tên</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <FaUser className="text-muted" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lastname"
                                                    value={formData.lastname}
                                                    onChange={handleChange}
                                                    readOnly={!isEditing}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaEnvelope className="text-muted" />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control bg-light"
                                                name="email"
                                                value={formData.email}
                                                readOnly
                                            />
                                        </div>
                                        <small className="text-muted">Email không thể thay đổi</small>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Số điện thoại</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaPhone className="text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Địa chỉ</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaMapMarkerAlt className="text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="d-grid mt-4">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary py-2"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="me-2" /> Lưu thay đổi
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .profile-page {
                    min-height: 80vh;
                }
                
                .input-group-text {
                    border-right: none;
                }
                
                .form-control {
                    border-left: none;
                }
                
                .form-control:focus {
                    box-shadow: none;
                    border-color: #ced4da;
                }
                
                .avatar-container {
                    width: 150px;
                    height: 150px;
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;
