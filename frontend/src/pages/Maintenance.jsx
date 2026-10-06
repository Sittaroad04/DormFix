import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Maintenance() {
    const [user, setUser] = useState(null)

    const [category, setCategory] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('medium')
    const [preferredDate, setPreferredDate] = useState('')
    const [preferredTime, setPreferredTime] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>กรุณาเข้าสู่ระบบก่อนแจ้งซ่อม</p>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                    ไปหน้าเข้าสู่ระบบ
                </button>
            </div>
        )
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setIsSubmitting(true)
        setMessage('กำลังส่งแจ้งซ่อม...')

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/requests`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        room_number: user.room_number,
                        category,
                        title,
                        description,
                        image_url: null,
                        priority,
                        preferred_datetime: preferredDate && preferredTime
                            ? `${preferredDate}T${preferredTime}`
                            : preferredDate
                                ? `${preferredDate}T09:00`
                                : null
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setMessage(data.message || 'ส่งแจ้งซ่อมไม่สำเร็จ')
                setIsSubmitting(false)
                return
            }

            setMessage('ส่งแจ้งซ่อมสำเร็จ')
            console.log('Maintenance request:', data.request)

            setCategory('')
            setTitle('')
            setDescription('')
            setPriority('medium')
            setPreferredDate('')
            setPreferredTime('')
            setIsSubmitting(false)

            setTimeout(() => {
                navigate('/requests')
            }, 1200)

        } catch (error) {
            console.error('Create maintenance request error:', error)
            setMessage('ไม่สามารถเชื่อมต่อ Backend ได้')
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">แจ้งซ่อม</h1>
                    <p className="page-subtitle">ส่งคำร้องแจ้งซ่อมอุปกรณ์ชำรุดในห้องพักของคุณ</p>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/requests')}
                >
                    ดูรายการแจ้งซ่อมของฉัน
                </button>
            </div>

            <div className="df-card" style={{ maxWidth: '720px' }}>
                <div className="df-card-header">
                    <h2 className="df-card-title">แบบฟอร์มแจ้งซ่อม</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        ห้อง {user.room_number} • {user.full_name}
                    </span>
                </div>

                {message && (
                    <div className={`alert ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-info'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">ประเภทปัญหา *</label>
                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">-- กรุณาเลือกประเภทปัญหา --</option>
                            <option value="electric">ไฟฟ้า (หลอดไฟ, ปลั๊ก, สวิตช์)</option>
                            <option value="water">ประปา (ก๊อกน้ำ, ท่อน้ำ, ชักโครก)</option>
                            <option value="air">เครื่องปรับอากาศ (แอร์ไม่เย็น, น้ำรั่ว)</option>
                            <option value="furniture">เฟอร์นิเจอร์ (เตียง, ตู้, ประตู, หน้าต่าง)</option>
                            <option value="other">อื่น ๆ</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">หัวข้อปัญหา *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="เช่น แอร์ไม่เย็น มีน้ำหยดลงมา"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รายละเอียดปัญหา *</label>
                        <textarea
                            className="form-textarea"
                            placeholder="ระบุอาการ ตำแหน่ง หรือช่วงเวลาที่สะดวกให้ช่างเข้าตรวจสอบ..."
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ระดับความสำคัญ</label>
                        <select
                            className="form-select"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">ต่ำ (ไม่เร่งด่วน)</option>
                            <option value="medium">ปานกลาง (ปกติ)</option>
                            <option value="high">สูง (เร่งด่วน)</option>
                            <option value="urgent">ด่วนมาก (ฉุกเฉิน)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            📅 วัน/เวลาที่สะดวกให้ช่างเข้าซ่อม{' '}
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>(ไม่บังคับ)</span>
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 10)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>เวลา</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={preferredTime}
                                    onChange={(e) => setPreferredTime(e.target.value)}
                                />
                            </div>
                        </div>
                        {preferredDate && (
                            <p style={{ fontSize: '12px', color: 'var(--status-progress-text)', marginTop: '6px' }}>
                                ✅ สะดวกวันที่: {new Date(preferredDate + 'T00:00').toLocaleDateString('th-TH', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                                {preferredTime ? ` เวลา ${preferredTime} น.` : ' (ยังไม่ได้ระบุเวลา)'}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งซ่อม'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard')}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Maintenance
