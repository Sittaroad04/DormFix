import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBadge, { getStatusText, getCategoryText, getCategoryIcon, getPriorityText, formatDate } from '../components/StatusBadge'

function RequestDetail() {
    const { request_id } = useParams()

    const [request, setRequest] = useState(null)
    const [history, setHistory] = useState([])
    const [message, setMessage] = useState('กำลังโหลดข้อมูล...')

    const navigate = useNavigate()

    useEffect(() => {
        loadRequest()
        loadHistory()
    }, [request_id])

    async function loadRequest() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/requests/${request_id}`
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'ไม่พบรายการแจ้งซ่อม')
                return
            }

            setRequest(data.request)
            setMessage('')
        } catch (error) {
            console.error('Get request detail error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
        }
    }

    async function loadHistory() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/requests/${request_id}/history`
            )

            const data = await response.json()

            if (!response.ok) {
                return
            }

            setHistory(data.history || [])
        } catch (error) {
            console.error('Get request history error:', error)
        }
    }

    if (!request) {
        return (
            <div className="df-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{message}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/requests')}>
                    ← กลับรายการแจ้งซ่อม
                </button>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/requests')}
                            style={{ marginRight: '6px' }}
                        >
                            ← ย้อนกลับ
                        </button>
                        <h1 className="page-title" style={{ margin: 0 }}>
                            #{request.request_id} {request.title}
                        </h1>
                    </div>
                    <p className="page-subtitle">รายละเอียดรายการและการติดตามผล</p>
                </div>

                <StatusBadge status={request.status} />
            </div>

            {/* Request Detail Card */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">ข้อมูลการแจ้งซ่อม</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        แจ้งเมื่อ {formatDate(request.created_at)}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ผู้แจ้ง</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{request.full_name}</p>
                    </div>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ห้องพัก</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>ห้อง {request.room_number}</p>
                    </div>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ประเภทปัญหา</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                            {getCategoryIcon(request.category)} {getCategoryText(request.category)}
                        </p>
                    </div>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ระดับความสำคัญ</span>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                            {getPriorityText(request.priority)}
                        </p>
                    </div>
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        รายละเอียดปัญหาที่พบ
                    </span>
                    <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {request.description}
                    </p>
                </div>
            </div>

            {/* Timeline Card */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">ประวัติการดำเนินงาน (Timeline)</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {history.length + 1} ขั้นตอน
                    </span>
                </div>

                <div className="timeline">
                    {/* First Step: Created */}
                    <div className="timeline-item">
                        <div className="timeline-line"></div>
                        <div className="timeline-point pending"></div>
                        <div className="timeline-content">
                            <div className="timeline-title">
                                <span>ได้รับเรื่องการแจ้งซ่อม</span>
                                <span className="timeline-date">{formatDate(request.created_at)}</span>
                            </div>
                            <div className="timeline-desc">
                                ผู้พักห้อง {request.room_number} ({request.full_name}) ส่งคำขอแจ้งซ่อมเข้าสู่ระบบ
                            </div>
                        </div>
                    </div>

                    {/* Subsequent History Steps */}
                    {history.map((item) => (
                        <div key={item.history_id} className="timeline-item">
                            <div className="timeline-line"></div>
                            <div className={`timeline-point ${item.new_status || 'in_progress'}`}></div>
                            <div className="timeline-content">
                                <div className="timeline-title">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <StatusBadge status={item.new_status} />
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            โดย {item.admin_name || 'ผู้ดูแลระบบ'}
                                        </span>
                                    </span>
                                    <span className="timeline-date">{formatDate(item.created_at)}</span>
                                </div>
                                {item.note && (
                                    <div className="timeline-desc" style={{ color: 'var(--text-main)', marginTop: '6px' }}>
                                        <strong>หมายเหตุ:</strong> {item.note}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RequestDetail