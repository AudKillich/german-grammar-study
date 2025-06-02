// Store test questions and related content
let studyContent = null;
let studyConfig = null;
let lessons = [];

// Variables to track time and lesson progress
let startTime;
let endTime;
let timerInterval;
let currentLesson = 0;
let lessonResults = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load configuration and lessons first
    loadStudyData().then(() => {
        // Add event listeners to group buttons after data is loaded
        document.getElementById('groupA').addEventListener('click', () => startStudy('groupA'));
        document.getElementById('groupB').addEventListener('click', () => startStudy('groupB'));
        document.getElementById('groupC').addEventListener('click', () => startStudy('groupC'));
        document.getElementById('randomGroup').addEventListener('click', assignRandomGroup);
    });
});

// Function to load study configuration and lessons
async function loadStudyData() {
    try {
        // Load the main configuration file
        const configResponse = await fetch('./data/config.json');
        const config = await configResponse.json();
        studyConfig = config.studyConfig;
        
        // Load all lesson files
        const lessonPromises = config.lessons.map(async (lessonInfo) => {
            const lessonResponse = await fetch(`./data/${lessonInfo.file}`);
            const lessonData = await lessonResponse.json();
            return lessonData;
        });
        
        lessons = await Promise.all(lessonPromises);
        
        // Build the studyContent structure for backward compatibility
        buildStudyContent();
        
    } catch (error) {
        console.error('Error loading study data:', error);
        // Fallback to empty content if loading fails
        studyContent = {
            groupA: { title: "German Grammar Test", intro: "Loading error", lessons: [] },
            groupB: { title: "German Grammar Test", intro: "Loading error", lessons: [] },
            groupC: { title: "German Grammar Test", intro: "Loading error", lessons: [] }
        };
    }
}

// Function to build the studyContent structure from loaded lessons
function buildStudyContent() {
    studyContent = {
        groupA: {
            title: studyConfig.title,
            intro: studyConfig.groups.groupA.intro,
            lessons: lessons.map(lesson => ({
                title: lesson.title,
                questions: lesson.questions
            }))
        },
        groupB: {
            title: studyConfig.title,
            intro: studyConfig.groups.groupB.intro,
            lessons: lessons.map(lesson => ({
                title: lesson.title,
                examples: lesson.groupB.examples,
                questions: lesson.questions
            }))
        },
        groupC: {
            title: studyConfig.title,
            intro: studyConfig.groups.groupC.intro,
            lessons: lessons.map(lesson => ({
                title: lesson.title,
                explanation: lesson.groupC.explanation,
                questions: lesson.questions
            }))
        }
    };
}

// Function to randomly assign a group
function assignRandomGroup() {
    const groups = ['groupA', 'groupB', 'groupC'];
    const randomIndex = Math.floor(Math.random() * groups.length);
    startStudy(groups[randomIndex]);
}

// Function to start the study based on selected group
function startStudy(group) {
    // Reset lesson progress and results
    currentLesson = 0;
    lessonResults = [];
    
    // Store the selected group in localStorage for use across pages
    localStorage.setItem('selectedGroup', group);
    
    // Create the test page dynamically
    createLessonPage(group, currentLesson);
}

// Function to create the test page based on the selected group
function createTestPage(group) {
    const content = studyContent[group];
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('header');
    header.innerHTML = `<h1>${content.title}</h1>`;
    container.appendChild(header);
    
    // Create intro section
    const intro = document.createElement('section');
    intro.className = 'study-intro';
    intro.innerHTML = `<p>${content.intro}</p>`;
    container.appendChild(intro);
    
    // If Group B, add examples
    if (group === 'groupB' && content.examples) {
        const examplesSection = document.createElement('section');
        examplesSection.className = 'examples-section';
        examplesSection.innerHTML = '<h2>Examples</h2>';
        
        const examplesList = document.createElement('ul');
        content.examples.forEach(example => {
            const li = document.createElement('li');
            li.innerHTML = example;
            examplesList.appendChild(li);
        });
        
        examplesSection.appendChild(examplesList);
        container.appendChild(examplesSection);
        
        // Add continue button
        const continueBtn = document.createElement('div');
        continueBtn.className = 'continue-btn-container';
        continueBtn.innerHTML = '<button id="continue-to-questions" class="continue-btn">Continue to Questions</button>';
        container.appendChild(continueBtn);
        
        // Add event listener to continue button
        document.getElementById('continue-to-questions').addEventListener('click', function() {
            showQuestions(group);
        });
        return;
    }
    
    // If Group C, add grammar explanation
    if (group === 'groupC' && content.explanation) {
        const explanationSection = document.createElement('section');
        explanationSection.className = 'explanation-section';
        explanationSection.innerHTML = '<h2>Grammar Explanation</h2>' + content.explanation;
        container.appendChild(explanationSection);
        
        // Add continue button
        const continueBtn = document.createElement('div');
        continueBtn.className = 'continue-btn-container';
        continueBtn.innerHTML = '<button id="continue-to-questions" class="continue-btn">Continue to Questions</button>';
        container.appendChild(continueBtn);
        
        // Add event listener to continue button
        document.getElementById('continue-to-questions').addEventListener('click', function() {
            showQuestions(group);
        });
        return;
    }
    
    // For Group A or if we're showing questions after examples/explanation
    showQuestions(group);
}

