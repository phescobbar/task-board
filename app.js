// ===== Task Board - App Logic (Turso DB Version) =====

class TaskBoard {
    constructor() {
        this.tasks = [];
        this.errors = [];
        this.crons = []; // New property for crons
        this.currentTaskId = null;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        // Garantir que TursoDB existe
        if (window.TursoDB) {
            await this.loadData();
            await this.loadCrons(); // Load crons on init
        } else {
            const checkDB = setInterval(async () => {
                if (window.TursoDB) {
                    clearInterval(checkDB);
                    await this.loadData();
                    await this.loadCrons();
                }
            }, 100);
        }
        this.initDragAndDrop();
    }
    
    // ===== Storage =====
    async loadData() {
        this.showLoading(true);
        try {
            // Carregar Tarefas
            const taskResult = await TursoDB.query('SELECT * FROM tasks ORDER BY createdAt DESC');
            const taskCols = taskResult.cols.map(c => c.name);
            const loadedTasks = taskResult.rows.map(row => {
                const t = {};
                row.forEach((cell, i) => { t[taskCols[i]] = cell.value; });
                t.executionLog = [];
                t.errors = [];
                return t;
            });

            // Carregar Logs de Execução
            const logResult = await TursoDB.query('SELECT * FROM task_logs ORDER BY timestamp ASC');
            const logCols = logResult.cols.map(c => c.name);
            logResult.rows.forEach(row => {
                const log = {};
                row.forEach((cell, i) => { log[logCols[i]] = cell.value; });
                const task = loadedTasks.find(t => t.id === log.taskId);
                if (task) task.executionLog.push(log);
            });

            // Carregar Erros Globais
            const errorResult = await TursoDB.query('SELECT * FROM errors ORDER BY timestamp DESC');
            const errCols = errorResult.cols.map(c => c.name);
            this.errors = errorResult.rows.map(row => {
                const err = {};
                row.forEach((cell, i) => { err[errCols[i]] = cell.value; });
                return err;
            });

            this.tasks = loadedTasks;
            this.render();
        } catch (e) {
            console.error('Erro ao carregar do Turso:', e);
            const savedTasks = localStorage.getItem('taskboard_tasks');
            if (savedTasks) this.tasks = JSON.parse(savedTasks);
            this.render();
        } finally {
            this.showLoading(false);
        }
    }

    // Load crons from the static file injected by Alphonse
    async loadCrons() {
        try {
            const response = await fetch('crons.json');
            if (response.ok) {
                this.crons = await response.json();
                this.renderCrons();
            }
        } catch (e) {
            console.warn('Erro ao carregar crons.json:', e);
        }
    }
    
    async saveTaskToDB(data) {
        this.showLoading(true);
        try {
            const id = data.id || this.generateId();
            const now = new Date().toISOString();
            
            await TursoDB.command(
                'INSERT INTO tasks (id, title, description, status, priority, category, assignee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, data.title, data.description, data.status || 'backlog', data.priority, data.category, data.assignee, data.createdAt || now, now]
            );
            await this.loadData();
        } catch (e) { console.error('Erro ao salvar tarefa:', e); }
        finally { this.showLoading(false); }
    }

    async updateTaskInDB(id, updates) {
        const task = this.getTask(id);
        if (!task) return;
        const merged = { ...task, ...updates, updatedAt: new Date().toISOString() };
        
        try {
            await TursoDB.command(
                'UPDATE tasks SET title=?, description=?, status=?, priority=?, category=?, assignee=?, updatedAt=? WHERE id=?',
                [merged.title, merged.description, merged.status, merged.priority, merged.category, merged.assignee, merged.updatedAt, id]
            );
            // Update local state for UI feel
            const idx = this.tasks.findIndex(t => t.id === id);
            if (idx !== -1) this.tasks[idx] = merged;
        } catch (e) { console.error('Erro ao atualizar tarefa:', e); }
    }

    async deleteTaskFromDB(id) {
        if (!confirm('Tem certeza?')) return;
        this.showLoading(true);
        try {
            await TursoDB.command('DELETE FROM tasks WHERE id = ?', [id]);
            await this.loadData();
            this.closeModal();
        } catch (e) { console.error('Erro ao deletar:', e); }
        finally { this.showLoading(false); }
    }

    // ===== Execution Log =====
    async addLogEntry(taskId, text, status = 'info') {
        const timestamp = new Date().toISOString();
        try {
            await TursoDB.command(
                'INSERT INTO task_logs (taskId, text, status, timestamp) VALUES (?, ?, ?, ?)',
                [taskId, text, status, timestamp]
            );
            const task = this.getTask(taskId);
            if (task) task.executionLog.push({ taskId, text, status, timestamp });
            this.render();
        } catch (e) { console.error('Erro ao logar:', e); }
    }
    
    logTaskStart(taskId, action) {
        this.addLogEntry(taskId, `Iniciando: ${action}`, 'start');
        this.moveTask(taskId, 'progress');
    }
    
