import 'dotenv/config'
import test from 'node:test'
import assert from 'node:assert'
import app from '../app.js'
import { getSqlPool } from '../db.js'

let server
let baseUrl
let testRequestIds = []

test.before(async () => {
    server = app.listen(0)

    const address = server.address()
    baseUrl = `http://127.0.0.1:${address.port}`
})

test.after(async () => {
    const pool = await getSqlPool()

    for (const requestId of testRequestIds) {
        await pool
            .request()
            .input('request_id', requestId)
            .query(`
                DELETE FROM repair_history
                WHERE request_id = @request_id
            `)

        await pool
            .request()
            .input('request_id', requestId)
            .query(`
                DELETE FROM maintenance_requests
                WHERE request_id = @request_id
            `)
    }

    server.close()
})

test('GET /api/requests should return maintenance requests', async () => {
    const response = await fetch(`${baseUrl}/api/requests`)
    const data = await response.json()

    assert.strictEqual(response.status, 200)
    assert.strictEqual(data.success, true)
    assert.ok(Array.isArray(data.requests))

    if (data.requests.length > 0) {
        const request = data.requests[0]

        assert.ok(request.request_id)
        assert.ok(request.user_id)
        assert.ok(request.full_name)
        assert.ok(request.room_number)
        assert.ok(request.category)
        assert.ok(request.title)
        assert.ok(request.description)
        assert.ok(request.status)
    }
})
test('GET / should return 200', async () => {
    const response = await fetch(`${baseUrl}/`)

    assert.strictEqual(response.status, 200)
})

test('GET / should return DormFix API message', async () => {
    const response = await fetch(`${baseUrl}/`)
    const data = await response.json()

    assert.strictEqual(data.message, 'DormFix API is running')
})

test('GET /api/health should return 200', async () => {
    const response = await fetch(`${baseUrl}/api/health`)

    assert.strictEqual(response.status, 200)
})

test('GET /api/health should return success true', async () => {
    const response = await fetch(`${baseUrl}/api/health`)
    const data = await response.json()

    assert.strictEqual(data.success, true)
})

test('GET /unknown should return 404', async () => {
    const response = await fetch(`${baseUrl}/unknown`)

    assert.strictEqual(response.status, 404)
})

test('POST /api/requests should return 400 when required fields are missing', async () => {
    const response = await fetch(`${baseUrl}/api/requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 1,
            room_number: 'A101',
            category: 'ไฟฟ้า'
        })
    })

    const data = await response.json()

    assert.strictEqual(response.status, 400)
    assert.strictEqual(data.success, false)
    assert.strictEqual(
        data.message,
        'user_id, room_number, category, title and description are required'
    )
})

test('POST /api/users should return 400 when required fields are missing', async () => {
    const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'test-invalid@test.com',
            password: '12345678'
        })
    })

    const data = await response.json()

    assert.strictEqual(response.status, 400)
    assert.strictEqual(data.success, false)
    assert.strictEqual(
        data.message,
        'full_name, email and password are required'
    )
})

test('POST /api/users should return 409 when email already exists', async () => {
    const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            full_name: 'Test Resident',
            email: 'resident@test.com',
            password: '12345678',
            room_number: 'A101',
            role: 'resident'
        })
    })

    const data = await response.json()

    assert.strictEqual(response.status, 409)
    assert.strictEqual(data.success, false)
    assert.strictEqual(data.message, 'Email already exists')
})

test('POST /api/requests should return 404 when user does not exist', async () => {
    const response = await fetch(`${baseUrl}/api/requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 999999,
            room_number: 'A101',
            category: 'ไฟฟ้า',
            title: 'ทดสอบผู้ใช้ไม่มีอยู่จริง',
            description: 'ทดสอบการตรวจสอบ user_id'
        })
    })

    const data = await response.json()

    assert.strictEqual(response.status, 404)
    assert.strictEqual(data.success, false)
    assert.strictEqual(data.message, 'User not found')
})

