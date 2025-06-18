import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { changePassword } from '../api';
import { FaLock, FaUnlock, FaKey, FaEye, FaEyeSlash, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Calculate password strength if changing new password
        if (name === 'newPassword') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 1;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 1;
        
        // Contains number
        if (/[0-9]/.test(password)) strength += 1;
        
        // Contains special character
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        setPasswordStrength(strength);
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return "";
        if (passwordStrength <= 2) return "Yếu";
        if (passwordStrength <= 3) return "Trung bình";
        if (passwordStrength <= 4) return "Mạnh";
        return "Rất mạnh";
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return "";
        if (passwordStrength <= 2) return "danger";
        if (passwordStrength <= 3) return "warning";
        if (passwordStrength <= 4) return "info";
        return "success";
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        if (passwordStrength < 3) {
            toast.warning('Mật khẩu mới của bạn không đủ mạnh!');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await changePassword(token, { currentPassword, newPassword });
            toast.success('Đổi mật khẩu thành công!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordStrength(0);
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-page py-5">
            <div className="container">
                <div className="row">
                    <div className="col-lg-7 mx-auto">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <FaShieldAlt size={50} className="text-primary mb-3" />
                                    <h2 className="fw-bold">Đổi mật khẩu</h2>
                                    <p className="text-muted">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn</p>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Mật khẩu hiện tại</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaLock className="text-muted" />
                                            </span>
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                name="currentPassword"
                                                className="form-control"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => togglePasswordVisibility('current')}
                                            >
                                                {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Mật khẩu mới</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaKey className="text-muted" />
                                            </span>
                                            <input
                                                type={showPassword.new ? "text" : "password"}
                                                name="newPassword"
                                                className="form-control"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        
                                        {formData.newPassword && (
                                            <div className="mt-2">
                                                <div className="password-strength-bar mt-2">
                                                    <div 
                                                        className={`strength-bar bg-${getPasswordStrengthColor()}`}
                                                        style={{ width: `${passwordStrength * 20}%` }}
                                                    ></div>
                                                </div>
                                                <small className={`text-${getPasswordStrengthColor()} d-block mt-1`}>
                                                    {getPasswordStrengthText()}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Xác nhận mật khẩu mới</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaUnlock className="text-muted" />
                                            </span>
                                            <input
                                                type={showPassword.confirm ? "text" : "password"}
                                                name="confirmPassword"
                                                className="form-control"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        
                                        {formData.newPassword && formData.confirmPassword && 
                                         formData.newPassword !== formData.confirmPassword && (
                                            <small className="text-danger mt-1 d-block">
                                                Mật khẩu không khớp
                                            </small>
                                        )}
                                    </div>
                                    
                                    <div className="password-requirements mb-4 p-3 bg-light rounded-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <FaInfoCircle className="text-primary me-2" />
                                            <span className="fw-medium">Yêu cầu mật khẩu:</span>
                                        </div>
                                        <ul className="small mb-0 ps-4">
                                            <li className={formData.newPassword.length >= 8 ? 'text-success' : 'text-muted'}>
                                                Ít nhất 8 ký tự
                                            </li>
                                            <li className={/[a-z]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                                Có ít nhất một chữ cái thường (a-z)
                                            </li>
                                            <li className={/[A-Z]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                                Có ít nhất một chữ cái hoa (A-Z)
                                            </li>
                                            <li className={/[0-9]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                                Có ít nhất một chữ số (0-9)
                                            </li>
                                            <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                                Có ít nhất một ký tự đặc biệt (!@#$%^&*)
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className="d-grid">
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
                                                'Đổi mật khẩu'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .change-password-page {
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
                
                .btn-outline-secondary {
                    border-left: none;
                }
                
                .btn-outline-secondary:focus {
                    box-shadow: none;
                }
                
                .password-strength-bar {
                    height: 5px;
                    background-color: #e9ecef;
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .strength-bar {
                    height: 100%;
                    border-radius: 5px;
                    transition: width 0.3s;
                }
            `}</style>
        </div>
    );
};

export default ChangePasswordPage;