// Function to create a lesson page (either with learning material or questions)
function createLessonPage(group, lessonIndex) {
    const content = studyContent[group];
    const lesson = content.lessons[lessonIndex];
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('header');
    header.innerHTML = `<h1>${content.title}</h1>`;
    container.appendChild(header);
    
    // Create lesson title section
    const lessonTitleSection = document.createElement('section');
    lessonTitleSection.className = 'lesson-title-section';
    lessonTitleSection.innerHTML = `<h2>${lesson.title}</h2>`;
    container.appendChild(lessonTitleSection);
    
    // If Group B, add examples
    if (group === 'groupB' && lesson.examples) {
        const examplesSection = document.createElement('section');
        examplesSection.className = 'examples-section';
        examplesSection.innerHTML = '<h3>Examples</h3>';
        
        const examplesList = document.createElement('ul');
        lesson.examples.forEach(example => {
            const li = document.createElement('li');
            li.innerHTML = example;
            examplesList.appendChild(li);
        });
        
        examplesSection.appendChild(examplesList);
        container.appendChild(examplesSection);
        
        // Add continue button
        const continueBtn = document.createElement('div');
        continueBtn.className = 'continue-btn-container';
        continueBtn.innerHTML = '<button id="continue-to-questions" class="continue-btn">Continue to Questions</button>';
        container.appendChild(continueBtn);
        
        // Add event listener to continue button
        document.getElementById('continue-to-questions').addEventListener('click', function() {
            showQuestionsForLesson(group, lessonIndex);
        });
        return;
    }
    
    // If Group C, add grammar explanation
    if (group === 'groupC' && lesson.explanation) {
        const explanationSection = document.createElement('section');
        explanationSection.className = 'explanation-section';
        explanationSection.innerHTML = '<h3>Grammar Explanation</h3>' + lesson.explanation;
        container.appendChild(explanationSection);
        
        // Add continue button
        const continueBtn = document.createElement('div');
        continueBtn.className = 'continue-btn-container';
        continueBtn.innerHTML = '<button id="continue-to-questions" class="continue-btn">Continue to Questions</button>';
        container.appendChild(continueBtn);
        
        // Add event listener to continue button
        document.getElementById('continue-to-questions').addEventListener('click', function() {
            showQuestionsForLesson(group, lessonIndex);
        });
        return;
    }
    
    // For Group A or if we're showing questions directly
    showQuestionsForLesson(group, lessonIndex);
}

// Function to show the questions section
function showQuestions(group) {
    const content = studyContent[group];
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('header');
    header.innerHTML = `<h1>${content.title}</h1>`;
    container.appendChild(header);
    
    // Add timer indicator
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer-indicator';
    timerDiv.innerHTML = '<p class="timer-text">Time: <span id="timer">00:00</span></p>';
    container.appendChild(timerDiv);
    
    // Create questions section
    const questionsSection = document.createElement('section');
    questionsSection.className = 'questions-section';
    questionsSection.innerHTML = '<h2>Questions</h2>';
    
    // Create form for questions
    const form = document.createElement('form');
    form.id = 'quiz-form';
    
    // Add questions to form
    content.lessons.forEach((lesson, lessonIndex) => {
        lesson.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            
            questionDiv.innerHTML = `
                <p><strong>${lesson.title} - Question ${index + 1}:</strong> ${q.question}</p>
                <div class="options">
                    ${q.options.map((option, i) => `
                        <div class="option">
                            <input type="radio" id="q${lessonIndex}_${index}_o${i}" name="q${lessonIndex}_${index}" value="${i}" required>
                            <label for="q${lessonIndex}_${index}_o${i}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            
            form.appendChild(questionDiv);
        });
    });
    
    // Add submit button
    const submitDiv = document.createElement('div');
    submitDiv.className = 'submit-container';
    submitDiv.innerHTML = '<button type="submit" class="submit-btn">Submit Answers</button>';
    form.appendChild(submitDiv);
    
    // Add form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        evaluateAnswers(group);
    });
    
    questionsSection.appendChild(form);
    container.appendChild(questionsSection);
    
    // Start the timer when questions are displayed
    startTime = new Date();
    updateTimer();
}

