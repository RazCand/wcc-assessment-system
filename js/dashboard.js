// Dashboard functionality for WCC Assessment System
class Dashboard {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = {
            decision: '',
            client: '',
            sort: 'date-desc'
        };
        this.init();
    }

    init() {
        this.updateSummaryCards();
        this.setupEventListeners();
        this.renderAssessmentTable();
    }

    // Update summary statistics cards
    updateSummaryCards() {
        const stats = this.dataManager.getSummaryStats();
        
        document.getElementById('total-assessments').textContent = stats.total;
        document.getElementById('approved-projects').textContent = stats.approved;
        document.getElementById('declined-projects').textContent = stats.declined;
        
        // Format total value
        const formattedValue = this.formatCurrency(stats.totalValue);
        document.getElementById('total-value').textContent = formattedValue;
    }

    // Format currency values
    formatCurrency(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'k';
        } else {
            return '$' + value.toFixed(0);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter listeners
        document.getElementById('filter-decision').addEventListener('change', (e) => {
            this.currentFilter.decision = e.target.value;
            this.renderAssessmentTable();
        });

        document.getElementById('filter-client').addEventListener('change', (e) => {
            this.currentFilter.client = e.target.value;
            this.renderAssessmentTable();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.currentFilter.sort = e.target.value;
            this.renderAssessmentTable();
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            this.dataManager.exportData();
        });

        // Clear all data
        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all assessment data? This cannot be undone.')) {
                this.dataManager.clearAllAssessments();
                this.updateSummaryCards();
                this.renderAssessmentTable();
            }
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on background click
        document.getElementById('detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'detail-modal') {
                this.closeModal();
            }
        });
    }

    // Render the assessment table
    renderAssessmentTable() {
        const assessments = this.getFilteredAndSortedAssessments();
        const tableBody = document.getElementById('assessment-table-body');
        const noDataMessage = document.getElementById('no-data-message');
        const tableContainer = document.querySelector('.table-container');

        if (assessments.length === 0) {
            tableContainer.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        noDataMessage.style.display = 'none';

        tableBody.innerHTML = assessments.map(assessment => {
            const date = new Date(assessment.timestamp).toLocaleDateString();
            const clientName = assessment.projectInfo.clientName || 'N/A';
            const projectValue = assessment.projectInfo.value || 'N/A';
            const decision = assessment.result.decision;
            const clientCategory = assessment.result.clientCategory;
            const workCategory = assessment.result.workCategory;
            const totalScore = assessment.result.totalScore;

            return `
                <tr>
                    <td>${date}</td>
                    <td>${clientName}</td>
                    <td>${projectValue}</td>
                    <td><span class="decision-badge ${this.getDecisionClass(decision)}">${this.formatDecision(decision)}</span></td>
                    <td><span class="category-badge ${this.getCategoryClass(clientCategory)}">${clientCategory}</span></td>
                    <td><span class="category-badge ${this.getCategoryClass(workCategory)}">${workCategory}</span></td>
                    <td>${totalScore}/60</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view" onclick="dashboard.viewAssessment('${assessment.id}')">View</button>
                            <button class="action-btn delete" onclick="dashboard.deleteAssessment('${assessment.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Get filtered and sorted assessments
    getFilteredAndSortedAssessments() {
        let assessments = this.dataManager.getAllAssessments();

        // Apply filters
        if (this.currentFilter.decision) {
            assessments = assessments.filter(a => a.result.decision === this.currentFilter.decision);
        }

        if (this.currentFilter.client) {
            assessments = assessments.filter(a => a.result.clientCategory === this.currentFilter.client);
        }

        // Apply sorting
        assessments.sort((a, b) => {
            switch (this.currentFilter.sort) {
                case 'date-desc':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'date-asc':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'score-desc':
                    return (b.result.totalScore || 0) - (a.result.totalScore || 0);
                case 'score-asc':
                    return (a.result.totalScore || 0) - (b.result.totalScore || 0);
                case 'value-desc':
                    return this.extractValue(b.projectInfo.value) - this.extractValue(a.projectInfo.value);
                case 'value-asc':
                    return this.extractValue(a.projectInfo.value) - this.extractValue(b.projectInfo.value);
                default:
                    return 0;
            }
        });

        return assessments;
    }

    // Extract numeric value from value string
    extractValue(valueStr) {
        if (!valueStr) return 0;
        const match = valueStr.match(/[\d,]+/);
        if (!match) return 0;
        
        const value = parseFloat(match[0].replace(/,/g, ''));
        if (valueStr.toLowerCase().includes('m')) {
            return value * 1000000;
        } else if (valueStr.toLowerCase().includes('k')) {
            return value * 1000;
        }
        return value;
    }

    // Get CSS class for decision badge
    getDecisionClass(decision) {
        if (decision.includes('DECLINE')) return 'decision-decline';
        if (decision.includes('HIGH MARGIN')) return 'decision-high-margin';
        if (decision.includes('MODERATE MARGIN')) return 'decision-moderate-margin';
        return 'decision-standard-margin';
    }

    // Get CSS class for category badge
    getCategoryClass(category) {
        return `category-${category.toLowerCase()}`;
    }

    // Format decision text for display
    formatDecision(decision) {
        return decision.replace('PURSUE WITH ', '').replace(' MARGIN', '');
    }

    // View assessment details
    viewAssessment(id) {
        const assessment = this.dataManager.getAssessment(id);
        if (!assessment) return;

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = this.generateAssessmentDetailHTML(assessment);
        document.getElementById('detail-modal').style.display = 'flex';
    }

    // Generate assessment detail HTML
    generateAssessmentDetailHTML(assessment) {
        const date = new Date(assessment.timestamp).toLocaleString();
        
        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Assessment Date</div>
                    <div class="detail-value">${date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Assessed By</div>
                    <div class="detail-value">${assessment.projectInfo.assessedBy || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client Name</div>
                    <div class="detail-value">${assessment.projectInfo.clientName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Project Value</div>
                    <div class="detail-value">${assessment.projectInfo.value || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${assessment.projectInfo.location || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Work Type</div>
                    <div class="detail-value">${assessment.projectInfo.workType || 'N/A'}</div>
                </div>
            </div>

            <div class="detail-item" style="margin-bottom: 1rem;">
                <div class="detail-label">Work Scope</div>
                <div class="detail-value">${assessment.projectInfo.workScope || 'N/A'}</div>
            </div>

            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Final Decision</div>
                    <div class="detail-value">
                        <span class="decision-badge ${this.getDecisionClass(assessment.result.decision)}">
                            ${assessment.result.decision}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Margin Guidance</div>
                    <div class="detail-value">${assessment.result.marginGuidance}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client Category</div>
                    <div class="detail-value">
                        <span class="category-badge ${this.getCategoryClass(assessment.result.clientCategory)}">
                            ${assessment.result.clientCategory}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Work Category</div>
                    <div class="detail-value">
                        <span class="category-badge ${this.getCategoryClass(assessment.result.workCategory)}">
                            ${assessment.result.workCategory}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client Score</div>
                    <div class="detail-value">${assessment.result.clientScore}/25</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Work Score</div>
                    <div class="detail-value">${assessment.result.workScore}/35</div>
                </div>
            </div>

            <h3 style="margin: 1.5rem 0 1rem 0; color: #1f2937;">Screening Answers</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Within WA & Cost-Effective?</div>
                    <div class="detail-value">${assessment.screeningAnswers.withinWA ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Aligns with WCC Services?</div>
                    <div class="detail-value">${assessment.screeningAnswers.alignsWithServices ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Meets Compliance Requirements?</div>
                    <div class="detail-value">${assessment.screeningAnswers.meetsCompliance ? 'Yes' : 'No'}</div>
                </div>
            </div>

            <h3 style="margin: 1.5rem 0 1rem 0; color: #1f2937;">Assessment Scores</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Client Type</div>
                    <div class="detail-value">${assessment.assessmentScores.clientType}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client Relationship</div>
                    <div class="detail-value">${assessment.assessmentScores.clientRelationship}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client Reputation</div>
                    <div class="detail-value">${assessment.assessmentScores.clientReputation}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pipeline Potential</div>
                    <div class="detail-value">${assessment.assessmentScores.pipelinePotential}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Strategic Importance</div>
                    <div class="detail-value">${assessment.assessmentScores.strategicImportance}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Project Value</div>
                    <div class="detail-value">${assessment.assessmentScores.projectValue}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Location Score</div>
                    <div class="detail-value">${assessment.assessmentScores.location}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Risk Profile</div>
                    <div class="detail-value">${assessment.assessmentScores.riskProfile}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Complexity</div>
                    <div class="detail-value">${assessment.assessmentScores.complexity}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Competition Level</div>
                    <div class="detail-value">${assessment.assessmentScores.competitionLevel}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Internal Capability</div>
                    <div class="detail-value">${assessment.assessmentScores.internalCapability}/5</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Asset Utilisation</div>
                    <div class="detail-value">${assessment.assessmentScores.assetUtilisation}/5</div>
                </div>
            </div>
        `;
    }

    // Delete assessment
    deleteAssessment(id) {
        if (confirm('Are you sure you want to delete this assessment?')) {
            this.dataManager.deleteAssessment(id);
            this.updateSummaryCards();
            this.renderAssessmentTable();
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('detail-modal').style.display = 'none';
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new Dashboard();
}); 
