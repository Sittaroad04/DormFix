import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge, { getStatusText, getCategoryText, getCategoryIcon, formatDate } from '../components/StatusBadge'

function History() {
    const [user, setUser] = useState(null)
    const [requests, setRequests] = useState([])
    const [histories, setHistories] = useState({})
    const [message, setMessage] = useState('กำลังโหลดประวัติการแจ้งซ่อม...')

    const navigate = useNavigate()

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (!savedUser) {
            navigate('/login')
            return
        }

        const loggedInUser = JSON.parse(savedUser)
        setUser(loggedInUser)
        loadHistory(loggedInUser.user_id)
    }, [navigate])

    async function loadHistory(userId) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/requests/user/${userId}`
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'ไม่สามารถโหลดประวัติการแจ้งซ่อมได้')
                return
            }

            const userRequests = data.requests || []
            setRequests(userRequests)

            // Load histories for each request
            const historyData = {}
            for (const request of userRequests) {
                try {
                    const historyResponse = await fetch(
                        `${import.meta.env.VITE_API_URL}/requests/${request.request_id}/history`
                    )
                    const historyResult = await historyResponse.json()
                    if (historyResponse.ok) {
                        historyData[request.request_id] = historyResult.history || []
                    } else {
                        historyData[request.request_id] = []
                    }
                } catch (error) {
                    console.error(`Load history ${request.request_id} error:`, error)
                    historyData[request.request_id] = []
                }
            }

            setHistories(historyData)
            setMessage('')
        } catch (error) {
            console.error('Get history error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
        }
    }

    function getHistoryStepIcon(status) {
        switch (status) {
            case 'pending':
                return '📝'
            case 'in_progress':
                return '🔧'
            case 'completed':
                return '✅'
            case 'closed':
                return '📦'
            default:
                return '⚡'
        }
    }

    if (!user) {
        return (
            <div className="df-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)' }}>กำลังตรวจสอบข้อมูลผู้ใช้งาน...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">ประวัติการแจ้งซ่อม</h1>
                    <p className="page-subtitle">Timeline การดำเนินงานของช่างในแต่ละรายการ (ห้อง {user.room_number})</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/requests')}
                    >
                        ดูรายการทั้งหมด
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/maintenance')}
                    >
                        + แจ้งซ่อมใหม่
                    </button>
                </div>
            </div>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            {requests.length === 0 && !message && (
                <div className="df-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🕐</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        ยังไม่มีประวัติการแจ้งซ่อม
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        เมื่อคุณส่งคำขอแจ้งซ่อมและช่างเริ่มดำเนินงาน ประวัติจะแสดงที่นี่
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/maintenance')}>
                        แจ้งซ่อมรายการแรก
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {requests.map((request) => {
                    const reqHistory = histories[request.request_id] || []

                    return (
                        <div key={request.request_id} className="df-card">
                            {/* Card Header matching requested mockup */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            #{request.request_id}
                                        </span>
                                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                                            {request.title}
                                        </h2>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <span>ห้อง {request.room_number}</span>
                                        <span>•</span>
                                        <span>{getCategoryIcon(request.category)} {getCategoryText(request.category)}</span>
                                        <span>•</span>
                                        <span>แจ้งเมื่อ {formatDate(request.created_at)}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>สถานะ:</span>
                                    <StatusBadge status={request.status} />
                                </div>
                            </div>

                            {/* Timeline section */}
                            <div style={{ padding: '8px 0 16px' }}>
                                <div className="timeline">
                                    {/* Initial Step: 📝 แจ้งซ่อม */}
                                    <div className="timeline-item">
                                        <div className="timeline-line"></div>
                                        <div className="timeline-point pending"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-title">
                                                <span>📝 แจ้งซ่อม</span>
                                                <span className="timeline-date">{formatDate(request.created_at)}</span>
                                            </div>
                                            <div className="timeline-desc">
                                                ผู้พักอาศัยแจ้งปัญหา: {request.description || request.title}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subsequent History steps from admin */}
                                    {reqHistory.map((item) => (
                                        <div key={item.history_id} className="timeline-item">
                                            <div className="timeline-line"></div>
                                            <div className={`timeline-point ${item.new_status || 'in_progress'}`}></div>
                                            <div className="timeline-content">
                                                <div className="timeline-title">
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span>{getHistoryStepIcon(item.new_status)}</span>
                                                        <span>{getStatusText(item.new_status)}</span>
                                                    </span>
                                                    <span className="timeline-date">{formatDate(item.created_at)}</span>
                                                </div>

                                                {item.note ? (
                                                    <div className="timeline-desc" style={{ color: 'var(--text-main)', marginTop: '4px' }}>
                                                        {item.note}
                                                    </div>
                                                ) : (
                                                    <div className="timeline-desc" style={{ fontStyle: 'italic', color: 'var(--text-subtle)' }}>
                                                        อัปเดตสถานะโดย {item.admin_name || 'เจ้าหน้าที่'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer link to detail */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => navigate(`/requests/${request.request_id}`)}
                                >
                                    ดูรายละเอียดรายการแบบเต็ม →
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default History