// Application State
let currentStep = 1;
let projectInfo = {
    workScope: '',
    clientName: '',
    location: '',
    workType: '',
    value: '',
    assessedBy: '',
    assessmentDate: new Date().toLocaleDateString()
};

let screeningAnswers = {
    withinWA: null,
    alignsWithServices: null,
    meetsCompliance: null
};

let assessmentScores = {
    clientType: 0,
    clientRelationship: 0,
    clientReputation: 0,
    pipelinePotential: 0,
    strategicImportance: 0,
    contractTerms: 0,
    projectValue: 0,
    location: 0,
    riskProfile: 0,
    complexity: 0,
    competitionLevel: 0,
    internalCapability: 0,
    assetUtilisation: 0
};

let result = null;

// Data Arrays
const workTypes = [
    "Civil Construction",
    "Earthworks & Bulk Excavation",
    "Site Preparation & Clearing",
    "Roadworks & Pavement Construction",
    "Carparks & Hardstands",
    "Drainage & Stormwater Systems",
    "Sewer & Water Infrastructure",
    "Subdivisions & Land Development",
    "Retaining Walls & Soil Stabilisation",
    "Concrete Works",
    "Industrial Construction",
    "Marine & Coastal Civil Works"
];

const locations = [
    "Perth - North of River",
    "Perth - South of River", 
    "Perth Airport",
    "Kwinana",
    "South West WA",
    "Mid West WA",
    "Wheatbelt WA",
    "Goldfields/Esperance WA",
    "Great Southern WA",
    "Pilbara WA",
    "Gascoyne WA",
    "Kimberley WA"
];

