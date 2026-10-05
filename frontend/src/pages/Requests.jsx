import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge, { getCategoryText, getCategoryIcon, getPriorityText, formatDate } from '../components/StatusBadge'

function Requests() {
    const [user, setUser] = useState(null)
    const [requests, setRequests] = useState([])
    const [filteredStatus, setFilteredStatus] = useState('all')
    const [message, setMessage] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (!savedUser) {
            navigate('/login')
            return
        }

        const loggedInUser = JSON.parse(savedUser)
        setUser(loggedInUser)
        loadRequests(loggedInUser.user_id)
    }, [navigate])

    async function loadRequests(userId) {
        setMessage('กำลังโหลดรายการแจ้งซ่อม...')
        try {
            const response = await fetch(
                `http://localhost:5000/api/requests/user/${userId}`
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'ไม่สามารถโหลดรายการแจ้งซ่อมได้')
                return
            }

            setRequests(data.requests || [])
            setMessage('')
        } catch (error) {
            console.error('Get maintenance requests error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
        }
    }

    if (!user) {
        return (
            <div className="df-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)' }}>กำลังตรวจสอบข้อมูลผู้ใช้งาน...</p>
            </div>
        )
    }

    const displayedRequests = filteredStatus === 'all'
        ? requests
        : requests.filter(r => r.status === filteredStatus)

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">รายการแจ้งซ่อม</h1>
                    <p className="page-subtitle">ติดตามและตรวจสอบสถานะการแจ้งซ่อมของห้อง {user.room_number}</p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/maintenance')}
                >
                    + แจ้งซ่อมใหม่
                </button>
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
                    🟡 รอรับเรื่อง ({requests.filter(r => r.status === 'pending').length})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('in_progress')}
                >
                    🔵 กำลังดำเนินการ ({requests.filter(r => r.status === 'in_progress').length})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('completed')}
                >
                    🟢 ซ่อมเสร็จ ({requests.filter(r => r.status === 'completed').length})
                </button>
                <button
                    className={`filter-tab ${filteredStatus === 'closed' ? 'active' : ''}`}
                    onClick={() => setFilteredStatus('closed')}
                >
                    ⚫ ปิดงาน ({requests.filter(r => r.status === 'closed').length})
                </button>
            </div>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            {displayedRequests.length === 0 && !message && (
                <div className="df-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        ไม่พบรายการแจ้งซ่อม
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {filteredStatus === 'all' ? 'คุณยังไม่มีประวัติการแจ้งซ่อมในระบบ' : 'ไม่มีรายการในสถานะนี้'}
                    </p>
                    {filteredStatus === 'all' && (
                        <button className="btn btn-primary" onClick={() => navigate('/maintenance')}>
                            แจ้งซ่อมตอนนี้
                        </button>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayedRequests.map((request) => (
                    <div key={request.request_id} className="df-card" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        #{request.request_id}
                                    </span>
                                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                                        {request.title}
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <span>{getCategoryIcon(request.category)} {getCategoryText(request.category)}</span>
                                    <span>•</span>
                                    <span>ห้อง {request.room_number}</span>
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
                                แจ้งเมื่อ: {formatDate(request.created_at)}
                            </div>

                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => navigate(`/requests/${request.request_id}`)}
                            >
                                ดูรายละเอียดและสถานะ →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Requests