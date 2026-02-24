// Storage module for handling local storage operations
class OKRStorage {
    constructor() {
        this.storageKey = 'okr-visualizer-data';
        this.defaultData = {
            objectives: [],
            nextObjectiveId: 1,
            nextKeyResultId: 1
        };
    }

    // Load data from localStorage
    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Ensure all required properties exist
                return {
                    ...this.defaultData,
                    ...parsedData
                };
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        return { ...this.defaultData };
    }

    // Save data to localStorage
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }

    // Clear all data from localStorage
    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing data from localStorage:', error);
            return false;
        }
    }

    // Export data as JSON file
    exportData() {
        const data = this.loadData();
        const exportData = {
            ...data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `okr-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    }

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate imported data structure
                    if (!this.validateImportData(importedData)) {
                        reject(new Error('Invalid file format'));
                        return;
                    }

                    // Clean and prepare data
                    const cleanData = this.cleanImportData(importedData);
                    
                    // Save imported data
                    if (this.saveData(cleanData)) {
                        resolve(cleanData);
                    } else {
                        reject(new Error('Failed to save imported data'));
                    }
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    // Validate imported data structure
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.objectives)) return false;

        // Validate each objective
        for (const objective of data.objectives) {
            if (!objective.id || !objective.title) return false;
            if (!Array.isArray(objective.keyResults)) return false;

            // Validate each key result
            for (const kr of objective.keyResults) {
                if (!kr.id || !kr.title || !kr.status) return false;
                if (!['on-track', 'behind', 'at-risk', 'done'].includes(kr.status)) return false;
            }
        }

        return true;
    }

    // Clean and prepare imported data
    cleanImportData(importedData) {
        const cleanData = {
            objectives: importedData.objectives || [],
            nextObjectiveId: Math.max(
                ...importedData.objectives.map(obj => obj.id || 0),
                importedData.nextObjectiveId || 0
            ) + 1,
            nextKeyResultId: Math.max(
                ...importedData.objectives.flatMap(obj => 
                    obj.keyResults.map(kr => kr.id || 0)
                ),
                importedData.nextKeyResultId || 0
            ) + 1
        };

        // Ensure all objectives and key results have valid IDs
        cleanData.objectives.forEach(objective => {
            if (!objective.id) {
                objective.id = cleanData.nextObjectiveId++;
            }
            if (!objective.order) {
                objective.order = objective.id;
            }

            objective.keyResults.forEach(kr => {
                if (!kr.id) {
                    kr.id = cleanData.nextKeyResultId++;
                }
                if (!kr.order) {
                    kr.order = kr.id;
                }
                if (!kr.objectiveId) {
                    kr.objectiveId = objective.id;
                }
            });
        });

        return cleanData;
    }

    // Get backup of current data (for undo functionality)
    createBackup() {
        return JSON.parse(JSON.stringify(this.loadData()));
    }

    // Restore from backup
    restoreBackup(backupData) {
        return this.saveData(backupData);
    }
}

// Create global instance
window.okrStorage = new OKRStorage();