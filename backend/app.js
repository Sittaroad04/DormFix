import express from 'express'
import cors from 'cors'
import { getSqlPool } from './db.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'DormFix API is running'
    })
})

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy'
    })
})

app.get('/api/health/db', async (req, res) => {
    try {
        const pool = await getSqlPool()

        const result = await pool
            .request()
            .query('SELECT 1 AS ok')

        res.json({
            success: true,
            message: 'Database connected',
            result: result.recordset
        })
    } catch (error) {
        console.error('Database health check failed:', error)

        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        })
    }
})

app.get('/api/users', async (req, res) => {
    try {
        const pool = await getSqlPool()

        const result = await pool
            .request()
            .query(`
                SELECT
                    user_id,
                    full_name,
                    email,
                    room_number,
                    role,
                    created_at
                FROM users
                ORDER BY user_id
            `)

        res.json({
            success: true,
            users: result.recordset
        })
    } catch (error) {
        console.error('Get users failed:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        })
    }
})

app.post('/api/users', async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            room_number,
            role = 'resident'
        } = req.body

        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'full_name, email and password are required'
            })
        }

        const pool = await getSqlPool()

        const existingUser = await pool
            .request()
            .input('email', email)
            .query(`
                SELECT user_id
                FROM users
                WHERE email = @email
            `)

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            })
        }

        const bcrypt = await import('bcrypt')
        const passwordHash = await bcrypt.default.hash(password, 10)

        const result = await pool
            .request()
            .input('full_name', full_name)
            .input('email', email)
            .input('password_hash', passwordHash)
            .input('room_number', room_number || null)
            .input('role', role)
            .query(`
                INSERT INTO users (
                    full_name,
                    email,
                    password_hash,
                    room_number,
                    role
                )
                OUTPUT
                    INSERTED.user_id,
                    INSERTED.full_name,
                    INSERTED.email,
                    INSERTED.room_number,
                    INSERTED.role,
                    INSERTED.created_at
                VALUES (
                    @full_name,
                    @email,
                    @password_hash,
                    @room_number,
                    @role
                )
            `)

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: result.recordset[0]
        })

    } catch (error) {
        console.error('Create user failed:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'email and password are required'
            })
        }

        const pool = await getSqlPool()

        const result = await pool
            .request()
            .input('email', email)
            .query(`
                SELECT user_id, full_name, email, password_hash, room_number, role
                FROM users
                WHERE email = @email
            `)

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const user = result.recordset[0]

        const bcrypt = await import('bcrypt')
        const passwordMatch = await bcrypt.default.compare(
            password,
            user.password_hash
        )

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                room_number: user.room_number,
                role: user.role
            }
        })

    } catch (error) {
        console.error('Login failed:', error)

        res.status(500).json({
            success: false,
            message: 'Login failed'
        })
    }
})

app.get('/api/requests', async (req, res) => {
    try {
        const pool = await getSqlPool()

        const result = await pool
            .request()
            .query(`
                SELECT
                    r.request_id,
                    r.user_id,
                    u.full_name,
                    r.room_number,
                    r.category,
                    r.title,
                    r.description,
                    r.image_url,
                    r.priority,
                    r.status,
                    r.created_at,
                    r.updated_at
                FROM maintenance_requests r
                INNER JOIN users u
                    ON r.user_id = u.user_id
                ORDER BY r.request_id DESC
            `)

        res.json({
            success: true,
            requests: result.recordset
        })
    } catch (error) {
        console.error('Get requests failed:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to get maintenance requests'
        })
    }
})

app.post('/api/requests', async (req, res) => {
    try {
        const {
            user_id,
            room_number,
            category,
            title,
            description,
            image_url = null,
            priority = 'medium'
        } = req.body

        if (
            !user_id ||
            !room_number ||
            !category ||
            !title ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message: 'user_id, room_number, category, title and description are required'
            })
        }

        const pool = await getSqlPool()

        // ตรวจสอบว่า user มีอยู่จริง
        const userResult = await pool
            .request()
            .input('user_id', user_id)
            .query(`
                SELECT user_id
                FROM users
                WHERE user_id = @user_id
            `)

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const result = await pool
            .request()
            .input('user_id', user_id)
            .input('room_number', room_number)
            .input('category', category)
            .input('title', title)
            .input('description', description)
            .input('image_url', image_url)
            .input('priority', priority)
            .query(`
                INSERT INTO maintenance_requests (
                    user_id,
                    room_number,
                    category,
                    title,
                    description,
                    image_url,
                    priority
                )
                OUTPUT
                    INSERTED.request_id,
                    INSERTED.user_id,
                    INSERTED.room_number,
                    INSERTED.category,
                    INSERTED.title,
                    INSERTED.description,
                    INSERTED.image_url,
                    INSERTED.priority,
                    INSERTED.status,
                    INSERTED.created_at,
                    INSERTED.updated_at
                VALUES (
                    @user_id,
                    @room_number,
                    @category,
                    @title,
                    @description,
                    @image_url,
                    @priority
                )
            `)

        res.status(201).json({
            success: true,
            message: 'Maintenance request created successfully',
            request: result.recordset[0]
        })

    } catch (error) {
        console.error('Create maintenance request failed:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to create maintenance request'
        })
    }
})

