import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge, { getCategoryText, getCategoryIcon, getPriorityText, formatDate } from '../components/StatusBadge'

function AdminRequests() {
    const [user, setUser] = useState(null)
    const [requests, setRequests] = useState([])
    const [filteredStatus, setFilteredStatus] = useState('all')
    const [message, setMessage] = useState('กำลังโหลดรายการแจ้งซ่อม...')

    const navigate = useNavigate()

    useEffect(() => {
        const savedUser = localStorage.getItem('user')

        if (!savedUser) {
            navigate('/login')
            return
        }

        const loggedInUser = JSON.parse(savedUser)

        if (loggedInUser.role !== 'admin') {
            navigate('/dashboard')
            return
        }

        setUser(loggedInUser)
        loadRequests()
    }, [navigate])

    async function loadRequests() {
        try {
            const response = await fetch(
                'http://localhost:5000/api/requests'
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'ไม่สามารถโหลดรายการแจ้งซ่อมได้')
                return
            }

            setRequests(data.requests || [])
            setMessage('')
        } catch (error) {
            console.error('Get all requests error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
        }
    }

    if (!user) {
        return (
            <div className="df-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)' }}>กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>
            </div>
        )
    }

    const displayedRequests = filteredStatus === 'all'
        ? requests
        : requests.filter(r => r.status === filteredStatus)

    const pendingCount = requests.filter(r => r.status === 'pending').length
    const inProgressCount = requests.filter(r => r.status === 'in_progress').length
    const completedCount = requests.filter(r => r.status === 'completed').length
    const closedCount = requests.filter(r => r.status === 'closed').length

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">รายการแจ้งซ่อมทั้งหมด (Admin)</h1>
                    <p className="page-subtitle">จัดการและอัปเดตสถานะการแจ้งซ่อมของหอพัก</p>
                </div>
            </div>

            {/* Quick Stat Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilteredStatus('all')}>
                    <div className="stat-icon">📋</div>
                    <div>
                        <div className="stat-value">{requests.length}</div>
                        <div className="stat-label">รายการทั้งหมด</div>
                    </div>
                </div>

                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilteredStatus('pending')}>
                    <div className="stat-icon" style={{ backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>🟡</div>
                    <div>
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-label">รอรับเรื่อง</div>
                    </div>
                </div>

                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilteredStatus('in_progress')}>
                    <div className="stat-icon" style={{ backgroundColor: 'var(--status-progress-bg)', color: 'var(--status-progress-text)' }}>🔵</div>
                    <div>
                        <div className="stat-value">{inProgressCount}</div>
                        <div className="stat-label">กำลังดำเนินการ</div>
                    </div>
                </div>

                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilteredStatus('completed')}>
                    <div className="stat-icon" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>🟢</div>
                    <div>
                        <div className="stat-value">{completedCount}</div>
                        <div className="stat-label">ซ่อมเสร็จ</div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filteredStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('all')}
                >
                    ทั้งหมด ({requests.length})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('pending')}
                >
                    🟡 รอรับเรื่อง ({pendingCount})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('in_progress')}
                >
                    🔵 กำลังดำเนินการ ({inProgressCount})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('completed')}
                >
                    🟢 ซ่อมเสร็จ ({completedCount})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'closed' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('closed')}
                >
                    ⚫ ปิดงาน ({closedCount})
                </button>
            </div>

            {message && (
                <div className="alert alert-info">{message}</div>
            )}

            {displayedRequests.length === 0 && !message && (
                <div className="df-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>✨</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        ไม่มีรายการในสถานะนี้
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        ยังไม่มีรายการแจ้งซ่อมที่ตรงกับตัวกรองที่เลือก
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayedRequests.map((request) => (
                    <div key={request.request_id} className="df-card" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        #{request.request_id}
                                    </span>
                                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                                        {request.title}
                                    </h2>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                    <span>👤 ผู้แจ้ง: <strong>{request.full_name}</strong></span>
                                    <span>•</span>
                                    <span>🚪 ห้อง: <strong>{request.room_number}</strong></span>
                                    <span>•</span>
                                    <span>{getCategoryIcon(request.category)} {getCategoryText(request.category)}</span>
                                    <span>•</span>
                                    <span>ความสำคัญ: {getPriorityText(request.priority)}</span>
                                </div>
                            </div>

                            <StatusBadge status={request.status} />
                        </div>

                        <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.6' }}>
                            {request.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                วันที่แจ้ง: {formatDate(request.created_at)}
                            </div>

                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(`/admin/requests/${request.request_id}`)}
                            >
                                จัดการรายการและอัปเดตสถานะ →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminRequests