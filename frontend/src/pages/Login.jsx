import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        setMessage('กำลังเข้าสู่ระบบ...')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'เข้าสู่ระบบไม่สำเร็จ')
                setIsLoading(false)
                return
            }

            localStorage.setItem('user', JSON.stringify(data.user))
            setMessage('เข้าสู่ระบบสำเร็จ กำลังไปหน้า Dashboard...')

            setTimeout(() => {
                navigate('/dashboard')
            }, 500)

        } catch (error) {
            console.error('Login error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">DF</div>
                    <h1 className="auth-title">เข้าสู่ระบบ DormFix</h1>
                    <p className="auth-subtitle">ระบบแจ้งซ่อมสิ่งของชำรุดภายในหอพัก</p>
                </div>

                {message && (
                    <div className={`alert ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">อีเมล</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="เช่น user@dorm.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="กรอกรหัสผ่านของคุณ"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                    <Link to="/register" style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'underline' }}>
                        ลงทะเบียนใหม่
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login
