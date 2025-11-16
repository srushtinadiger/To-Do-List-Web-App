// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');

// State
let tasks = [];
let currentFilter = 'all';

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Create task object
function createTask(text) {
    return {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
}

// Add new task
function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        taskInput.focus();
        return;
    }

    const task = createTask(text);
    tasks.push(task);
    taskInput.value = '';
    taskInput.focus();
    
    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Clear completed tasks
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Filter tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Render tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = currentFilter === 'all' 
            ? 'No tasks yet. Add one above! 📝' 
            : currentFilter === 'active'
            ? 'No active tasks! 🎉'
            : 'No completed tasks yet.';
        taskList.appendChild(emptyState);
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            `;
            
            taskList.appendChild(li);
        });
    }

    updateTaskCount();
}

// Update task count
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set active filter
function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTasks();
}

// Event Listeners
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

clearCompleted.addEventListener('click', clearCompletedTasks);

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Make functions globally available for inline event handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Initialize app
loadTasks();

