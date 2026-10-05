import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'

export default function Layout() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (!savedUser) {
            navigate('/login')
            return
        }
        setUser(JSON.parse(savedUser))
    }, [navigate, location.pathname])

    function handleLogout() {
        localStorage.removeItem('user')
        navigate('/login')
    }

    if (!user) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>กำลังตรวจสอบสิทธิ์...</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        ไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </div>
        )
    }

    const isAdmin = user.role === 'admin'

    return (
        <div className="app-container">
            {/* Top Header */}
            <header className="app-header">
                <div className="brand-section">
                    <div className="brand-logo-icon">DF</div>
                    <div>
                        <span className="brand-name">DormFix</span>
                        <span className="brand-badge" style={{ marginLeft: '8px' }}>หอพัก</span>
                    </div>
                </div>

                <div className="header-user-section">
                    <div className="user-profile-pill">
                        <div className="user-avatar-circle">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                {user.full_name}
                            </span>
                            {user.room_number && (
                                <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '12px' }}>
                                    ห้อง {user.room_number}
                                </span>
                            )}
                        </div>
                        <span className={`user-role-tag ${isAdmin ? 'role-admin' : 'role-resident'}`}>
                            {isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้พักอาศัย'}
                        </span>
                    </div>

                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={handleLogout}
                        title="ออกจากระบบ"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            {/* Main Body */}
            <div className="app-body">
                {/* Sidebar */}
                <aside className="app-sidebar">
                    <div className="sidebar-menu">
                        <div className="sidebar-menu-title">
                            {isAdmin ? 'เมนูผู้ดูแลระบบ' : 'เมนูหลัก'}
                        </div>

                        {isAdmin ? (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    end
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">📊</span>
                                    <span>Dashboard</span>
                                </NavLink>

                                <NavLink
                                    to="/admin/requests"
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">📋</span>
                                    <span>รายการแจ้งซ่อมทั้งหมด</span>
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    end
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">📊</span>
                                    <span>Dashboard</span>
                                </NavLink>

                                <NavLink
                                    to="/maintenance"
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">🔧</span>
                                    <span>แจ้งซ่อม</span>
                                </NavLink>

                                <NavLink
                                    to="/requests"
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">📋</span>
                                    <span>รายการแจ้งซ่อม</span>
                                </NavLink>

                                <NavLink
                                    to="/history"
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">🕐</span>
                                    <span>ประวัติการแจ้งซ่อม</span>
                                </NavLink>
                            </>
                        )}
                    </div>

                    <div className="sidebar-bottom">
                        <button
                            onClick={handleLogout}
                            className="sidebar-nav-item"
                            style={{ width: '100%', background: 'none', textAlign: 'left', border: 'none' }}
                        >
                            <span className="nav-icon">🚪</span>
                            <span>ออกจากระบบ</span>
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <main className="app-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
