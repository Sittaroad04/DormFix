import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [roomNumber, setRoomNumber] = useState('')

    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()

        if (password !== confirmPassword) {
            setMessage('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
            return
        }

        setIsLoading(true)
        setMessage('กำลังสมัครสมาชิก...')

        try {
            const response = await fetch(
                'http://localhost:5000/api/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        full_name: fullName,
                        email,
                        password,
                        room_number: roomNumber,
                        role: 'resident'
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'สมัครสมาชิกไม่สำเร็จ')
                setIsLoading(false)
                return
            }

            setMessage('สมัครสมาชิกสำเร็จ กำลังนำทางไปหน้าเข้าสู่ระบบ...')

            setTimeout(() => {
                navigate('/login')
            }, 1000)

        } catch (error) {
            console.error('Register error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ maxWidth: '460px' }}>
                <div className="auth-header">
                    <div className="auth-logo">DF</div>
                    <h1 className="auth-title">ลงทะเบียนผู้พักอาศัย</h1>
                    <p className="auth-subtitle">สร้างบัญชีสำหรับแจ้งซ่อมสิ่งของชำรุดในหอพัก</p>
                </div>

                {message && (
                    <div className={`alert ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">ชื่อ-นามสกุล *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="เช่น สมชาย ใจดี"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">อีเมล *</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="เช่น somchai@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ห้องพัก *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="เช่น A101 หรือ 204"
                            value={roomNumber}
                            onChange={(event) => setRoomNumber(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน *</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ยืนยันรหัสผ่าน *</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    มีบัญชีอยู่แล้ว?{' '}
                    <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'underline' }}>
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Register