const questionDefinitions = {
    clientType: {
        question: "Client type?",
        category: "client",
        options: [
            { value: 1, label: "New – Low Importance (unimportant client, limited potential)" },
            { value: 2, label: "Existing – Low Importance (repeat client but low value/priority)" },
            { value: 3, label: "New – Moderate Importance (some potential but not core)" },
            { value: 4, label: "New – High Importance (strategic new client, high potential)" },
            { value: 5, label: "Existing – High Importance (key existing client, strong strategic value)" }
        ]
    },
    clientRelationship: {
        question: "Client Relationship status?",
        category: "client",
        options: [
            { value: 1, label: "Non-preferred; client has history of issues or poor alignment with WCC" },
            { value: 2, label: "Low preference; occasional engagement, minor concerns in past interactions" },
            { value: 3, label: "Neutral; neither preferred nor non-preferred, standard working relationship" },
            { value: 4, label: "Preferred; generally positive history, good alignment with WCC" },
            { value: 5, label: "Highly preferred; excellent history, very strong alignment, strategic relationship" }
        ]
    },
    clientReputation: {
        question: "Client Reputation & Financial Strength?",
        category: "client",
        options: [
            { value: 1, label: "Poor reputation or financially unstable; high risk of non-payment or disputes" },
            { value: 2, label: "Limited reputation and/or moderate financial stability; some risk with larger contracts" },
            { value: 3, label: "Established reputation and generally stable finances; reliable for standard contracts" },
            { value: 4, label: "Strong reputation and solid financial stability; low risk for large contracts" },
            { value: 5, label: "Excellent reputation and very strong financial position; ideal strategic client" }
        ]
    },
    pipelinePotential: {
        question: "Work Pipeline Potential?",
        category: "client",
        options: [
            { value: 1, label: "One-Off Job (limited repeat potential)" },
            { value: 2, label: "Moderate Repeat of Low Value Work" },
            { value: 3, label: "Moderate Repeat of High Value Work" },
            { value: 4, label: "High Repeat of Low Value Work" },
            { value: 5, label: "High Repeat of High Value Work" }
        ]
    },
    strategicImportance: {
        question: "Strategic importance?",
        category: "client",
        options: [
            { value: 1, label: "Low: Non-Priority Market" },
            { value: 2, label: "Low-Medium: Emerging or opportunistic market, some relevance but not core" },
            { value: 3, label: "Medium: Important but Non-Core" },
            { value: 4, label: "Medium-High: Key market with strong potential, partial strategic alignment" },
            { value: 5, label: "High: Strategic Market" }
        ]
    },
    projectValue: {
        question: "Project Value",
        category: "work",
        options: [
            { value: 1, label: "Low: <$200k" },
            { value: 2, label: "Low–Moderate: $200k–$2 million" },
            { value: 3, label: "Medium: $2–$5 million" },
            { value: 4, label: "Moderate–High: $5–$10 million" },
            { value: 5, label: "High: >$10 million" }
        ]
    },
    location: {
        question: "Location Score",
        category: "work",
        options: [
            { value: 1, label: "Kimberley WA" },
            { value: 2, label: "Pilbara WA, Gascoyne WA" },
            { value: 3, label: "Mid West WA, Wheatbelt WA, Goldfields/Esperance WA, Great Southern WA" },
            { value: 4, label: "Perth – North/South of River, South West WA" },
            { value: 5, label: "Perth Airport & Kwinana" }
        ]
    },
    riskProfile: {
        question: "Risk Profile",
        category: "work",
        options: [
            { value: 1, label: "Very High Risk" },
            { value: 2, label: "High Risk" },
            { value: 3, label: "Moderate Risk" },
            { value: 4, label: "Low Risk" },
            { value: 5, label: "Very Low Risk" }
        ]
    },
    complexity: {
        question: "Project Complexity",
        category: "work",
        options: [
            { value: 1, label: "Very High Complexity" },
            { value: 2, label: "High Complexity" },
            { value: 3, label: "Moderate Complexity" },
            { value: 4, label: "Low Complexity" },
            { value: 5, label: "Very Low Complexity" }
        ]
    },
    competitionLevel: {
        question: "Competition Level",
        category: "work",
        options: [
            { value: 1, label: "Very High: Intense competition, market saturated" },
            { value: 2, label: "High: Strong competition, multiple established players" },
            { value: 3, label: "Medium: Moderate competition, typical market pressure" },
            { value: 4, label: "Low: Few competitors, some alternatives for clients" },
            { value: 5, label: "Very Low: Minimal competitors, largely uncontested market" }
        ]
    },
    internalCapability: {
        question: "Internal Capability",
        category: "work",
        options: [
            { value: 1, label: "Very Low: Minimal capability, significant gaps" },
            { value: 2, label: "Low: Limited capability, some gaps requiring external support" },
            { value: 3, label: "Medium: Adequate capability, can deliver with moderate support" },
            { value: 4, label: "High: Strong capability, mostly self-sufficient" },
            { value: 5, label: "Very High: Excellent capability, fully self-sufficient" }
        ]
    },
    assetUtilisation: {
        question: "Asset Utilisation",
        category: "work",
        options: [
            { value: 1, label: "Very Poor: Requires significant new assets" },
            { value: 2, label: "Poor: Requires some new assets, low utilisation" },
            { value: 3, label: "Moderate: Mix of existing and new assets" },
            { value: 4, label: "Good: Largely utilises existing assets" },
            { value: 5, label: "Excellent: Fully utilises current assets, no new investment" }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSelects();
    setupInputListeners();
    renderAssessmentQuestions();
});

// Initialize select dropdowns
function initializeSelects() {
    const locationSelect = document.getElementById('location');
    const workTypeSelect = document.getElementById('workType');
    
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
    
    workTypes.forEach(workType => {
        const option = document.createElement('option');
        option.value = workType;
        option.textContent = workType;
        workTypeSelect.appendChild(option);
    });
}

// Setup input listeners for Step 1
function setupInputListeners() {
    const inputs = ['workScope', 'clientName', 'location', 'workType', 'value', 'assessedBy'];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        element.addEventListener('input', function() {
            projectInfo[inputId] = this.value;
        });
    });
}