// Function to evaluate answers
function evaluateAnswers(group) {
    const content = studyContent[group];
    let score = 0;
    let totalQuestions = 0;
    
    // Stop the timer and calculate duration
    endTime = new Date();
    const timeTaken = Math.round((endTime - startTime) / 1000); // in seconds
    
    // Clear the timer interval
    clearInterval(timerInterval);
    
    // Check each lesson and question
    content.lessons.forEach(lesson => {
        totalQuestions += lesson.questions.length;
        lesson.questions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
            if (selectedOption && parseInt(selectedOption.value) === q.correct) {
                score++;
            }
        });
    });
    
    // Display results
    showResults(score, totalQuestions, group, timeTaken);
}

// Function to display results
function showResults(score, total, group, timeTaken) {
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create results header
    const header = document.createElement('header');
    header.innerHTML = '<h1>Study Results</h1>';
    container.appendChild(header);
    
    // Create results section
    const resultsSection = document.createElement('section');
    resultsSection.className = 'results-section';
    
    const percentage = Math.round((score / total) * 100);
    
    // Format time for display
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeDisplay = `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    resultsSection.innerHTML = `
        <h2>Your Score</h2>
        <div class="score-display">
            <p>You scored ${score} out of ${total} (${percentage}%)</p>
        </div>
        <div class="time-display">
            <p>Time taken to complete questions: ${timeDisplay}</p>
        </div>
        <div class="group-info">
            <p>Your assigned group: ${group.replace('group', 'Group ')}</p>
        </div>
        <div class="thank-you">
            <p>Thank you for participating in this study!</p>
            <button id="restart" class="restart-btn">Return to Start</button>
        </div>
    `;
    
    container.appendChild(resultsSection);
    
    // Add event listener to restart button
    document.getElementById('restart').addEventListener('click', function() {
        window.location.reload();
    });
}

// Timer update function
function updateTimer() {
    // Update the timer display every second
    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsedTime = Math.floor((now - startTime) / 1000); // in seconds
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        // Format time as mm:ss
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        document.getElementById('timer').innerText = formattedTime;
    }, 1000);
}

// Function to show questions for a specific lesson
function showQuestionsForLesson(group, lessonIndex) {
    const content = studyContent[group];
    const lesson = content.lessons[lessonIndex];
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('header');
    header.innerHTML = `<h1>${content.title}</h1>`;
    container.appendChild(header);
    
    // Create lesson title
    const lessonTitle = document.createElement('section');
    lessonTitle.className = 'lesson-title';
    lessonTitle.innerHTML = `<h2>${lesson.title}</h2>`;
    container.appendChild(lessonTitle);
    
    // Add timer indicator
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer-indicator';
    timerDiv.innerHTML = '<p class="timer-text">Time: <span id="timer">00:00</span></p>';
    container.appendChild(timerDiv);
    
    // Create questions section
    const questionsSection = document.createElement('section');
    questionsSection.className = 'questions-section';
    questionsSection.innerHTML = '<h3>Questions</h3>';
    
    // Create form for questions
    const form = document.createElement('form');
    form.id = 'quiz-form';
    
    // Add questions to form
    lesson.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        questionDiv.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
            <div class="options">
                ${q.options.map((option, i) => `
                    <div class="option">
                        <input type="radio" id="q${index}_o${i}" name="q${index}" value="${i}" required>
                        <label for="q${index}_o${i}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
        
        form.appendChild(questionDiv);
    });
    
    // Add submit button
    const submitDiv = document.createElement('div');
    submitDiv.className = 'submit-container';
    submitDiv.innerHTML = '<button type="submit" class="submit-btn">Submit Answers</button>';
    form.appendChild(submitDiv);
    
    // Add form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        evaluateLessonAnswers(group, lessonIndex);
    });
    
    questionsSection.appendChild(form);
    container.appendChild(questionsSection);
    
    // Start the timer when questions are displayed
    startTime = new Date();
    updateTimer();
}