app.get('/api/requests/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params

        const pool = await getSqlPool()

        const result = await pool
            .request()
            .input('user_id', user_id)
            .query(`
                SELECT
                    r.request_id,
                    r.user_id,
                    u.full_name,
                    r.room_number,
                    r.category,
                    r.title,
                    r.description,
                    r.image_url,
                    r.priority,
                    r.status,
                    r.created_at,
                    r.updated_at
                FROM maintenance_requests r
                INNER JOIN users u
                    ON r.user_id = u.user_id
                WHERE r.user_id = @user_id
                ORDER BY r.request_id DESC
            `)

        res.json({
            success: true,
            requests: result.recordset
        })

    } catch (error) {
        console.error(
            'Get user maintenance requests failed:',
            error
        )

        res.status(500).json({
            success: false,
            message: 'Failed to get user maintenance requests'
        })
    }
})

app.patch('/api/requests/:request_id/status', async (req, res) => {
    try {
        const { request_id } = req.params
        const {
            admin_id,
            status,
            note = null
        } = req.body

        if (!admin_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'admin_id and status are required'
            })
        }

        const allowedStatuses = [
            'pending',
            'in_progress',
            'completed',
            'closed'
        ]

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
        }

        const pool = await getSqlPool()

        const requestResult = await pool
            .request()
            .input('request_id', request_id)
            .query(`
                SELECT
                    request_id,
                    status
                FROM maintenance_requests
                WHERE request_id = @request_id
            `)

        if (requestResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            })
        }

        const currentRequest = requestResult.recordset[0]
        const oldStatus = currentRequest.status

        const adminResult = await pool
            .request()
            .input('admin_id', admin_id)
            .query(`
                SELECT
                    user_id,
                    role
                FROM users
                WHERE user_id = @admin_id
            `)

        if (adminResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            })
        }

        if (adminResult.recordset[0].role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User is not an admin'
            })
        }

        await pool
            .request()
            .input('request_id', request_id)
            .input('status', status)
            .query(`
                UPDATE maintenance_requests
                SET
                    status = @status,
                    updated_at = GETDATE()
                WHERE request_id = @request_id
            `)

        const historyResult = await pool
            .request()
            .input('request_id', request_id)
            .input('admin_id', admin_id)
            .input('old_status', oldStatus)
            .input('new_status', status)
            .input('note', note)
            .query(`
                INSERT INTO repair_history (
                    request_id,
                    admin_id,
                    old_status,
                    new_status,
                    note
                )
                OUTPUT
                    INSERTED.history_id,
                    INSERTED.request_id,
                    INSERTED.admin_id,
                    INSERTED.old_status,
                    INSERTED.new_status,
                    INSERTED.note,
                    INSERTED.created_at
                VALUES (
                    @request_id,
                    @admin_id,
                    @old_status,
                    @new_status,
                    @note
                )
            `)

        res.json({
            success: true,
            message: 'Maintenance request status updated successfully',
            history: historyResult.recordset[0]
        })

    } catch (error) {
        console.error('Update request status failed:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to update maintenance request status'
        })
    }
})

app.get('/api/requests/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params

        const pool = await getSqlPool()

        const result = await pool
            .request()
            .input('request_id', request_id)
            .query(`
                SELECT
                    r.request_id,
                    r.user_id,
                    u.full_name,
                    r.room_number,
                    r.category,
                    r.title,
                    r.description,
                    r.image_url,
                    r.priority,
                    r.status,
                    r.created_at,
                    r.updated_at
                FROM maintenance_requests r
                INNER JOIN users u
                    ON r.user_id = u.user_id
                WHERE r.request_id = @request_id
            `)

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            })
        }

        res.json({
            success: true,
            request: result.recordset[0]
        })

    } catch (error) {
        console.error(
            'Get maintenance request detail failed:',
            error
        )

        res.status(500).json({
            success: false,
            message: 'Failed to get maintenance request detail'
        })
    }
})

app.get('/api/requests/:request_id/history', async (req, res) => {
    try {
        const { request_id } = req.params

        const pool = await getSqlPool()

        const requestResult = await pool
            .request()
            .input('request_id', request_id)
            .query(`
                SELECT request_id
                FROM maintenance_requests
                WHERE request_id = @request_id
            `)

        if (requestResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance request not found'
            })
        }

        const result = await pool
            .request()
            .input('request_id', request_id)
            .query(`
                SELECT
                    h.history_id,
                    h.request_id,
                    h.admin_id,
                    u.full_name AS admin_name,
                    h.old_status,
                    h.new_status,
                    h.note,
                    h.created_at
                FROM repair_history h
                INNER JOIN users u
                    ON h.admin_id = u.user_id
                WHERE h.request_id = @request_id
                ORDER BY h.created_at ASC
            `)

        res.json({
            success: true,
            history: result.recordset
        })

    } catch (error) {
        console.error('Get repair history failed:', error)

        res.status(500).json({
            success: false,
            message: 'Failed to get repair history'
        })
    }
})

export default app