async function inicializarBanco() {
    try {
        await TursoDB.command(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'backlog',
                priority TEXT DEFAULT 'medium',
                category TEXT DEFAULT 'general',
                assignee TEXT DEFAULT 'alphonse',
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )
        `);
        await TursoDB.command(`
            CREATE TABLE IF NOT EXISTS task_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                taskId TEXT NOT NULL,
                text TEXT NOT NULL,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
            )
        `);
        await TursoDB.command(`
            CREATE TABLE IF NOT EXISTS errors (
                id TEXT PRIMARY KEY,
                taskTitle TEXT,
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        `);
    } catch (e) { console.error('Erro init task-board:', e); }
}
inicializarBanco();