// Function to evaluate answers for a specific lesson
function evaluateLessonAnswers(group, lessonIndex) {
    const content = studyContent[group];
    const lesson = content.lessons[lessonIndex];
    let score = 0;
    let totalQuestions = lesson.questions.length;
    
    // Stop the timer and calculate duration
    endTime = new Date();
    const timeTaken = Math.round((endTime - startTime) / 1000); // in seconds
    
    // Clear the timer interval
    clearInterval(timerInterval);
    
    // Check each answer
    lesson.questions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        if (selectedOption && parseInt(selectedOption.value) === q.correct) {
            score++;
        }
    });
    
    // Store results for this lesson
    lessonResults.push({
        lessonIndex: lessonIndex,
        lessonTitle: lesson.title,
        score: score,
        total: totalQuestions,
        timeTaken: timeTaken
    });
    
    // Check if we have more lessons
    if (lessonIndex < content.lessons.length - 1) {
        // Move to the next lesson
        currentLesson++;
        showLessonCompletion(group, lessonIndex, score, totalQuestions, timeTaken);
    } else {
        // All lessons completed, show final results
        showFinalResults(group);
    }
}

// Function to show lesson completion before moving to the next lesson
function showLessonCompletion(group, lessonIndex, score, totalQuestions, timeTaken) {
    const content = studyContent[group];
    const lesson = content.lessons[lessonIndex];
    const nextLesson = content.lessons[lessonIndex + 1];
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('header');
    header.innerHTML = `<h1>${content.title}</h1>`;
    container.appendChild(header);
    
    // Create completion section
    const completionSection = document.createElement('section');
    completionSection.className = 'lesson-completion-section';
    
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Format time for display
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeDisplay = `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    completionSection.innerHTML = `
        <h2>Lesson Completed</h2>
        <div class="lesson-info">
            <p>You have completed: <strong>${lesson.title}</strong></p>
        </div>
        <div class="score-display">
            <p>You scored ${score} out of ${totalQuestions} (${percentage}%)</p>
        </div>
        <div class="time-display">
            <p>Time taken: ${timeDisplay}</p>
        </div>
        <div class="next-lesson">
            <p>Next lesson: <strong>${nextLesson.title}</strong></p>
            <button id="continue-next-lesson" class="continue-btn">Continue to Next Lesson</button>
        </div>
    `;
    
    container.appendChild(completionSection);
    
    // Add event listener to continue button
    document.getElementById('continue-next-lesson').addEventListener('click', function() {
        createLessonPage(group, lessonIndex + 1);
    });
}

// Function to show final results after all lessons are completed
function showFinalResults(group) {
    const container = document.querySelector('.container');
    
    // Clear the current content
    container.innerHTML = '';
    
    // Create results header
    const header = document.createElement('header');
    header.innerHTML = '<h1>Study Results</h1>';
    container.appendChild(header);
    
    // Create results section
    const resultsSection = document.createElement('section');
    resultsSection.className = 'results-section';
    
    // Calculate total score and time
    let totalScore = 0;
    let totalQuestions = 0;
    let totalTime = 0;
    
    lessonResults.forEach(result => {
        totalScore += result.score;
        totalQuestions += result.total;
        totalTime += result.timeTaken;
    });
    
    const totalPercentage = Math.round((totalScore / totalQuestions) * 100);
    
    // Format total time for display
    const totalMinutes = Math.floor(totalTime / 60);
    const totalSeconds = totalTime % 60;
    const totalTimeDisplay = `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''} and ${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
    
    resultsSection.innerHTML = `
        <h2>Your Overall Score</h2>
        <div class="score-display">
            <p>You scored ${totalScore} out of ${totalQuestions} (${totalPercentage}%)</p>
        </div>
        <div class="time-display">
            <p>Total time taken: ${totalTimeDisplay}</p>
        </div>
        <div class="group-info">
            <p>Your assigned group: ${group.replace('group', 'Group ')}</p>
        </div>
        <div class="thank-you">
            <p>Thank you for participating in this study!</p>
            <button id="restart" class="restart-btn">Return to Start</button>
        </div>
    `;
    
    container.appendChild(resultsSection);
    
    // Add event listener to restart button
    document.getElementById('restart').addEventListener('click', function() {
        window.location.reload();
    });
}