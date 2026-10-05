import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    if (!user) {
        return (
            <div className="df-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>กรุณาเข้าสู่ระบบ</p>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                    ไปหน้าเข้าสู่ระบบ
                </button>
            </div>
        )
    }

    const isAdmin = user.role === 'admin'

    if (isAdmin) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">แผงควบคุมระบบสำหรับผู้ดูแลระบบหอพัก</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="df-card">
                    <div className="df-card-header">
                        <h2 className="df-card-title">ข้อมูลผู้ดูแลระบบ</h2>
                        <span className="user-role-tag role-admin">ผู้ดูแลระบบ</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ชื่อ-นามสกุล</span>
                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{user.full_name}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>อีเมล</span>
                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{user.email}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ห้อง</span>
                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{user.room_number || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Menu */}
                <div className="df-card">
                    <div className="df-card-header">
                        <h2 className="df-card-title">เมนูผู้ดูแลระบบ</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/admin/requests')}
                            style={{ padding: '12px 24px', fontSize: '15px' }}
                        >
                            📋 รายการแจ้งซ่อมทั้งหมด
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Resident Dashboard</h1>
                    <p className="page-subtitle">ยินดีต้อนรับเข้าสู่ระบบแจ้งซ่อม DormFix</p>
                </div>
            </div>

            {/* User Info Card */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">ข้อมูลผู้พักอาศัย</h2>
                    <span className="user-role-tag role-resident">ผู้พักอาศัย</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ชื่อ-นามสกุล</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{user.full_name}</p>
                    </div>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>อีเมล</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{user.email}</p>
                    </div>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ห้องพัก</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>ห้อง {user.room_number}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">เมนูด่วน</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div 
                        style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: '#FFFFFF'
                        }}
                        onClick={() => navigate('/maintenance')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔧</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>แจ้งซ่อม</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ส่งคำร้องแจ้งซ่อมสิ่งของชำรุดภายในห้อง</p>
                    </div>

                    <div 
                        style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: '#FFFFFF'
                        }}
                        onClick={() => navigate('/requests')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>รายการแจ้งซ่อม</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ดูสถานะรายการแจ้งซ่อมทั้งหมดของคุณ</p>
                    </div>

                    <div 
                        style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: '#FFFFFF'
                        }}
                        onClick={() => navigate('/history')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🕐</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>ประวัติการแจ้งซ่อม</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ดู Timeline ขั้นตอนการทำงานของช่าง</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard