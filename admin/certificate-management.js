// Certificate Management JavaScript
let users = {};
let courses = {};
let certificates = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    // Ensure the issue date defaults correctly even if later code throws
    setDefaultDate();
    loadUsers();
    loadCourses();
    loadCertificates();
    setupEventListeners();
});

function setDefaultDate() {
    const issueDateInput = document.getElementById('issueDate');
    if (!issueDateInput) return;

    // Prefer valueAsDate to avoid timezone issues; fallback to ISO local date
    if ('valueAsDate' in issueDateInput) {
        const now = new Date();
        issueDateInput.valueAsDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
    } else {
        const now = new Date();
        const localISODate = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split('T')[0];
        issueDateInput.value = localISODate;
    }
}

function setupEventListeners() {
    // Form submission
    document.getElementById('certificateForm').addEventListener('submit', handleCertificateAssignment);

    // File upload
    document.getElementById('certificateFile').addEventListener('change', handleFileSelect);

    // Search and filter
    document.getElementById('searchInput').addEventListener('input', filterCertificates);
    document.getElementById('courseFilter').addEventListener('change', filterCertificates);

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadCertificates();
        showMessage('Certificates refreshed', 'success');
    });
    
    // Auth buttons (attach only if present on this page)
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', showLoginModal);

    const authLoginBtn = document.getElementById('authLoginBtn');
    if (authLoginBtn) authLoginBtn.addEventListener('click', showLoginModal);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const cancelLoginBtn = document.getElementById('cancelLogin');
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', hideLoginModal);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
}

function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function hideLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const submitBtn = document.getElementById('submitLogin');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Show loading state
    submitBtn.disabled = true;
    loginText.textContent = 'Logging in...';
    loginSpinner.classList.remove('hidden');
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        hideLoginModal();
        showMessage('Successfully logged in!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed: ' + error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        loginText.textContent = 'Login';
        loginSpinner.classList.add('hidden');
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        showMessage('Successfully logged out', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed: ' + error.message, 'error');
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    if (file) {
        fileName.textContent = file.name;
        fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        fileInfo.classList.remove('hidden');

        // Validate file
        if (file.type !== 'application/pdf') {
            showMessage('Please select a PDF file', 'error');
            event.target.value = '';
            fileInfo.classList.add('hidden');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showMessage('File size must be less than 10MB', 'error');
            event.target.value = '';
            fileInfo.classList.add('hidden');
            return;
        }
    } else {
        fileInfo.classList.add('hidden');
    }
}

async function loadUsers() {
    try {
        const snapshot = await firebase.database().ref('users').once('value');
        users = snapshot.val() || {};

        const userSelect = document.getElementById('userSelect');
        userSelect.innerHTML = '<option value="">Choose a user...</option>';

        Object.entries(users).forEach(([uid, userData]) => {
            if (userData.name && userData.email) {
                const option = document.createElement('option');
                option.value = uid;
                option.textContent = `${userData.name} (${userData.email})`;
                userSelect.appendChild(option);
            }
        });

        console.log('Users loaded:', Object.keys(users).length);
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Error loading users', 'error');
    }
}

async function loadCourses() {
    try {
        const snapshot = await firebase.database().ref('courses').once('value');
        courses = snapshot.val() || {};

        const courseSelect = document.getElementById('courseSelect');
        const courseFilter = document.getElementById('courseFilter');

        courseSelect.innerHTML = '<option value="">Choose a course...</option>';
        courseFilter.innerHTML = '<option value="">All Courses</option>';

        Object.entries(courses).forEach(([courseId, courseData]) => {
            if (courseData.title) {
                // Add to course select
                const option = document.createElement('option');
                option.value = courseId;
                option.textContent = courseData.title;
                courseSelect.appendChild(option);

                // Add to filter
                const filterOption = document.createElement('option');
                filterOption.value = courseId;
                filterOption.textContent = courseData.title;
                courseFilter.appendChild(filterOption);
            }
        });

        console.log('Courses loaded:', Object.keys(courses).length);
    } catch (error) {
        console.error('Error loading courses:', error);
        showMessage('Error loading courses', 'error');
    }
}

async function loadCertificates() {
    try {
        const snapshot = await firebase.database().ref('certificates').once('value');
        certificates = snapshot.val() || {};

        displayCertificates();
        console.log('Certificates loaded:', Object.keys(certificates).length);
    } catch (error) {
        console.error('Error loading certificates:', error);
        showMessage('Error loading certificates', 'error');
    }
}

function displayCertificates() {
    const tbody = document.getElementById('certificatesTableBody');
    const emptyState = document.getElementById('emptyCertificates');

    tbody.innerHTML = '';

    const certificateEntries = Object.entries(certificates);

    if (certificateEntries.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    certificateEntries
        .sort((a, b) => new Date(b[1].issueDate) - new Date(a[1].issueDate))
        .forEach(([certId, certData]) => {
            const row = createCertificateRow(certId, certData);
            tbody.appendChild(row);
        });
}

function createCertificateRow(certId, certData) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';

    const userName = users[certData.userId]?.name || 'Unknown User';
    const userEmail = users[certData.userId]?.email || '';
    const courseName = courses[certData.courseId]?.title || 'Unknown Course';
    const issueDate = new Date(certData.issueDate).toLocaleDateString();

    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <i class="fas fa-user text-white"></i>
                    </div>
                </div>
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">${userName}</div>
                    <div class="text-sm text-gray-500">${userEmail}</div>
                </div>
            </div>
        </td>
        <td class="px-6 py-4">
            <div class="text-sm font-medium text-gray-900">${certData.title}</div>
            <div class="text-sm text-gray-500">${certData.description || 'No description'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ${courseName}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${issueDate}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="viewCertificate('${certData.fileUrl}')" 
                    class="text-primary hover:text-purple-700 mr-3">
                <i class="fas fa-eye mr-1"></i>View
            </button>
            <button onclick="deleteCertificate('${certId}')" 
                    class="text-red-600 hover:text-red-900">
                <i class="fas fa-trash mr-1"></i>Delete
            </button>
        </td>
    `;

    return row;
}

async function handleCertificateAssignment(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Get form data
    const userId = document.getElementById('userSelect').value;
    const courseId = document.getElementById('courseSelect').value;
    const title = document.getElementById('certificateTitle').value;
    const description = document.getElementById('certificateDescription').value;
    const issueDate = document.getElementById('issueDate').value;
    const file = document.getElementById('certificateFile').files[0];

    if (!userId || !courseId || !title || !issueDate || !file) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Uploading...';
    loadingSpinner.classList.remove('hidden');

    try {
        // Upload file to Firebase Storage
        const fileName = `certificates/${userId}_${courseId}_${Date.now()}.pdf`;
        const storageRef = firebase.storage().ref(fileName);

        const uploadTask = await storageRef.put(file);
        const fileUrl = await uploadTask.ref.getDownloadURL();

        // Create certificate data
        const certificateData = {
            userId,
            courseId,
            title,
            description,
            issueDate,
            fileUrl,
            fileName,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            createdBy: 'admin' // You can modify this to track which admin created it
        };

        // Save to database
        const newCertRef = firebase.database().ref('certificates').push();
        await newCertRef.set(certificateData);

        // Also add to user's certificates
        await firebase.database().ref(`users/${userId}/certificates/${newCertRef.key}`).set({
            certificateId: newCertRef.key,
            title,
            courseId,
            issueDate,
            fileUrl
        });

        showMessage('Certificate assigned successfully!', 'success');

        // Reset form
        document.getElementById('certificateForm').reset();
        document.getElementById('fileInfo').classList.add('hidden');
        setDefaultDate();

        // Reload certificates
        loadCertificates();

    } catch (error) {
        console.error('Error assigning certificate:', error);
        showMessage('Error assigning certificate: ' + error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Assign Certificate';
        loadingSpinner.classList.add('hidden');
    }
}

function viewCertificate(fileUrl) {
    window.open(fileUrl, '_blank');
}

async function deleteCertificate(certId) {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
        return;
    }

    try {
        const certData = certificates[certId];
        if (!certData) {
            showMessage('Certificate not found', 'error');
            return;
        }

        // Delete from storage
        const storageRef = firebase.storage().refFromURL(certData.fileUrl);
        await storageRef.delete();

        // Delete from database
        await firebase.database().ref(`certificates/${certId}`).remove();

        // Remove from user's certificates
        await firebase.database().ref(`users/${certData.userId}/certificates/${certId}`).remove();

        showMessage('Certificate deleted successfully', 'success');
        loadCertificates();

    } catch (error) {
        console.error('Error deleting certificate:', error);
        showMessage('Error deleting certificate: ' + error.message, 'error');
    }
}

function filterCertificates() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const courseFilter = document.getElementById('courseFilter').value;

    const rows = document.querySelectorAll('#certificatesTableBody tr');

    rows.forEach(row => {
        const userName = row.querySelector('td:first-child .text-sm.font-medium').textContent.toLowerCase();
        const certTitle = row.querySelector('td:nth-child(2) .text-sm.font-medium').textContent.toLowerCase();
        const courseName = row.querySelector('td:nth-child(3) span').textContent;

        const matchesSearch = userName.includes(searchTerm) || certTitle.includes(searchTerm);
        const matchesCourse = !courseFilter || courseName === courses[courseFilter]?.title;

        if (matchesSearch && matchesCourse) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    messageDiv.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 flex items-center justify-between`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}