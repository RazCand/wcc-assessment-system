// Data Manager for WCC Assessment System
class DataManager {
    constructor() {
        this.storageKey = 'wcc_assessments';
    }

    // Save assessment result to localStorage
    saveAssessment(assessmentData) {
        const assessments = this.getAllAssessments();
        const newAssessment = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...assessmentData
        };
        
        assessments.push(newAssessment);
        localStorage.setItem(this.storageKey, JSON.stringify(assessments));
        return newAssessment.id;
    }

    // Get all assessments
    getAllAssessments() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // Get assessment by ID
    getAssessment(id) {
        const assessments = this.getAllAssessments();
        return assessments.find(assessment => assessment.id === id);
    }

    // Delete assessment by ID
    deleteAssessment(id) {
        const assessments = this.getAllAssessments();
        const filtered = assessments.filter(assessment => assessment.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }

    // Clear all assessments
    clearAllAssessments() {
        localStorage.removeItem(this.storageKey);
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Export data as JSON
    exportData() {
        const assessments = this.getAllAssessments();
        const dataStr = JSON.stringify(assessments, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `wcc_assessments_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Import data from JSON
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        localStorage.setItem(this.storageKey, JSON.stringify(data));
                        resolve(data.length);
                    } else {
                        reject('Invalid data format');
                    }
                } catch (error) {
                    reject('Error parsing JSON file');
                }
            };
            reader.readAsText(file);
        });
    }

    // Get summary statistics
    getSummaryStats() {
        const assessments = this.getAllAssessments();
        
        const stats = {
            total: assessments.length,
            approved: 0,
            declined: 0,
            totalValue: 0,
            avgScore: 0,
            categories: {
                client: { Development: 0, Leverage: 0, Nuisance: 0, Avoid: 0 },
                work: { Development: 0, Leverage: 0, Nuisance: 0, Avoid: 0 }
            },
            decisions: {}
        };

        if (assessments.length === 0) return stats;

        let totalScore = 0;
        
        assessments.forEach(assessment => {
            // Count decisions
            if (assessment.result.decision === 'DECLINE') {
                stats.declined++;
            } else {
                stats.approved++;
            }

            // Track decision types
            const decision = assessment.result.decision;
            stats.decisions[decision] = (stats.decisions[decision] || 0) + 1;

            // Sum total value (extract number from value string)
            const valueStr = assessment.projectInfo.value || '0';
            const valueMatch = valueStr.match(/[\d,]+/);
            if (valueMatch) {
                const value = parseFloat(valueMatch[0].replace(/,/g, ''));
                if (!isNaN(value)) {
                    // Convert to full amount (assume k = thousand, M = million)
                    if (valueStr.toLowerCase().includes('m')) {
                        stats.totalValue += value * 1000000;
                    } else if (valueStr.toLowerCase().includes('k')) {
                        stats.totalValue += value * 1000;
                    } else {
                        stats.totalValue += value;
                    }
                }
            }

            // Sum scores
            totalScore += assessment.result.totalScore || 0;

            // Count categories
            if (assessment.result.clientCategory) {
                stats.categories.client[assessment.result.clientCategory]++;
            }
            if (assessment.result.workCategory) {
                stats.categories.work[assessment.result.workCategory]++;
            }
        });

        stats.avgScore = Math.round(totalScore / assessments.length);
        
        return stats;
    }
}

// Global instance
const dataManager = new DataManager();