    logTaskSuccess(taskId, result) {
        this.addLogEntry(taskId, `Concluído: ${result}`, 'success');
    }
    
    async logTaskError(taskId, errorMessage) {
        const task = this.getTask(taskId);
        const timestamp = new Date().toISOString();
        try {
            await TursoDB.command('INSERT INTO errors (id, taskTitle, message, timestamp) VALUES (?, ?, ?, ?)',
                [this.generateId(), task ? task.title : 'Global', errorMessage, timestamp]);
            await this.addLogEntry(taskId, `Erro: ${errorMessage}`, 'error');
            await this.loadData();
        } catch (e) { console.error('Erro ao registrar erro:', e); }
    }

    async moveTask(taskId, newStatus) {
        const task = this.getTask(taskId);
        if (task) {
            task.status = newStatus;
            await this.updateTaskInDB(taskId, { status: newStatus });
            this.render();
        }
    }

    showLoading(show) {
        const btn = document.getElementById('newTaskBtn');
        if (btn) btn.disabled = show;
    }
    
    // ===== UI and Rendering =====
    bindEvents() {
        document.getElementById('newTaskBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelTask').addEventListener('click', () => this.closeModal());
        document.getElementById('saveTask').addEventListener('click', () => this.saveCurrentTask());
        document.getElementById('deleteTask').addEventListener('click', () => {
            if (this.currentTaskId) this.deleteTaskFromDB(this.currentTaskId);
        });
        document.getElementById('taskModal').addEventListener('click', (e) => { if (e.target.id === 'taskModal') this.closeModal(); });
        document.getElementById('addLogEntry').addEventListener('click', () => this.addManualLogEntry());
        document.getElementById('newLogEntry').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addManualLogEntry(); });
        document.getElementById('toggleErrors').addEventListener('click', () => document.getElementById('errorPanel').classList.toggle('open'));
        document.getElementById('closeErrors').addEventListener('click', () => document.getElementById('errorPanel').classList.remove('open'));
        document.getElementById('clearErrors').addEventListener('click', async () => {
            if (confirm('Limpar erros?')) {
                await TursoDB.command('DELETE FROM errors');
                await this.loadData();
            }
        });
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
    }
    
    initDragAndDrop() { this.render(); }
    
    bindDragEvents() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.column-body');
        cards.forEach(card => {
            card.draggable = true;
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.background = 'rgba(16, 185, 129, 0.1)';
            });
            column.addEventListener('dragleave', () => column.style.background = '');
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.style.background = '';
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.dataset.status;
                if (newStatus !== 'crons') { // Crons are read-only
                    await this.moveTask(taskId, newStatus);
                }
            });
        });
    }
    
    openModal(taskId = null) {
        this.currentTaskId = taskId;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteTask');
        const logGroup = document.getElementById('executionLogGroup');
        const errorsGroup = document.getElementById('taskErrors');
        
        if (taskId) {
            const task = this.getTask(taskId);
            if (!task) return;
            title.textContent = 'Editar Tarefa';
            deleteBtn.style.display = 'block';
            logGroup.style.display = 'block';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskAssignee').value = task.assignee;
            this.renderExecutionLog(task);
        } else {
            title.textContent = 'Nova Tarefa';
            deleteBtn.style.display = 'none';
            logGroup.style.display = 'none';
            errorsGroup.style.display = 'none';
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskCategory').value = 'general';
            document.getElementById('taskAssignee').value = 'alphonse';
        }
        modal.classList.add('open');
    }
    
    closeModal() { document.getElementById('taskModal').classList.remove('open'); this.currentTaskId = null; }
    
    async saveCurrentTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) return;
        const data = {
            title,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            assignee: document.getElementById('taskAssignee').value
        };
        if (this.currentTaskId) {
            await this.updateTaskInDB(this.currentTaskId, data);
        } else {
            await this.saveTaskToDB(data);
        }
        this.closeModal();
        this.render();
    }
    
    async addManualLogEntry() {
        const input = document.getElementById('newLogEntry');
        const text = input.value.trim();
        if (!text || !this.currentTaskId) return;
        await this.addLogEntry(this.currentTaskId, text, 'info');
        input.value = '';
        this.renderExecutionLog(this.getTask(this.currentTaskId));
    }
    
    render() {
        this.renderColumns();
        this.renderErrors();
        this.updateErrorCount();
        this.renderCrons();
        this.bindDragEvents();
    }
    
    renderColumns() {
        const statuses = ['backlog', 'todo', 'progress', 'review', 'done'];
        statuses.forEach(status => {
            const column = document.querySelector(`.column-body[data-status="${status}"]`);
            if (!column) return;
            const tasks = this.tasks.filter(t => t.status === status);
            const countBadge = document.querySelector(`[data-count="${status}"]`);
            if (countBadge) countBadge.textContent = tasks.length;
            column.innerHTML = tasks.map(task => this.renderTaskCard(task)).join('');
            column.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', () => this.openModal(card.dataset.id));
            });
        });
    }

    renderCrons() {
        const column = document.querySelector('.column-body[data-status="crons"]');
        const countBadge = document.querySelector('[data-count="crons"]');
        if (!column) return;
        
        if (countBadge) countBadge.textContent = this.crons.length;
        
        column.innerHTML = this.crons.map(cron => `
            <div class="task-card cron-card">
                <div class="task-card-header">
                    <span class="task-title" style="color: var(--accent-primary)">⏰ ${cron.name}</span>
                    <span class="task-priority high"></span>
                </div>
                <p class="task-description">${cron.schedule}</p>
                <div class="task-meta">
                    <span class="task-category">Sistema</span>
                    <span class="task-assignee">⚙️</span>
                </div>
                <div class="task-log-preview">
                    <div class="log-status success">
                        ➡️ Próximo: ${cron.nextRun}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderTaskCard(task) {
        const lastLog = task.executionLog[task.executionLog.length - 1];
        return `
            <div class="task-card" data-id="${task.id}">
                <div class="task-card-header">
                    <span class="task-title">${task.title}</span>
                    <span class="task-priority ${task.priority}"></span>
                </div>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-meta">
                    <span class="task-category">${this.getCategoryLabel(task.category)}</span>
                    <span class="task-assignee">${this.getAssigneeEmoji(task.assignee)}</span>
                </div>
                ${lastLog ? `
                    <div class="task-log-preview">
                        <div class="log-status ${lastLog.status}">
                            ${this.getStatusIcon(lastLog.status)} ${this.truncate(lastLog.text, 40)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderExecutionLog(task) {
        const container = document.getElementById('executionEntries');
        if (!container) return;
        if (task.executionLog.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem;">Nenhuma entrada no log</p>';
            return;
        }
        container.innerHTML = task.executionLog.map(entry => `
            <div class="log-entry">
                <span class="log-time">${this.formatTime(entry.timestamp)}</span>
                <span class="log-status-badge ${entry.status}">${entry.status}</span>
                <span class="log-text">${entry.text}</span>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }
    
    renderErrors() {
        const container = document.getElementById('errorList');
        if (!container) return;
        if (this.errors.length === 0) {
            container.innerHTML = `<div class="empty-errors"><p>Nenhum erro registrado</p></div>`;
            return;
        }
        container.innerHTML = this.errors.map(err => `
            <div class="error-item">
                <div class="error-item-header">
                    <span class="error-task-title">${err.taskTitle}</span>
                    <span class="error-timestamp">${this.formatDateTime(err.timestamp)}</span>
                </div>
                <p class="error-message">${err.message}</p>
            </div>
        `).join('');
    }
    
    updateErrorCount() {
        const badge = document.getElementById('errorCount');
        if (badge) badge.textContent = this.errors.length;
    }
    
    exportData() {
        const data = JSON.stringify({ tasks: this.tasks, errors: this.errors }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskboard-backup.json`;
        a.click();
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks) {
                    for (const t of data.tasks) {
                        await this.saveTaskToDB(t);
                        for (const log of (t.executionLog || [])) {
                            await this.addLogEntry(t.id, log.text, log.status);
                        }
                    }
                }
                await this.loadData();
            } catch (err) { console.error('Erro importação:', err); }
        };
        reader.readAsText(file);
    }
    
    generateId() { return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    formatTime(iso) { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    formatDateTime(iso) { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    truncate(str, len) { return str.length > len ? str.substring(0, len) + '...' : str; }
    getCategoryLabel(c) { 
        const labels = { general: 'Geral', bar: '🍺 Bar', stories: '🎬 Stories', dev: '💻 Dev', personal: '👤 Pessoal' };
        return labels[c] || c; 
    }
    getAssigneeEmoji(a) { 
        const emojis = { alphonse: '🎩', escobar: '👤', both: '👥' };
        return emojis[a] || a; 
    }
    getStatusIcon(status) {
        const icons = { start: '▶️', success: '✅', error: '❌', info: 'ℹ️' };
        return icons[status] || '•';
    }
    showToast(msg, type) { console.log(`Toast: ${msg} (${type})`); }
}

window.TaskBoardAPI = {
    createTask: (title, desc, cat, prio) => window.taskBoard.saveTaskToDB({ title, description: desc, category: cat, priority: prio }),
    startTask: (id, action) => window.taskBoard.logTaskStart(id, action),
    completeTask: (id, res) => window.taskBoard.logTaskSuccess(id, res),
    logError: (id, err) => window.taskBoard.logTaskError(id, err),
    moveTask: (id, status) => window.taskBoard.moveTask(id, status)
};

document.addEventListener('DOMContentLoaded', () => { window.taskBoard = new TaskBoard(); });
