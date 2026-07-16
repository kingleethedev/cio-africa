// ===== Toast Notification System =====
const Toast = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', title = '', duration = 3000) {
        this.init();
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        const finalTitle = title || titles[type] || 'Info';
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ'}</span>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(finalTitle)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        return toast;
    },
    
    success(message, title) {
        return this.show(message, 'success', title || 'Success');
    },
    
    error(message, title) {
        return this.show(message, 'error', title || 'Error');
    },
    
    warning(message, title) {
        return this.show(message, 'warning', title || 'Warning');
    },
    
    info(message, title) {
        return this.show(message, 'info', title || 'Info');
    },
    
    remove(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('toast-removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    },
    
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ===== API Base URL =====
const API_BASE = '/api';

// ===== State =====
let currentArticles = [];
let currentEvents = [];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    Toast.init();
    loadArticles();
    loadEvents();
    
    document.getElementById('modalForm').addEventListener('submit', handleFormSubmit);
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
});

// ===== Load Functions =====
async function loadArticles(filters) {
    filters = filters || {};
    try {
        showLoading('articlesList');
        const params = new URLSearchParams(filters);
        const response = await fetch(API_BASE + '/articles/?' + params.toString());
        const data = await response.json();
        
        if (data.status === 'success') {
            currentArticles = data.data;
            renderArticles(currentArticles);
            updateAuthorFilter(currentArticles);
            updateStats();
        } else {
            showError('articlesList', 'Failed to load articles');
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        showError('articlesList', 'Error loading articles');
    }
}

async function loadEvents() {
    try {
        showLoading('eventsList');
        const response = await fetch(API_BASE + '/events/');
        const data = await response.json();
        
        if (data.status === 'success') {
            currentEvents = data.data;
            renderEvents(currentEvents);
            updateStats();
        } else {
            showError('eventsList', 'Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showError('eventsList', 'Error loading events');
    }
}

// ===== Render Functions =====
function renderArticles(articles) {
    const container = document.getElementById('articlesList');
    const countLabel = document.getElementById('articleCountLabel');
    
    countLabel.textContent = articles.length + ' articles';
    
    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <h3>No articles found</h3>
                <p>Try adjusting your filters or create a new article</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        html += `
            <div class="article-card" data-id="${article.id}">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(article.title)}</h3>
                    <div class="card-meta">
                        <span>${escapeHtml(article.author)}</span>
                        <span class="meta-tag">${escapeHtml(article.category)}</span>
                        <span>${formatDate(article.published_date)}</span>
                    </div>
                </div>
                <div class="card-summary">${escapeHtml(article.summary)}</div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editArticle(${article.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteArticle(${article.id})">Delete</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function renderEvents(events) {
    const container = document.getElementById('eventsList');
    const countLabel = document.getElementById('eventCountLabel');
    
    countLabel.textContent = events.length + ' events';
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No upcoming events</h3>
                <p>Create a new event to get started</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        html += `
            <div class="event-card" data-id="${event.id}">
                <h3 class="event-name">${escapeHtml(event.name)}</h3>
                <div class="event-meta">
                    <span>${escapeHtml(event.location)}</span>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div class="event-description">${escapeHtml(event.description)}</div>
                <div class="event-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editEvent(${event.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})">Delete</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ===== Stats =====
function updateStats() {
    var articles = currentArticles || [];
    var events = currentEvents || [];
    
    document.getElementById('articleCount').textContent = articles.length;
    document.getElementById('eventCount').textContent = events.length;
    
    var categories = new Set();
    for (var i = 0; i < articles.length; i++) {
        if (articles[i].category) {
            categories.add(articles[i].category);
        }
    }
    document.getElementById('categoryCount').textContent = categories.size;
    
    var authors = new Set();
    for (var j = 0; j < articles.length; j++) {
        if (articles[j].author) {
            authors.add(articles[j].author);
        }
    }
    document.getElementById('authorCount').textContent = authors.size;
}

// ===== Filters =====
function updateAuthorFilter(articles) {
    var authorSet = new Set();
    for (var i = 0; i < articles.length; i++) {
        if (articles[i].author) {
            authorSet.add(articles[i].author);
        }
    }
    var authors = Array.from(authorSet);
    var select = document.getElementById('authorFilter');
    var currentValue = select.value;
    
    var html = '<option value="">All Authors</option>';
    for (var j = 0; j < authors.length; j++) {
        html += '<option value="' + escapeHtml(authors[j]) + '">' + escapeHtml(authors[j]) + '</option>';
    }
    select.innerHTML = html;
    
    if (currentValue && authors.indexOf(currentValue) !== -1) {
        select.value = currentValue;
    }
}

function applyFilters() {
    var search = document.getElementById('searchInput').value.trim();
    var category = document.getElementById('categoryFilter').value;
    var author = document.getElementById('authorFilter').value;
    
    var filters = {};
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (author) filters.author = author;
    
    loadArticles(filters);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('authorFilter').value = '';
    loadArticles();
}

function getCurrentFilters() {
    var search = document.getElementById('searchInput').value.trim();
    var category = document.getElementById('categoryFilter').value;
    var author = document.getElementById('authorFilter').value;
    
    var filters = {};
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (author) filters.author = author;
    
    return filters;
}

// ===== Modal Functions =====
function openModal(type, data) {
    data = data || null;
    var modal = document.getElementById('modal');
    var title = document.getElementById('modalTitle');
    var form = document.getElementById('modalForm');
    var formType = document.getElementById('formType');
    var editId = document.getElementById('editId');
    
    var articleFields = document.getElementById('articleFields');
    var eventFields = document.getElementById('eventFields');
    
    form.reset();
    editId.value = '';
    
    if (type === 'article') {
        articleFields.style.display = 'block';
        eventFields.style.display = 'none';
        
        title.textContent = data ? 'Edit Article' : 'Add New Article';
        formType.value = 'article';
        
        if (data) {
            document.getElementById('formTitle').value = data.title;
            document.getElementById('formAuthor').value = data.author;
            document.getElementById('formCategory').value = data.category;
            document.getElementById('formDate').value = data.published_date;
            document.getElementById('formDescription').value = data.summary;
            editId.value = data.id;
        }
        
        document.getElementById('eventName').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventDescription').value = '';
        
    } else if (type === 'event') {
        articleFields.style.display = 'none';
        eventFields.style.display = 'block';
        
        title.textContent = data ? 'Edit Event' : 'Add New Event';
        formType.value = 'event';
        
        if (data) {
            document.getElementById('eventName').value = data.name;
            document.getElementById('eventLocation').value = data.location;
            document.getElementById('eventDate').value = data.date;
            document.getElementById('eventDescription').value = data.description;
            editId.value = data.id;
        }
        
        document.getElementById('formTitle').value = '';
        document.getElementById('formAuthor').value = '';
        document.getElementById('formCategory').value = '';
        document.getElementById('formDate').value = '';
        document.getElementById('formDescription').value = '';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Form Submit =====
async function handleFormSubmit(e) {
    e.preventDefault();
    
    var formType = document.getElementById('formType').value;
    var editId = document.getElementById('editId').value;
    
    var endpoint = '';
    var data = {};
    var typeName = '';
    
    if (formType === 'article') {
        var title = document.getElementById('formTitle').value.trim();
        var author = document.getElementById('formAuthor').value.trim();
        var category = document.getElementById('formCategory').value.trim();
        var date = document.getElementById('formDate').value;
        var summary = document.getElementById('formDescription').value.trim();
        
        endpoint = API_BASE + '/articles/';
        data = { title: title, author: author, category: category, published_date: date, summary: summary };
        typeName = 'Article';
        
    } else if (formType === 'event') {
        var name = document.getElementById('eventName').value.trim();
        var location = document.getElementById('eventLocation').value.trim();
        var date = document.getElementById('eventDate').value;
        var description = document.getElementById('eventDescription').value.trim();
        
        endpoint = API_BASE + '/events/';
        data = { name: name, location: location, date: date, description: description };
        typeName = 'Event';
    }
    
    var method = editId ? 'PUT' : 'POST';
    var url = editId ? endpoint + editId : endpoint;
    
    try {
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        var result = await response.json();
        
        if (response.ok) {
            closeModal();
            if (formType === 'article') {
                loadArticles();
                var filters = getCurrentFilters();
                var hasFilters = false;
                for (var key in filters) {
                    if (filters.hasOwnProperty(key)) {
                        hasFilters = true;
                        break;
                    }
                }
                if (hasFilters) {
                    loadArticles(filters);
                }
            } else {
                loadEvents();
            }
            Toast.success(typeName + ' ' + (editId ? 'updated' : 'created') + ' successfully');
        } else {
            var errorMsg = result.errors ? result.errors.join(', ') : result.message;
            Toast.error(errorMsg || 'Validation failed');
        }
    } catch (error) {
        console.error('Error saving:', error);
        Toast.error('Error saving data');
    }
}

// ===== Edit Functions =====
function editArticle(id) {
    var article = null;
    for (var i = 0; i < currentArticles.length; i++) {
        if (currentArticles[i].id === id) {
            article = currentArticles[i];
            break;
        }
    }
    if (article) {
        openModal('article', article);
    }
}

function editEvent(id) {
    var event = null;
    for (var i = 0; i < currentEvents.length; i++) {
        if (currentEvents[i].id === id) {
            event = currentEvents[i];
            break;
        }
    }
    if (event) {
        openModal('event', event);
    }
}

// ===== Delete Functions =====
async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
        var response = await fetch(API_BASE + '/articles/' + id, { method: 'DELETE' });
        var result = await response.json();
        
        if (response.ok) {
            loadArticles();
            var filters = getCurrentFilters();
            var hasFilters = false;
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    hasFilters = true;
                    break;
                }
            }
            if (hasFilters) {
                loadArticles(filters);
            }
            Toast.success('Article deleted successfully');
        } else {
            Toast.error(result.message || 'Error deleting article');
        }
    } catch (error) {
        console.error('Error deleting article:', error);
        Toast.error('Error deleting article');
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        var response = await fetch(API_BASE + '/events/' + id, { method: 'DELETE' });
        var result = await response.json();
        
        if (response.ok) {
            loadEvents();
            Toast.success('Event deleted successfully');
        } else {
            Toast.error(result.message || 'Error deleting event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        Toast.error('Error deleting event');
    }
}

// ===== UI Helpers =====
function showLoading(containerId) {
    var container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

function showError(containerId, message) {
    var container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ===== Close modal on outside click =====
window.onclick = function(event) {
    var modal = document.getElementById('modal');
    if (event.target === modal || event.target.classList.contains('modal-backdrop')) {
        closeModal();
    }
}