// Navigation functions
function goToStep(step) {
    // Hide current step
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step-${step}-content`).classList.add('active');
    
    // Update progress indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 === step) {
            stepEl.classList.add('active');
        } else if (index + 1 < step) {
            stepEl.classList.add('completed');
        }
    });
    
    currentStep = step;
}

// Screening question functions
function setScreeningAnswer(question, answer) {
    screeningAnswers[question] = answer;
    
    // Update button states
    const questionCard = event.target.closest('.question-card');
    const buttons = questionCard.querySelectorAll('.btn-yes, .btn-no');
    
    buttons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.classList.add('selected');
    
    // Check if all screening questions are answered "Yes"
    checkScreeningComplete();
}

function checkScreeningComplete() {
    const allYes = screeningAnswers.withinWA === true && 
                  screeningAnswers.alignsWithServices === true && 
                  screeningAnswers.meetsCompliance === true;
    
    const continueButton = document.getElementById('continue-to-assessment');
    continueButton.disabled = !allYes;
}

// Assessment question functions
function renderAssessmentQuestions() {
    const clientContainer = document.getElementById('client-questions');
    const workContainer = document.getElementById('work-questions');
    
    clientContainer.innerHTML = '';
    workContainer.innerHTML = '';
    
    Object.keys(questionDefinitions).forEach(key => {
        const question = questionDefinitions[key];
        const container = question.category === 'client' ? clientContainer : workContainer;
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'assessment-question';
        
        questionDiv.innerHTML = `
            <div class="assessment-question-title">${question.question}</div>
            <div class="assessment-options">
                ${question.options.map(option => `
                    <button class="assessment-option" 
                            onclick="setAssessmentScore('${key}', ${option.value}, '${question.category}')"
                            data-question="${key}" 
                            data-value="${option.value}">
                        <span class="option-score">${option.value}:</span>
                        ${option.label}
                    </button>
                `).join('')}
            </div>
        `;
        
        container.appendChild(questionDiv);
    });
}

function setAssessmentScore(questionKey, value, category) {
    assessmentScores[questionKey] = value;
    
    // Update button states
    const questionDiv = event.target.closest('.assessment-question');
    const buttons = questionDiv.querySelectorAll('.assessment-option');
    
    buttons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.classList.add('selected', category);
}

// Result calculation
function calculateResult() {
    // Check screening first
    if (!screeningAnswers.withinWA || !screeningAnswers.alignsWithServices || !screeningAnswers.meetsCompliance) {
        return {
            decision: "DECLINE",
            reason: "Failed initial screening criteria",
            clientCategory: "N/A",
            workCategory: "N/A",
            marginGuidance: "Do not pursue - does not meet basic requirements",
            totalScore: 0,
            clientScore: 0,
            workScore: 0,
            cssClass: "decline"
        };
    }

    // Calculate client score (5 questions)
    const clientScore = assessmentScores.clientType + assessmentScores.clientRelationship + 
                      assessmentScores.clientReputation + assessmentScores.pipelinePotential + 
                      assessmentScores.strategicImportance;

    // Calculate work score (7 questions)  
    const workScore = assessmentScores.projectValue + assessmentScores.location + 
                     assessmentScores.riskProfile + assessmentScores.complexity + 
                     assessmentScores.competitionLevel + assessmentScores.internalCapability + 
                     assessmentScores.assetUtilisation;

    const totalScore = clientScore + workScore;

    // Determine client category
    let clientCategory;
    if (clientScore <= 9) clientCategory = "Avoid";
    else if (clientScore <= 17) clientCategory = "Nuisance";
    else if (clientScore <= 22) clientCategory = "Leverage";
    else clientCategory = "Development";

    // Determine work category
    let workCategory;
    if (workScore <= 14) workCategory = "Avoid";
    else if (workScore <= 21) workCategory = "Nuisance";
    else if (workScore <= 28) workCategory = "Leverage";
    else workCategory = "Development";

    // Determine margin guidance based on matrix
    let marginGuidance;
    let decision;
    let cssClass;

    if (clientCategory === "Avoid") {
        marginGuidance = "Decline – Do not pursue";
        decision = "DECLINE";
        cssClass = "decline";
    } else if (clientCategory === "Nuisance" && workCategory === "Avoid") {
        marginGuidance = "High Margin (15–25%+)";
        decision = "PURSUE WITH HIGH MARGIN";
        cssClass = "high-margin";
    } else if (clientCategory === "Nuisance" && workCategory === "Nuisance") {
        marginGuidance = "High Margin (15–25%+)";
        decision = "PURSUE WITH HIGH MARGIN";
        cssClass = "high-margin";
    } else if (clientCategory === "Nuisance" && (workCategory === "Leverage" || workCategory === "Development")) {
        marginGuidance = "Moderate Margin (10–15%)";
        decision = "PURSUE WITH MODERATE MARGIN";
        cssClass = "moderate-margin";
    } else if ((clientCategory === "Leverage" || clientCategory === "Development") && workCategory === "Avoid") {
        marginGuidance = "Standard Margin (8–12%)";
        decision = "PURSUE WITH STANDARD MARGIN";
        cssClass = "standard-margin";
    } else {
        marginGuidance = "Standard Margin (8–12%)";
        decision = "PURSUE WITH STANDARD MARGIN";  
        cssClass = "standard-margin";
    }

    return {
        decision,
        clientCategory,
        workCategory,
        marginGuidance,
        clientScore,
        workScore,
        totalScore,
        cssClass
    };
}

// UPDATED FUNCTION: Main calculation handler with data saving
function handleCalculate() {
    const calculatedResult = calculateResult();
    result = calculatedResult;
    renderResult();
    goToStep(4);
    
    // Save the assessment data
    saveAssessmentData();
}

// NEW FUNCTION: Save assessment data to localStorage
function saveAssessmentData() {
    // Check if dataManager is available
    if (typeof dataManager === 'undefined') {
        console.error('DataManager not loaded. Make sure data-manager.js is included.');
        return;
    }

    const assessmentData = {
        projectInfo: projectInfo,
        screeningAnswers: screeningAnswers,
        assessmentScores: assessmentScores,
        result: result
    };
    
    try {
        dataManager.saveAssessment(assessmentData);
        
        // Add success message with dashboard link
        setTimeout(() => {
            const resultCard = document.getElementById('result-card');
            if (resultCard) {
                // Check if success message already exists
                if (!resultCard.querySelector('.success-message')) {
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.style.cssText = `
                        background: #d1fae5;
                        color: #065f46;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        margin-top: 1rem;
                        font-weight: 600;
                        text-align: center;
                        border: 1px solid #10b981;
                    `;
                    successMessage.innerHTML = `
                        ✓ Assessment saved successfully! 
                        <a href="dashboard.html" style="color: #059669; text-decoration: underline; margin-left: 1rem;">View Dashboard</a>
                    `;
                    resultCard.appendChild(successMessage);
                }
            }
        }, 100);
    } catch (error) {
        console.error('Error saving assessment data:', error);
    }
}

function renderResult() {
    const resultCard = document.getElementById('result-card');
    resultCard.className = `result-card ${result.cssClass}`;
    
    const iconSvg = getResultIcon(result.cssClass);
    
    resultCard.innerHTML = `
        <div class="result-header">
            ${iconSvg}
            <div class="result-decision">${result.decision}</div>
        </div>
        
        <div class="result-grid">
            <div class="result-item">
                <div class="result-item-title" style="color: #1d4ed8;">Client Category</div>
                <div class="result-item-value">${result.clientCategory}</div>
                <div class="result-item-score">Score: ${result.clientScore}/25</div>
            </div>
            
            <div class="result-item">
                <div class="result-item-title" style="color: #059669;">Work Category</div>
                <div class="result-item-value">${result.workCategory}</div>
                <div class="result-item-score">Score: ${result.workScore}/35</div>
            </div>
        </div>
        
        <div class="margin-guidance">
            <div class="result-item-title">Margin Guidance</div>
            <div class="result-item-value">${result.marginGuidance}</div>
        </div>
        
        <div class="project-summary">
            <div class="result-item-title">Project Summary</div>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label">Client:</span>
                    <span>${projectInfo.clientName || 'Not specified'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Location:</span>
                    <span>${projectInfo.location || 'Not specified'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Work Type:</span>
                    <span>${projectInfo.workType || 'Not specified'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Value:</span>
                    <span>${projectInfo.value || 'Not specified'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Score:</span>
                    <span>${result.totalScore}/60</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Assessed By:</span>
                    <span>${projectInfo.assessedBy || 'Not specified'}</span>
                </div>
            </div>
        </div>
    `;
}

function getResultIcon(cssClass) {
    switch(cssClass) {
        case 'decline':
            return '<svg class="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #ef4444;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        case 'high-margin':
            return '<svg class="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #f59e0b;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>';
        case 'moderate-margin':
            return '<svg class="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #eab308;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        default:
            return '<svg class="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #10b981;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }
}

// Reset function
function resetTool() {
    currentStep = 1;
    projectInfo = {
        workScope: '',
        clientName: '',
        location: '',
        workType: '',
        value: '',
        assessedBy: '',
        assessmentDate: new Date().toLocaleDateString()
    };
    
    screeningAnswers = {
        withinWA: null,
        alignsWithServices: null,
        meetsCompliance: null
    };
    
    assessmentScores = {
        clientType: 0,
        clientRelationship: 0,
        clientReputation: 0,
        pipelinePotential: 0,
        strategicImportance: 0,
        contractTerms: 0,
        projectValue: 0,
        location: 0,
        riskProfile: 0,
        complexity: 0,
        competitionLevel: 0,
        internalCapability: 0,
        assetUtilisation: 0
    };
    
    result = null;
    
    // Reset form inputs
    document.querySelectorAll('input, select').forEach(input => {
        input.value = '';
    });
    
    // Reset button states
    document.querySelectorAll('.btn-yes, .btn-no, .assessment-option').forEach(btn => {
        btn.classList.remove('selected', 'client', 'work');
    });
    
    // Reset continue button
    document.getElementById('continue-to-assessment').disabled = true;
    
    // Go back to step 1
    goToStep(1);
}