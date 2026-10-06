import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBadge, { getStatusText, getCategoryText, getCategoryIcon, getPriorityText, formatDate } from '../components/StatusBadge'

function AdminRequestDetail() {
    const { request_id } = useParams()

    const [user, setUser] = useState(null)
    const [request, setRequest] = useState(null)
    const [history, setHistory] = useState([])

    const [status, setStatus] = useState('')
    const [note, setNote] = useState('')

    const [message, setMessage] = useState('กำลังโหลดข้อมูล...')
    const [saving, setSaving] = useState(false)

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
        loadRequest()
        loadHistory()
    }, [navigate, request_id])

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
            setStatus(data.request.status)
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

    async function handleUpdateStatus(event) {
        event.preventDefault()

        if (!status) {
            setMessage('กรุณาเลือกสถานะ')
            return
        }

        setSaving(true)
        setMessage('กำลังบันทึก...')

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/requests/${request_id}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        admin_id: user.user_id,
                        status,
                        note
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'ไม่สามารถอัปเดตสถานะได้')
                return
            }

            setMessage('อัปเดตสถานะและบันทึกประวัติสำเร็จเรียบร้อย')
            setNote('')

            await loadRequest()
            await loadHistory()
        } catch (error) {
            console.error('Update request status error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
        } finally {
            setSaving(false)
        }
    }

    if (!user || !request) {
        return (
            <div className="df-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{message}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/requests')}>
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
                            onClick={() => navigate('/admin/requests')}
                            style={{ marginRight: '6px' }}
                        >
                            ← ย้อนกลับ
                        </button>
                        <h1 className="page-title" style={{ margin: 0 }}>
                            จัดการรายการ #{request.request_id}
                        </h1>
                    </div>
                    <p className="page-subtitle">อัปเดตสถานะการซ่อมและบันทึกประวัติการดำเนินงาน</p>
                </div>

                <StatusBadge status={request.status} />
            </div>

            {message && (
                <div className={`alert ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-info'}`}>
                    {message}
                </div>
            )}

            {/* Request Details Card */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">รายละเอียดคำขอแจ้งซ่อม</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        แจ้งเมื่อ {formatDate(request.created_at)}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ผู้แจ้งซ่อม</span>
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
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        หัวข้อ: <strong style={{ color: 'var(--text-main)' }}>{request.title}</strong>
                    </span>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginTop: '6px' }}>
                        {request.description}
                    </p>
                </div>

                {/* วัน/เวลาที่ Resident สะดวก */}
                {request.preferred_datetime ? (
                    <div style={{
                        marginTop: '16px',
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
                        border: '1.5px solid #93C5FD',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '22px', lineHeight: 1 }}>📅</span>
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                วัน/เวลาที่ Resident สะดวก
                            </span>
                            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1E40AF', marginTop: '3px' }}>
                                {new Date(request.preferred_datetime).toLocaleString('th-TH', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: 'var(--bg-subtle)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '18px' }}>🕐</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Resident ไม่ได้ระบุวัน/เวลาที่สะดวก — กรุณาติดต่อโดยตรง
                        </span>
                    </div>
                )}
            </div>

            {/* Status Update Form Card */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">อัปเดตสถานะงานซ่อม</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        สถานะปัจจุบัน: <strong style={{ color: 'var(--text-main)' }}>{getStatusText(request.status)}</strong>
                    </span>
                </div>

                <form onSubmit={handleUpdateStatus}>
                    <div className="form-group">
                        <label className="form-label">เลือกสถานะใหม่ *</label>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                        >
                            <option value="pending">🟡 รอรับเรื่อง (ยังไม่เริ่มดำเนินการ)</option>
                            <option value="in_progress">🔵 กำลังดำเนินการ (ช่างกำลังเข้าตรวจสอบหรือซ่อม)</option>
                            <option value="completed">🟢 ซ่อมเสร็จ (ดำเนินการแก้ไขเรียบร้อยแล้ว)</option>
                            <option value="closed">⚫ ปิดงาน (ส่งมอบงานและตรวจสอบแล้ว)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">หมายเหตุการดำเนินงาน / ข้อความถึงผู้พัก</label>
                        <textarea
                            className="form-textarea"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="เช่น ช่างได้เปลี่ยนวาล์วน้ำใหม่ให้เรียบร้อยแล้ว, อยู่ระหว่างรออะไหล่..."
                            rows="4"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/admin/requests')}
                        >
                            กลับรายการแจ้งซ่อม
                        </button>
                    </div>
                </form>
            </div>

            {/* History Timeline */}
            <div className="df-card">
                <div className="df-card-header">
                    <h2 className="df-card-title">ประวัติการดำเนินงานทั้งหมด</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {history.length} รายการบันทึก
                    </span>
                </div>

                <div className="timeline">
                    {/* Initial Step */}
                    <div className="timeline-item">
                        <div className="timeline-line"></div>
                        <div className="timeline-point pending"></div>
                        <div className="timeline-content">
                            <div className="timeline-title">
                                <span>ผู้พักอาศัยแจ้งซ่อมเข้าระบบ</span>
                                <span className="timeline-date">{formatDate(request.created_at)}</span>
                            </div>
                            <div className="timeline-desc">
                                ผู้พัก: {request.full_name} (ห้อง {request.room_number})
                            </div>
                        </div>
                    </div>

                    {history.map((item) => (
                        <div key={item.history_id} className="timeline-item">
                            <div className="timeline-line"></div>
                            <div className={`timeline-point ${item.new_status || 'in_progress'}`}></div>
                            <div className="timeline-content">
                                <div className="timeline-title">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <StatusBadge status={item.new_status} />
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            ผู้บันทึก: {item.admin_name || 'Admin'}
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

export default AdminRequestDetail