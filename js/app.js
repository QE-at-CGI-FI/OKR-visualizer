// Main OKR Visualizer Application
class OKRApp {
    constructor() {
        this.data = null;
        this.dragDropManager = null;
        this.currentEditingObjective = null;
        this.currentEditingKeyResult = null;
        this.currentObjectiveId = null;

        this.init();
    }

    init() {
        // Load data from storage
        this.loadData();
        
        // Initialize drag and drop
        this.dragDropManager = new DragDropManager(this);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render initial UI
        this.renderObjectives();
        
        console.log('OKR Visualizer initialized');
    }

    loadData() {
        this.data = window.okrStorage.loadData();
    }

    saveData() {
        window.okrStorage.saveData(this.data);
    }

    setupEventListeners() {
        // Add objective button
        document.getElementById('add-objective-btn').addEventListener('click', () => {
            this.showObjectiveModal();
        });

        // Export/Import buttons
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Modal event listeners
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Objective modal
        const objectiveModal = document.getElementById('objective-modal');
        const objectiveForm = document.getElementById('objective-form');
        const cancelObjectiveBtn = document.getElementById('cancel-objective');
        
        // Close modal events
        objectiveModal.querySelector('.close').addEventListener('click', () => {
            this.hideObjectiveModal();
        });
        
        cancelObjectiveBtn.addEventListener('click', () => {
            this.hideObjectiveModal();
        });

        // Form submission
        objectiveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveObjective();
        });

        // Key result modal
        const keyResultModal = document.getElementById('keyresult-modal');
        const keyResultForm = document.getElementById('keyresult-form');
        const cancelKeyResultBtn = document.getElementById('cancel-keyresult');
        
        // Close modal events
        keyResultModal.querySelector('.close').addEventListener('click', () => {
            this.hideKeyResultModal();
        });
        
        cancelKeyResultBtn.addEventListener('click', () => {
            this.hideKeyResultModal();
        });

        // Form submission
        keyResultForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveKeyResult();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === objectiveModal) {
                this.hideObjectiveModal();
            }
            if (e.target === keyResultModal) {
                this.hideKeyResultModal();
            }
        });
    }

    renderObjectives() {
        const container = document.getElementById('objectives-container');
        
        // Clear existing content
        container.innerHTML = '';
        
        // Make container a drop zone for objective reordering
        this.dragDropManager.makeObjectivesDropZone(container);
        
        if (this.data.objectives.length === 0) {
            this.renderEmptyState(container);
            return;
        }
        
        // Sort objectives by order
        const sortedObjectives = [...this.data.objectives].sort((a, b) => (a.order || a.id) - (b.order || b.id));
        
        sortedObjectives.forEach(objective => {
            const objectiveElement = this.createObjectiveElement(objective);
            container.appendChild(objectiveElement);
        });
    }

    renderEmptyState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <h3>No objectives yet</h3>
            <p>Click "Add Objective" to get started with your OKR strategy map</p>
        `;
        container.appendChild(emptyState);
    }

    createObjectiveElement(objective) {
        const objectiveCard = document.createElement('div');
        objectiveCard.className = 'objective-card';
        objectiveCard.dataset.objectiveId = objective.id;
        
        // Calculate key results summary
        const totalKeyResults = objective.keyResults.length;
        const doneKeyResults = objective.keyResults.filter(kr => kr.status === 'done').length;
        const progressPercent = totalKeyResults > 0 ? Math.round((doneKeyResults / totalKeyResults) * 100) : 0;
        
        objectiveCard.innerHTML = `
            <div class="objective-header">
                <div class="objective-title">${this.escapeHtml(objective.title)}</div>
                <div class="objective-progress">
                    <small>${doneKeyResults}/${totalKeyResults} Key Results Complete (${progressPercent}%)</small>
                </div>
                <div class="objective-controls">
                    <button class="btn btn-small btn-outline edit-objective" title="Edit Objective">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-small btn-outline delete-objective" title="Delete Objective">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            <div class="key-results">
                <div class="key-results-header">
                    <span class="key-results-title">Key Results</span>
                    <button class="btn btn-small btn-primary add-key-result" title="Add Key Result">
                        + Add Key Result
                    </button>
                </div>
                <div class="key-results-list" data-objective-id="${objective.id}">
                    ${this.renderKeyResults(objective.keyResults)}
                </div>
            </div>
        `;
        
        // Add event listeners
        this.addObjectiveEventListeners(objectiveCard, objective);
        
        // Make objective draggable
        this.dragDropManager.makeObjectiveDraggable(objectiveCard, objective);
        
        // Make key results list a drop zone
        const keyResultsList = objectiveCard.querySelector('.key-results-list');
        this.dragDropManager.makeKeyResultsDropZone(keyResultsList, objective.id);
        
        return objectiveCard;
    }

    renderKeyResults(keyResults) {
        if (keyResults.length === 0) {
            return '<div class="empty-key-results">No key results yet. Add one to get started!</div>';
        }
        
        // Sort key results by order
        const sortedKeyResults = [...keyResults].sort((a, b) => (a.order || a.id) - (b.order || b.id));
        
        return sortedKeyResults.map(kr => this.createKeyResultHTML(kr)).join('');
    }

    createKeyResultHTML(keyResult) {
        const statusLabels = {
            'not-started': 'Not Started',
            'on-track': 'On Track',
            'behind': 'Behind',
            'at-risk': 'At Risk',
            'done': 'Done'
        };

        const typeClass = keyResult.type ? keyResult.type.toLowerCase() : 'del';

        return `
            <div class="key-result-item ${keyResult.status} ${typeClass}" data-kr-id="${keyResult.id}" data-objective-id="${keyResult.objectiveId}">
                <div class="key-result-content">
                    <div class="key-result-title">${this.escapeHtml(keyResult.title)}</div>
                    <div class="key-result-meta">
                        <div class="key-result-type ${typeClass}">${keyResult.type || 'DEL'}</div>
                        <div class="key-result-status ${keyResult.status}">
                            ${statusLabels[keyResult.status]}
                        </div>
                    </div>
                </div>
                <div class="key-result-controls">
                    <button class="btn btn-small btn-secondary edit-key-result" title="Edit">✏️</button>
                    <button class="btn btn-small btn-danger delete-key-result" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }

    addObjectiveEventListeners(objectiveCard, objective) {
        // Edit objective
        objectiveCard.querySelector('.edit-objective').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showObjectiveModal(objective);
        });

        // Delete objective
        objectiveCard.querySelector('.delete-objective').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteObjective(objective.id);
        });

        // Add key result
        objectiveCard.querySelector('.add-key-result').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showKeyResultModal(null, objective.id);
        });

        // Key result event listeners
        objectiveCard.querySelectorAll('.key-result-item').forEach(krElement => {
            const keyResultId = parseInt(krElement.dataset.krId);
            const keyResult = objective.keyResults.find(kr => kr.id === keyResultId);
            
            if (keyResult) {
                // Make key result draggable
                this.dragDropManager.makeKeyResultDraggable(krElement, keyResult);
                
                // Edit key result
                krElement.querySelector('.edit-key-result').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showKeyResultModal(keyResult, objective.id);
                });

                // Delete key result
                krElement.querySelector('.delete-key-result').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteKeyResult(keyResult.id, objective.id);
                });
            }
        });
    }

    showObjectiveModal(objective = null) {
        this.currentEditingObjective = objective;
        const modal = document.getElementById('objective-modal');
        const titleInput = document.getElementById('objective-title');
        const modalTitle = document.getElementById('modal-title');
        
        if (objective) {
            modalTitle.textContent = 'Edit Objective';
            titleInput.value = objective.title;
        } else {
            modalTitle.textContent = 'Add Objective';
            titleInput.value = '';
        }
        
        modal.style.display = 'block';
        titleInput.focus();
    }

    hideObjectiveModal() {
        document.getElementById('objective-modal').style.display = 'none';
        this.currentEditingObjective = null;
    }

    saveObjective() {
        const title = document.getElementById('objective-title').value.trim();
        
        if (!title) {
            alert('Please enter an objective title');
            return;
        }
        
        if (this.currentEditingObjective) {
            // Edit existing objective
            this.currentEditingObjective.title = title;
        } else {
            // Create new objective
            const newObjective = {
                id: this.data.nextObjectiveId++,
                title: title,
                keyResults: [],
                order: this.data.objectives.length + 1,
                createdAt: new Date().toISOString()
            };
            
            this.data.objectives.push(newObjective);
        }
        
        this.saveData();
        this.renderObjectives();
        this.hideObjectiveModal();
    }

    showKeyResultModal(keyResult = null, objectiveId = null) {
        this.currentEditingKeyResult = keyResult;
        this.currentObjectiveId = objectiveId;
        
        const modal = document.getElementById('keyresult-modal');
        const titleInput = document.getElementById('keyresult-title');
        const statusSelect = document.getElementById('keyresult-status');
        const typeSelect = document.getElementById('keyresult-type');
        const modalTitle = document.getElementById('kr-modal-title');
        
        if (keyResult) {
            modalTitle.textContent = 'Edit Key Result';
            titleInput.value = keyResult.title;
            statusSelect.value = keyResult.status;
            typeSelect.value = keyResult.type || 'DEL';
        } else {
            modalTitle.textContent = 'Add Key Result';
            titleInput.value = '';
            statusSelect.value = 'not-started';
            typeSelect.value = 'DEL';
        }
        
        modal.style.display = 'block';
        titleInput.focus();
    }

    hideKeyResultModal() {
        document.getElementById('keyresult-modal').style.display = 'none';
        this.currentEditingKeyResult = null;
        this.currentObjectiveId = null;
    }

    saveKeyResult() {
        const title = document.getElementById('keyresult-title').value.trim();
        const status = document.getElementById('keyresult-status').value;
        const type = document.getElementById('keyresult-type').value;
        
        if (!title) {
            alert('Please enter a key result title');
            return;
        }
        
        if (this.currentEditingKeyResult) {
            // Edit existing key result
            this.currentEditingKeyResult.title = title;
            this.currentEditingKeyResult.status = status;
            this.currentEditingKeyResult.type = type;
        } else {
            // Create new key result
            const objective = this.data.objectives.find(obj => obj.id === this.currentObjectiveId);
            if (objective) {
                const newKeyResult = {
                    id: this.data.nextKeyResultId++,
                    title: title,
                    status: status,
                    type: type,
                    objectiveId: this.currentObjectiveId,
                    order: objective.keyResults.length + 1,
                    createdAt: new Date().toISOString()
                };
                
                objective.keyResults.push(newKeyResult);
            }
        }
        
        this.saveData();
        this.renderObjectives();
        this.hideKeyResultModal();
    }

    deleteObjective(objectiveId) {
        if (confirm('Are you sure you want to delete this objective and all its key results?')) {
            this.data.objectives = this.data.objectives.filter(obj => obj.id !== objectiveId);
            this.saveData();
            this.renderObjectives();
        }
    }

    deleteKeyResult(keyResultId, objectiveId) {
        if (confirm('Are you sure you want to delete this key result?')) {
            const objective = this.data.objectives.find(obj => obj.id === objectiveId);
            if (objective) {
                objective.keyResults = objective.keyResults.filter(kr => kr.id !== keyResultId);
                this.saveData();
                this.renderObjectives();
            }
        }
    }

    exportData() {
        try {
            window.okrStorage.exportData();
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }

    importData(file) {
        if (!file) return;
        
        window.okrStorage.importData(file)
            .then(importedData => {
                this.data = importedData;
                this.renderObjectives();
                this.showNotification('Data imported successfully!', 'success');
                
                // Clear the file input
                document.getElementById('import-file').value = '';
            })
            .catch(error => {
                console.error('Import error:', error);
                this.showNotification('Failed to import data: ' + error.message, 'error');
            });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            default:
                notification.style.backgroundColor = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.okrApp = new OKRApp();
});