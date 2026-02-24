// Drag and Drop functionality for OKR Visualizer
class DragDropManager {
    constructor(app) {
        this.app = app;
        this.draggedElement = null;
        this.draggedType = null; // 'objective' or 'keyresult'
        this.draggedData = null;
        this.dropZones = [];
        this.placeholder = null;
        
        this.initializeDragAndDrop();
    }

    initializeDragAndDrop() {
        // Add event listeners to document for global drag events
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    // Make an objective draggable
    makeObjectiveDraggable(objectiveElement, objectiveData) {
        objectiveElement.draggable = true;
        
        objectiveElement.addEventListener('dragstart', (e) => {
            this.draggedElement = objectiveElement;
            this.draggedType = 'objective';
            this.draggedData = objectiveData;
            
            objectiveElement.classList.add('dragging');
            
            // Set drag data
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'objective',
                id: objectiveData.id
            }));

            // Create drag image
            const dragImage = objectiveElement.cloneNode(true);
            dragImage.style.transform = 'rotate(5deg)';
            dragImage.style.opacity = '0.8';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, -10, -10);
            
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);

            this.createObjectivePlaceholder();
        });

        objectiveElement.addEventListener('dragend', () => {
            objectiveElement.classList.remove('dragging');
        });
    }

    // Make a key result draggable
    makeKeyResultDraggable(keyResultElement, keyResultData) {
        keyResultElement.draggable = true;
        
        keyResultElement.addEventListener('dragstart', (e) => {
            this.draggedElement = keyResultElement;
            this.draggedType = 'keyresult';
            this.draggedData = keyResultData;
            
            keyResultElement.classList.add('dragging');
            
            // Set drag data
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'keyresult',
                id: keyResultData.id,
                objectiveId: keyResultData.objectiveId
            }));

            e.stopPropagation(); // Prevent objective drag
        });

        keyResultElement.addEventListener('dragend', () => {
            keyResultElement.classList.remove('dragging');
        });
    }

    // Make key results list a drop zone
    makeKeyResultsDropZone(keyResultsList, objectiveId) {
        keyResultsList.addEventListener('dragover', (e) => {
            if (this.draggedType === 'keyresult') {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                keyResultsList.classList.add('drag-over');
                
                // Show placeholder
                this.showKeyResultPlaceholder(keyResultsList, e);
            }
        });

        keyResultsList.addEventListener('dragleave', (e) => {
            // Only remove if leaving the drop zone entirely
            if (!keyResultsList.contains(e.relatedTarget)) {
                keyResultsList.classList.remove('drag-over');
                this.removeKeyResultPlaceholder();
            }
        });

        keyResultsList.addEventListener('drop', (e) => {
            if (this.draggedType === 'keyresult') {
                e.preventDefault();
                keyResultsList.classList.remove('drag-over');
                
                try {
                    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    
                    if (dragData.type === 'keyresult') {
                        const dropIndex = this.getDropIndex(keyResultsList, e.clientY);
                        this.handleKeyResultDrop(dragData.id, objectiveId, dropIndex);
                    }
                } catch (error) {
                    console.error('Error handling key result drop:', error);
                }
                
                this.removeKeyResultPlaceholder();
            }
        });
    }

    // Make objectives container a drop zone for objective reordering
    makeObjectivesDropZone(objectivesContainer) {
        objectivesContainer.addEventListener('dragover', (e) => {
            if (this.draggedType === 'objective') {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // Show placeholder between objectives
                this.showObjectivePlaceholder(objectivesContainer, e);
            }
        });

        objectivesContainer.addEventListener('drop', (e) => {
            if (this.draggedType === 'objective') {
                e.preventDefault();
                
                try {
                    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    
                    if (dragData.type === 'objective') {
                        const dropIndex = this.getObjectiveDropIndex(objectivesContainer, e.clientX, e.clientY);
                        this.handleObjectiveDrop(dragData.id, dropIndex);
                    }
                } catch (error) {
                    console.error('Error handling objective drop:', error);
                }
                
                this.removeObjectivePlaceholder();
            }
        });
    }

    // Handle global drag over
    handleDragOver(e) {
        // Default behavior - this will be overridden by specific drop zones
    }

    // Handle global drop
    handleDrop(e) {
        // Prevent default to avoid unwanted behavior
        e.preventDefault();
    }

    // Handle drag end
    handleDragEnd() {
        // Clean up
        this.removeAllPlaceholders();
        this.removeAllDragOverHighlights();
        
        this.draggedElement = null;
        this.draggedType = null;
        this.draggedData = null;
    }

    // Create placeholder for objective reordering
    createObjectivePlaceholder() {
        if (this.placeholder) return;
        
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drag-placeholder';
        this.placeholder.textContent = 'Drop objective here';
    }

    // Show objective placeholder at appropriate position
    showObjectivePlaceholder(container, e) {
        if (!this.placeholder) this.createObjectivePlaceholder();
        
        const objectives = Array.from(container.children).filter(child => 
            child !== this.placeholder && !child.classList.contains('dragging')
        );
        
        let insertIndex = objectives.length;
        
        for (let i = 0; i < objectives.length; i++) {
            const objective = objectives[i];
            const rect = objective.getBoundingClientRect();
            
            // Check if mouse is before this objective
            if (e.clientY < rect.top + rect.height / 2 || 
                (e.clientY < rect.bottom && e.clientX < rect.left + rect.width / 2)) {
                insertIndex = i;
                break;
            }
        }
        
        if (insertIndex < objectives.length) {
            container.insertBefore(this.placeholder, objectives[insertIndex]);
        } else {
            container.appendChild(this.placeholder);
        }
    }

    // Show key result placeholder
    showKeyResultPlaceholder(keyResultsList, e) {
        if (!this.placeholder) {
            this.placeholder = document.createElement('div');
            this.placeholder.className = 'drag-placeholder';
            this.placeholder.textContent = 'Drop key result here';
            this.placeholder.style.height = '60px';
        }
        
        const keyResults = Array.from(keyResultsList.children).filter(child => 
            child !== this.placeholder && !child.classList.contains('dragging')
        );
        
        let insertIndex = keyResults.length;
        
        for (let i = 0; i < keyResults.length; i++) {
            const rect = keyResults[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
                insertIndex = i;
                break;
            }
        }
        
        if (insertIndex < keyResults.length) {
            keyResultsList.insertBefore(this.placeholder, keyResults[insertIndex]);
        } else {
            keyResultsList.appendChild(this.placeholder);
        }
    }

    // Remove all placeholders
    removeAllPlaceholders() {
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
        this.placeholder = null;
    }

    removeKeyResultPlaceholder() {
        this.removeAllPlaceholders();
    }

    removeObjectivePlaceholder() {
        this.removeAllPlaceholders();
    }

    // Remove drag-over highlights
    removeAllDragOverHighlights() {
        document.querySelectorAll('.drag-over').forEach(element => {
            element.classList.remove('drag-over');
        });
    }

    // Get drop index for key results
    getDropIndex(container, mouseY) {
        const items = Array.from(container.children).filter(child => 
            !child.classList.contains('dragging') && 
            !child.classList.contains('drag-placeholder')
        );
        
        for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect();
            if (mouseY < rect.top + rect.height / 2) {
                return i;
            }
        }
        
        return items.length;
    }

    // Get drop index for objectives
    getObjectiveDropIndex(container, mouseX, mouseY) {
        const objectives = Array.from(container.children).filter(child => 
            !child.classList.contains('dragging') && 
            !child.classList.contains('drag-placeholder')
        );
        
        // For grid layout, we need to consider both X and Y positions
        for (let i = 0; i < objectives.length; i++) {
            const rect = objectives[i].getBoundingClientRect();
            
            if (mouseY < rect.top + rect.height / 2 || 
                (mouseY < rect.bottom && mouseX < rect.left + rect.width / 2)) {
                return i;
            }
        }
        
        return objectives.length;
    }

    // Handle key result drop
    handleKeyResultDrop(keyResultId, newObjectiveId, newIndex) {
        const data = this.app.data;
        let keyResult = null;
        let oldObjectiveId = null;
        
        // Find the key result and remove it from its current objective
        for (const objective of data.objectives) {
            const krIndex = objective.keyResults.findIndex(kr => kr.id === keyResultId);
            if (krIndex !== -1) {
                keyResult = objective.keyResults.splice(krIndex, 1)[0];
                oldObjectiveId = objective.id;
                break;
            }
        }
        
        if (!keyResult) return;
        
        // Update key result's objective ID
        keyResult.objectiveId = newObjectiveId;
        
        // Find the new objective and add the key result
        const newObjective = data.objectives.find(obj => obj.id === newObjectiveId);
        if (newObjective) {
            // Insert at the specified index
            newObjective.keyResults.splice(newIndex, 0, keyResult);
            
            // Update order for all key results in the objective
            newObjective.keyResults.forEach((kr, index) => {
                kr.order = index + 1;
            });
        }
        
        // Update order for key results in the old objective if different
        if (oldObjectiveId !== newObjectiveId) {
            const oldObjective = data.objectives.find(obj => obj.id === oldObjectiveId);
            if (oldObjective) {
                oldObjective.keyResults.forEach((kr, index) => {
                    kr.order = index + 1;
                });
            }
        }
        
        // Save and refresh
        this.app.saveData();
        this.app.renderObjectives();
    }

    // Handle objective drop
    handleObjectiveDrop(objectiveId, newIndex) {
        const data = this.app.data;
        
        // Find and remove the objective
        const objIndex = data.objectives.findIndex(obj => obj.id === objectiveId);
        if (objIndex === -1) return;
        
        const objective = data.objectives.splice(objIndex, 1)[0];
        
        // Insert at new position
        data.objectives.splice(newIndex, 0, objective);
        
        // Update order for all objectives
        data.objectives.forEach((obj, index) => {
            obj.order = index + 1;
        });
        
        // Save and refresh
        this.app.saveData();
        this.app.renderObjectives();
    }
}

// Export for use in app.js
window.DragDropManager = DragDropManager;