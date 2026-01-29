// ===== Task Board - App Logic =====

class TaskBoard {
    constructor() {
        this.tasks = [];
        this.errors = [];
        this.currentTaskId = null;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.bindEvents();
        this.render();
        this.initDragAndDrop();
    }
    
    // ===== Storage =====
    loadData() {
        const savedTasks = localStorage.getItem('taskboard_tasks');
        const savedErrors = localStorage.getItem('taskboard_errors');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        } else {
            // Initial Data Population
            this.tasks = [
                {
                    id: 'task_init_1',
                    title: 'Configurar Clawdbot como Serviço',
                    description: 'Configurar systemd para rodar o gateway em background e habilitar linger.',
                    status: 'done',
                    priority: 'high',
                    category: 'dev',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando configuração do systemd', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Concluído: Serviço ativo e rodando', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_init_2',
                    title: 'Criar Story Lab',
                    description: 'Desenvolver painel web para gestão de roteiros de Shorts/Reels com integração GitHub.',
                    status: 'done',
                    priority: 'high',
                    category: 'stories',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando criação dos arquivos do projeto', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Concluído: Deploy no GitHub Pages realizado', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_init_3',
                    title: 'Criar Task Board',
                    description: 'Desenvolver painel Kanban para gestão de tarefas com log de execução e painel de erros.',
                    status: 'done',
                    priority: 'high',
                    category: 'dev',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando desenvolvimento do Kanban', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Concluído: Deploy no GitHub Pages realizado', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_saas_methodology',
                    title: 'Implementar Metodologia SaaS Hunter',
                    description: 'Salvar metodologia de pesquisa e atualizar o painel SaaS Hunter para suportar campos detalhados (MRR, Stack, Análise).',
                    status: 'done',
                    priority: 'high',
                    category: 'dev',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando documentação da metodologia', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Concluído: Metodologia salva em METHODOLOGY.md e painel atualizado com novos campos.', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_saas_hunter',
                    title: 'Implementar Metodologia SaaS Hunter',
                    description: 'Salvar metodologia de pesquisa e atualizar o painel SaaS Hunter para suportar campos detalhados (MRR, Stack, Análise).',
                    status: 'progress',
                    priority: 'high',
                    category: 'dev',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando documentação da metodologia', status: 'start', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_saas_hunter',
                    title: 'Criar Painel SaaS Hunter',
                    description: 'Radar de ferramentas SaaS. Painel web para listar e cadastrar ferramentas manualmente (preparado para automação futura).',
                    status: 'done',
                    priority: 'high',
                    category: 'dev',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando desenvolvimento do SaaS Hunter', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Concluído: Painel publicado em https://phescobbar.github.io/saas-hunter/', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_daily_routine',
                    title: 'Configurar Rotina Diária de Roteiros',
                    description: 'Agendar envio de 5 plots diários (20h) e preparar integração para salvar roteiros escolhidos direto no JSON do Story Lab.',
                    status: 'progress',
                    priority: 'high',
                    category: 'stories',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Cron job story-plots-daily criado (20h)', status: 'success', timestamp: new Date().toISOString() },
                        { text: 'Story Lab atualizado para ler stories.json', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_analyze_helena',
                    title: 'Analisar Padrões: Helena & Renato',
                    description: 'Decompor a história viral para identificar gatilhos de engajamento e estrutura narrativa.',
                    status: 'done',
                    priority: 'high',
                    category: 'stories',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando análise do roteiro viral', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Padrões identificados: Gancho matemático, Vilão complexo, Dilema final', status: 'success', timestamp: new Date().toISOString() },
                        { text: 'Relatório salvo em projects/story-panel/PATTERNS_HELENA.md', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_story_guide',
                    title: 'Documentar Guia de Storytelling',
                    description: 'Criar guia oficial de estrutura para roteiros (Hook, Foreshadow, But/Therefore) baseado no modelo do Escobar.',
                    status: 'done',
                    priority: 'high',
                    category: 'stories',
                    assignee: 'alphonse',
                    executionLog: [
                        { text: 'Iniciando documentação da estrutura viral', status: 'start', timestamp: new Date().toISOString() },
                        { text: 'Concluído: Guia salvo em projects/story-panel/GUIDE.md', status: 'success', timestamp: new Date().toISOString() }
                    ],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'task_init_4',
                    title: 'Arte da Agenda Semanal',
                    description: 'Criar e postar arte da agenda semanal do bar no Instagram. (Recorrente: Segundas 18h)',
                    status: 'todo',
                    priority: 'urgent',
                    category: 'bar',
                    assignee: 'alphonse',
                    executionLog: [],
                    errors: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveTasks();
        }

        this.errors = savedErrors ? JSON.parse(savedErrors) : [
            {
                id: 'err_git_1',
                taskTitle: 'Sync GitHub',
                message: 'Erro de sintaxe no comando git commit (aspas não escapadas corretamente).',
                timestamp: new Date().toISOString()
            }
        ];
    }
    
    saveTasks() {
        localStorage.setItem('taskboard_tasks', JSON.stringify(this.tasks));
    }
    
    saveErrors() {
        localStorage.setItem('taskboard_errors', JSON.stringify(this.errors));
    }
    
    // ===== Task CRUD =====
    createTask(data) {
        const task = {
            id: this.generateId(),
            title: data.title || 'Nova Tarefa',
            description: data.description || '',
            status: 'backlog',
            priority: data.priority || 'medium',
            category: data.category || 'general',
            assignee: data.assignee || 'alphonse',
            executionLog: [],
            errors: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        return task;
    }
    
    updateTask(id, updates) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks();
            return this.tasks[index];
        }
        return null;
    }
    
    deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.closeModal();
            this.render();
            this.showToast('Tarefa excluída', 'success');
        }
    }
    
    getTask(id) {
        return this.tasks.find(t => t.id === id);
    }
    
    moveTask(taskId, newStatus) {
        const task = this.getTask(taskId);
        if (task) {
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
        }
    }
    
    // ===== Execution Log =====
    addLogEntry(taskId, text, status = 'info') {
        const task = this.getTask(taskId);
        if (task) {
            task.executionLog.push({
                id: this.generateId(),
                text,
                status,
                timestamp: new Date().toISOString()
            });
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
        }
    }
    
    // Método para o Alhonse usar antes de executar
    logTaskStart(taskId, action) {
        this.addLogEntry(taskId, `Iniciando: ${action}`, 'start');
        this.moveTask(taskId, 'progress');
    }
    
    // Método para o Alhonse usar após executar com sucesso
    logTaskSuccess(taskId, result) {
        this.addLogEntry(taskId, `Concluído: ${result}`, 'success');
    }
    
    // Método para o Alhonse usar quando ocorrer erro
    logTaskError(taskId, errorMessage) {
        const task = this.getTask(taskId);
        if (task) {
            // Add to task errors
            task.errors.push({
                id: this.generateId(),
                message: errorMessage,
                timestamp: new Date().toISOString()
            });
            
            // Add to execution log
            this.addLogEntry(taskId, `Erro: ${errorMessage}`, 'error');
            
            // Add to global error panel
            this.addError(task.title, errorMessage);
            
            this.saveTasks();
            this.render();
        }
    }
    
    // ===== Error Management =====
    addError(taskTitle, message) {
        this.errors.unshift({
            id: this.generateId(),
            taskTitle,
            message,
            timestamp: new Date().toISOString()
        });
        this.saveErrors();
        this.renderErrors();
        this.updateErrorCount();
    }
    
    clearErrors() {
        if (confirm('Limpar todos os erros registrados?')) {
            this.errors = [];
            this.saveErrors();
            this.renderErrors();
            this.updateErrorCount();
        }
    }
    
    // ===== Event Binding =====
    bindEvents() {
        // New Task
        document.getElementById('newTaskBtn').addEventListener('click', () => {
            this.openModal();
        });
        
        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelTask').addEventListener('click', () => this.closeModal());
        document.getElementById('saveTask').addEventListener('click', () => this.saveCurrentTask());
        document.getElementById('deleteTask').addEventListener('click', () => {
            if (this.currentTaskId) this.deleteTask(this.currentTaskId);
        });
        
        // Click outside modal
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') this.closeModal();
        });
        
        // Log entry
        document.getElementById('addLogEntry').addEventListener('click', () => this.addManualLogEntry());
        document.getElementById('newLogEntry').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addManualLogEntry();
        });
        
        // Error panel
        document.getElementById('toggleErrors').addEventListener('click', () => {
            document.getElementById('errorPanel').classList.toggle('open');
        });
        document.getElementById('closeErrors').addEventListener('click', () => {
            document.getElementById('errorPanel').classList.remove('open');
        });
        document.getElementById('clearErrors').addEventListener('click', () => this.clearErrors());
        
        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
    }
    
    // ===== Drag and Drop =====
    initDragAndDrop() {
        this.render(); // Ensures cards exist before binding
    }
    
    bindDragEvents() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.column-body');
        
        cards.forEach(card => {
            card.draggable = true;
            
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });
            
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.background = 'rgba(16, 185, 129, 0.1)';
            });
            
            column.addEventListener('dragleave', () => {
                column.style.background = '';
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.background = '';
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.dataset.status;
                this.moveTask(taskId, newStatus);
            });
        });
    }
    
    // ===== Modal =====
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
            
            // Populate fields
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskAssignee').value = task.assignee;
            
            // Render execution log
            this.renderExecutionLog(task);
            
            // Show errors if any
            if (task.errors.length > 0) {
                errorsGroup.style.display = 'block';
                this.renderTaskErrors(task);
            } else {
                errorsGroup.style.display = 'none';
            }
        } else {
            title.textContent = 'Nova Tarefa';
            deleteBtn.style.display = 'none';
            logGroup.style.display = 'none';
            errorsGroup.style.display = 'none';
            
            // Clear fields
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskCategory').value = 'general';
            document.getElementById('taskAssignee').value = 'alhonse';
        }
        
        modal.classList.add('open');
        document.getElementById('taskTitle').focus();
    }
    
    closeModal() {
        document.getElementById('taskModal').classList.remove('open');
        this.currentTaskId = null;
    }
    
    saveCurrentTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showToast('O título é obrigatório', 'error');
            return;
        }
        
        const data = {
            title,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            assignee: document.getElementById('taskAssignee').value
        };
        
        if (this.currentTaskId) {
            this.updateTask(this.currentTaskId, data);
            this.showToast('Tarefa atualizada!', 'success');
        } else {
            this.createTask(data);
            this.showToast('Tarefa criada!', 'success');
        }
        
        this.closeModal();
        this.render();
    }
    
    addManualLogEntry() {
        const input = document.getElementById('newLogEntry');
        const text = input.value.trim();
        
        if (!text || !this.currentTaskId) return;
        
        this.addLogEntry(this.currentTaskId, text, 'info');
        input.value = '';
        
        const task = this.getTask(this.currentTaskId);
        if (task) this.renderExecutionLog(task);
    }
    
    // ===== Rendering =====
    render() {
        this.renderColumns();
        this.renderErrors();
        this.updateErrorCount();
        this.bindDragEvents();
    }
    
    renderColumns() {
        const statuses = ['backlog', 'todo', 'progress', 'review', 'done'];
        
        statuses.forEach(status => {
            const column = document.querySelector(`.column-body[data-status="${status}"]`);
            const tasks = this.tasks.filter(t => t.status === status);
            const countBadge = document.querySelector(`[data-count="${status}"]`);
            
            if (countBadge) countBadge.textContent = tasks.length;
            
            column.innerHTML = tasks.map(task => this.renderTaskCard(task)).join('');
            
            // Bind click events
            column.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.openModal(card.dataset.id);
                });
            });
        });
    }
    
    renderTaskCard(task) {
        const lastLog = task.executionLog[task.executionLog.length - 1];
        const hasErrors = task.errors.length > 0;
        
        return `
            <div class="task-card" data-id="${task.id}">
                ${hasErrors ? `<span class="task-error-indicator">!</span>` : ''}
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
    
    renderTaskErrors(task) {
        const container = document.getElementById('taskErrorList');
        container.innerHTML = task.errors.map(err => `
            <div class="task-error-item">
                <span>${err.message}</span>
                <span style="color: var(--text-muted); font-size: 0.7rem;">${this.formatTime(err.timestamp)}</span>
            </div>
        `).join('');
    }
    
    renderErrors() {
        const container = document.getElementById('errorList');
        
        if (this.errors.length === 0) {
            container.innerHTML = `
                <div class="empty-errors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p>Nenhum erro registrado</p>
                </div>
            `;
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
        const count = this.errors.length;
        const badge = document.getElementById('errorCount');
        badge.textContent = count;
        badge.dataset.count = count;
    }
    
    // ===== Export/Import =====
    exportData() {
        const data = {
            tasks: this.tasks,
            errors: this.errors,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Dados exportados!', 'success');
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks) {
                    this.tasks = [...data.tasks, ...this.tasks];
                    this.saveTasks();
                }
                if (data.errors) {
                    this.errors = [...data.errors, ...this.errors];
                    this.saveErrors();
                }
                this.render();
                this.showToast('Dados importados!', 'success');
            } catch (err) {
                this.showToast('Erro ao importar arquivo', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }
    
    // ===== Utilities =====
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    truncate(str, len) {
        return str.length > len ? str.substring(0, len) + '...' : str;
    }
    
    getCategoryLabel(category) {
        const labels = {
            general: 'Geral',
            bar: '🍺 Bar',
            stories: '🎬 Stories',
            dev: '💻 Dev',
            personal: '👤 Pessoal'
        };
        return labels[category] || category;
    }
    
    getAssigneeEmoji(assignee) {
        const emojis = {
            alphonse: '🎩',
            escobar: '👤',
            both: '👥'
        };
        return emojis[assignee] || assignee;
    }
    
    getStatusIcon(status) {
        const icons = {
            start: '▶️',
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[status] || '•';
    }
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ===== Global API for Alhonse =====
// These methods can be called programmatically

window.TaskBoardAPI = {
    // Get board instance
    getBoard: () => window.taskBoard,
    
    // Create a task and return its ID
    createTask: (title, description = '', category = 'general', priority = 'medium') => {
        const task = window.taskBoard.createTask({ title, description, category, priority });
        window.taskBoard.render();
        return task.id;
    },
    
    // Log that a task is starting
    startTask: (taskId, action) => {
        window.taskBoard.logTaskStart(taskId, action);
        window.taskBoard.render();
    },
    
    // Log successful completion
    completeTask: (taskId, result) => {
        window.taskBoard.logTaskSuccess(taskId, result);
        window.taskBoard.render();
    },
    
    // Log an error
    logError: (taskId, errorMessage) => {
        window.taskBoard.logTaskError(taskId, errorMessage);
    },
    
    // Move task to a specific status
    moveTask: (taskId, status) => {
        window.taskBoard.moveTask(taskId, status);
    },
    
    // Get all tasks
    getTasks: () => window.taskBoard.tasks,
    
    // Get all errors
    getErrors: () => window.taskBoard.errors
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.taskBoard = new TaskBoard();
});
