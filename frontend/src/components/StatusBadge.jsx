export function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'รอรับเรื่อง'
        case 'in_progress':
            return 'กำลังดำเนินการ'
        case 'completed':
            return 'ซ่อมเสร็จ'
        case 'closed':
            return 'ปิดงาน'
        default:
            return status || '-'
    }
}

export function getStatusDotIcon(status) {
    switch (status) {
        case 'pending':
            return '🟡'
        case 'in_progress':
            return '🔵'
        case 'completed':
            return '🟢'
        case 'closed':
            return '⚫'
        default:
            return '⚪'
    }
}

export function getCategoryText(category) {
    switch (category) {
        case 'electric':
            return 'ไฟฟ้า'
        case 'water':
            return 'ประปา'
        case 'air':
            return 'เครื่องปรับอากาศ'
        case 'furniture':
            return 'เฟอร์นิเจอร์'
        case 'other':
            return 'อื่น ๆ'
        default:
            return category || '-'
    }
}

export function getCategoryIcon(category) {
    switch (category) {
        case 'electric':
            return ''
        case 'water':
            return ''
        case 'air':
            return ''
        case 'furniture':
            return ''
        default:
            return ''
    }
}

export function getPriorityText(priority) {
    switch (priority) {
        case 'urgent':
            return 'ด่วนมาก'
        case 'high':
            return 'ด่วน'
        case 'medium':
            return 'ปานกลาง'
        case 'low':
            return 'ไม่ด่วน'
        default:
            return priority || 'ปกติ'
    }
}

export function formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function StatusBadge({ status }) {
    const text = getStatusText(status)
    const normalizedStatus = status || 'pending'

    return (
        <span className={`status-badge ${normalizedStatus}`}>
            <span className="status-dot"></span>
            <span>{text}</span>
        </span>
    )
}