test('POST /api/requests should create a maintenance request successfully', async () => {
    const response = await fetch(`${baseUrl}/api/requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 1,
            room_number: 'A101',
            category: 'ไฟฟ้า',
            title: 'ทดสอบแจ้งซ่อม',
            description: 'ทดสอบการสร้างรายการแจ้งซ่อมจาก Automated Test',
            priority: 'medium'
        })
    })

    const data = await response.json()

    assert.strictEqual(response.status, 201)
    assert.strictEqual(data.success, true)
    assert.strictEqual(
        data.message,
        'Maintenance request created successfully'
    )

    assert.ok(data.request)
    assert.strictEqual(data.request.user_id, 1)
    assert.strictEqual(data.request.room_number, 'A101')
    assert.strictEqual(data.request.category, 'ไฟฟ้า')
    assert.strictEqual(data.request.title, 'ทดสอบแจ้งซ่อม')
    assert.strictEqual(data.request.priority, 'medium')
    assert.strictEqual(data.request.status, 'pending')

    testRequestIds.push(data.request.request_id)
})

test('PATCH /api/requests/:request_id/status should return 400 when required fields are missing', async () => {
    const response = await fetch(
        `${baseUrl}/api/requests/6/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: 2
            })
        }
    )

    const data = await response.json()

    assert.strictEqual(response.status, 400)
    assert.strictEqual(data.success, false)
})

test('PATCH /api/requests/:request_id/status should return 400 for invalid status', async () => {
    const response = await fetch(
        `${baseUrl}/api/requests/6/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: 2,
                status: 'invalid_status',
                note: 'Test invalid status'
            })
        }
    )

    const data = await response.json()

    assert.strictEqual(response.status, 400)
    assert.strictEqual(data.success, false)
    assert.strictEqual(data.message, 'Invalid status')
})

test('PATCH /api/requests/:request_id/status should return 404 when request is not found', async () => {
    const response = await fetch(
        `${baseUrl}/api/requests/999999/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: 2,
                status: 'in_progress',
                note: 'Test request not found'
            })
        }
    )

    const data = await response.json()

    assert.strictEqual(response.status, 404)
    assert.strictEqual(data.success, false)
    assert.strictEqual(
        data.message,
        'Maintenance request not found'
    )
})

test('PATCH /api/requests/:request_id/status should return 404 when admin is not found', async () => {
    const response = await fetch(
        `${baseUrl}/api/requests/6/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: 999999,
                status: 'completed',
                note: 'Test admin not found'
            })
        }
    )

    const data = await response.json()

    assert.strictEqual(response.status, 404)
    assert.strictEqual(data.success, false)
    assert.strictEqual(data.message, 'Admin not found')
})

test('PATCH /api/requests/:request_id/status should return 403 when user is not an admin', async () => {
    const response = await fetch(
        `${baseUrl}/api/requests/6/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: 1,
                status: 'completed',
                note: 'Test resident cannot update status'
            })
        }
    )

    const data = await response.json()

    assert.strictEqual(response.status, 403)
    assert.strictEqual(data.success, false)
    assert.strictEqual(
        data.message,
        'User is not an admin'
    )
})

test('PATCH /api/requests/:request_id/status should update status successfully', async () => {
    // Create a new maintenance request
    const createResponse = await fetch(
        `${baseUrl}/api/requests`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 1,
                room_number: 'A101',
                category: 'ไฟฟ้า',
                title: 'ทดสอบเปลี่ยนสถานะ',
                description: 'ทดสอบ PATCH status จาก Automated Test',
                priority: 'medium'
            })
        }
    )

    const createData = await createResponse.json()

    assert.strictEqual(createResponse.status, 201)
    assert.strictEqual(createData.success, true)

    const requestId = createData.request.request_id
    testRequestIds.push(requestId)

    // Update status: pending -> in_progress
    const response = await fetch(
        `${baseUrl}/api/requests/${requestId}/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: 2,
                status: 'in_progress',
                note: 'รับเรื่องและกำลังดำเนินการตรวจสอบ'
            })
        }
    )

    const data = await response.json()

    assert.strictEqual(response.status, 200)
    assert.strictEqual(data.success, true)
    assert.strictEqual(
        data.message,
        'Maintenance request status updated successfully'
    )

    assert.ok(data.history)
    assert.strictEqual(data.history.request_id, requestId)
    assert.strictEqual(data.history.admin_id, 2)
    assert.strictEqual(data.history.old_status, 'pending')
    assert.strictEqual(data.history.new_status, 'in_progress')
})

test('GET /api/requests/:request_id/history should return repair history', async () => {
    const response = await fetch(
        `${baseUrl}/api/requests/6/history`
    )

    const data = await response.json()

    assert.strictEqual(response.status, 200)
    assert.strictEqual(data.success, true)
    assert.ok(Array.isArray(data.history))

    if (data.history.length > 0) {
        assert.strictEqual(data.history[0].request_id, 6)
        assert.ok(data.history[0].admin_id)
        assert.ok(data.history[0].admin_name)
        assert.ok(data.history[0].new_status)
    }
})

