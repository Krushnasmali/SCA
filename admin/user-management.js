// User Management JavaScript
(function() {
    // Check if Firebase is loaded and configured
    if (typeof window.SCAFirebase === 'undefined' || !window.SCAFirebase.database) {
        console.error('Firebase is not loaded or configured properly.');
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial;"><h2>Error: Firebase not loaded</h2><p>Please check your internet connection and refresh the page.</p></div>';
        return;
    }

    // Get database instance from centralized config
    const database = window.SCAFirebase.database;

class UserManager {
    constructor() {
        this.users = {};
        this.courses = {};
        this.userCourses = {};
        this.currentUserId = null;
        
        this.usersRef = database.ref('users');
        this.coursesRef = database.ref('courses');
        this.userCoursesRef = database.ref('userCourses');
        
        this.initializeEventListeners();
        this.loadData();
        this.setupRealtimeListeners();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('assignCourseBtn').addEventListener('click', () => this.openAssignModal());
        document.getElementById('closeAssignModal').addEventListener('click', () => this.closeAssignModal());
        document.getElementById('cancelAssignBtn').addEventListener('click', () => this.closeAssignModal());
        document.getElementById('closeManageModal').addEventListener('click', () => this.closeManageModal());
        
        // Form submission
        document.getElementById('assignForm').addEventListener('submit', (e) => this.handleAssignSubmit(e));
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterUsers());
        document.getElementById('enrollmentFilter').addEventListener('change', () => this.filterUsers());
        
        // Close modals when clicking outside
        document.getElementById('assignModal').addEventListener('click', (e) => {
            if (e.target.id === 'assignModal') {
                this.closeAssignModal();
            }
        });
        
        document.getElementById('manageCoursesModal').addEventListener('click', (e) => {
            if (e.target.id === 'manageCoursesModal') {
                this.closeManageModal();
            }
        });
    }

    setupRealtimeListeners() {
        this.usersRef.on('value', (snapshot) => {
            const data = snapshot.val();
            this.users = data || {};
            this.renderUsers();
            this.updateStatistics();
        });

        this.coursesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            this.courses = data || {};
            this.populateCourseSelect();
        });

        this.userCoursesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            this.userCourses = data || {};
            this.renderUsers();
            this.updateStatistics();
        });
    }

    async loadData() {
        this.showLoading(true);
        try {
            const [usersSnapshot, coursesSnapshot, userCoursesSnapshot] = await Promise.all([
                this.usersRef.once('value'),
                this.coursesRef.once('value'),
                this.userCoursesRef.once('value')
            ]);
            
            this.users = usersSnapshot.val() || {};
            this.courses = coursesSnapshot.val() || {};
            this.userCourses = userCoursesSnapshot.val() || {};
            
            this.renderUsers();
            this.updateStatistics();
            this.populateUserSelect();
            this.populateCourseSelect();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data');
        } finally {
            this.showLoading(false);
        }
    }

    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        const usersArray = Object.entries(this.users);
        
        if (usersArray.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        No users found.
                    </td>
                </tr>
            `;
            return;
        }

        usersArray.forEach(([userId, user]) => {
            const userCoursesList = this.getUserCourses(userId);
            const enrolledCount = userCoursesList.length;
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
            
            row.innerHTML = `
                <td class="px-3 sm:px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center">
                                <i class="fas fa-user text-white text-xs sm:text-sm"></i>
                            </div>
                        </div>
                        <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                            <div class="text-sm font-medium text-gray-900 truncate">${user.name || 'No Name'}</div>
                            <div class="text-xs sm:text-sm text-gray-500 truncate">${user.email || 'No Email'}</div>
                            <div class="sm:hidden mt-1">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${enrolledCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${enrolledCount} course${enrolledCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div class="sm:hidden text-xs text-gray-500 mt-1">${user.contactNumber || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.contactNumber || 'N/A'}
                </td>
                <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${enrolledCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${enrolledCount} course${enrolledCount !== 1 ? 's' : ''}
                    </span>
                </td>
                <td class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${joinedDate}
                </td>
                <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                        <button onclick="userManager.manageCourses('${userId}')"
                                class="text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm">
                            <i class="fas fa-cog"></i> <span class="hidden sm:inline">Manage</span>
                        </button>
                        <button onclick="userManager.quickAssign('${userId}')"
                                class="text-green-600 hover:text-green-900 text-xs sm:text-sm">
                            <i class="fas fa-plus"></i> <span class="hidden sm:inline">Assign</span>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    getUserCourses(userId) {
        const userCourses = this.userCourses[userId] || {};
        return Object.entries(userCourses).map(([courseId, assignment]) => ({
            courseId,
            ...assignment,
            courseData: this.courses[courseId]
        })).filter(item => item.courseData);
    }

    updateStatistics() {
        const usersArray = Object.values(this.users);
        const totalUsers = usersArray.length;
        
        let enrolledStudents = 0;
        let totalAssignments = 0;
        
        Object.keys(this.userCourses).forEach(userId => {
            const userCoursesList = this.getUserCourses(userId);
            if (userCoursesList.length > 0) {
                enrolledStudents++;
                totalAssignments += userCoursesList.length;
            }
        });
        
        const avgCourses = totalUsers > 0 ? (totalAssignments / totalUsers).toFixed(1) : 0;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('enrolledStudents').textContent = enrolledStudents;
        document.getElementById('totalAssignments').textContent = totalAssignments;
        document.getElementById('avgCourses').textContent = avgCourses;
    }

    populateUserSelect() {
        const userSelect = document.getElementById('userSelect');
        userSelect.innerHTML = '<option value="">Choose a user...</option>';
        
        Object.entries(this.users).forEach(([userId, user]) => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = `${user.name || 'No Name'} (${user.email || 'No Email'})`;
            userSelect.appendChild(option);
        });
    }

    populateCourseSelect() {
        const courseSelect = document.getElementById('courseSelect');
        courseSelect.innerHTML = '<option value="">Choose a course...</option>';
        
        Object.entries(this.courses).forEach(([courseId, course]) => {
            const option = document.createElement('option');
            option.value = courseId;
            option.textContent = `${course.title} - ${course.fees}`;
            courseSelect.appendChild(option);
        });
    }

    filterUsers() {
        const searchInput = document.getElementById('searchInput');
        const enrollmentFilterElement = document.getElementById('enrollmentFilter');

        if (!searchInput || !enrollmentFilterElement) return;

        const searchTerm = (searchInput.value || '').toLowerCase();
        const enrollmentFilter = enrollmentFilterElement.value || '';

        const rows = document.querySelectorAll('#usersTableBody tr');

        rows.forEach(row => {
            if (!row.cells || row.cells.length === 1) return; // Skip "no users" row

            const userInfoCell = row.cells[0];
            const enrollmentCell = row.cells[2];

            if (!userInfoCell || !enrollmentCell) return;

            const userInfo = (userInfoCell.textContent || '').toLowerCase();
            const enrollmentText = (enrollmentCell.textContent || '').toLowerCase();

            const matchesSearch = !searchTerm || userInfo.includes(searchTerm);
            let matchesEnrollment = true;

            if (enrollmentFilter === 'enrolled') {
                matchesEnrollment = !enrollmentText.includes('0 course');
            } else if (enrollmentFilter === 'not-enrolled') {
                matchesEnrollment = enrollmentText.includes('0 course');
            }

            row.style.display = matchesSearch && matchesEnrollment ? '' : 'none';
        });
    }

    openAssignModal(userId = null) {
        this.currentUserId = userId;
        
        const modal = document.getElementById('assignModal');
        const userSelect = document.getElementById('userSelect');
        
        if (userId) {
            userSelect.value = userId;
            userSelect.disabled = true;
        } else {
            userSelect.disabled = false;
        }
        
        // Set today's date as default
        document.getElementById('assignmentDate').value = new Date().toISOString().split('T')[0];
        
        modal.classList.remove('hidden');
    }

    closeAssignModal() {
        document.getElementById('assignModal').classList.add('hidden');
        document.getElementById('assignForm').reset();
        document.getElementById('userSelect').disabled = false;
        this.currentUserId = null;
    }

    closeManageModal() {
        document.getElementById('manageCoursesModal').classList.add('hidden');
        this.currentUserId = null;
    }

    async handleAssignSubmit(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userSelect').value;
        const courseId = document.getElementById('courseSelect').value;
        const assignmentDate = document.getElementById('assignmentDate').value;
        const notes = document.getElementById('assignmentNotes').value.trim();

        if (!userId || !courseId) {
            this.showError('Please select both user and course');
            return;
        }

        // Check if user is already assigned to this course
        if (this.userCourses[userId] && this.userCourses[userId][courseId]) {
            this.showError('User is already assigned to this course');
            return;
        }

        const assignmentData = {
            courseId: courseId,
            assignedAt: new Date().toISOString(),
            assignmentDate: assignmentDate || new Date().toISOString().split('T')[0],
            notes: notes,
            status: 'active'
        };

        this.showLoading(true);
        
        try {
            await database.ref(`userCourses/${userId}/${courseId}`).set(assignmentData);
            this.showSuccess('Course assigned successfully!');
            this.closeAssignModal();
        } catch (error) {
            console.error('Error assigning course:', error);
            this.showError('Failed to assign course');
        } finally {
            this.showLoading(false);
        }
    }

    quickAssign(userId) {
        this.openAssignModal(userId);
    }

    manageCourses(userId) {
        this.currentUserId = userId;
        const user = this.users[userId];
        const userCoursesList = this.getUserCourses(userId);
        
        const modal = document.getElementById('manageCoursesModal');
        const title = document.getElementById('manageCoursesTitle');
        const content = document.getElementById('userCoursesContent');
        
        title.textContent = `Manage Courses - ${user.name || 'User'}`;
        
        if (userCoursesList.length === 0) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-book text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-500">No courses assigned to this user.</p>
                    <button onclick="userManager.quickAssign('${userId}')" 
                            class="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                        <i class="fas fa-plus mr-2"></i>Assign First Course
                    </button>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h4 class="text-md font-medium text-gray-900">Assigned Courses (${userCoursesList.length})</h4>
                        <button onclick="userManager.quickAssign('${userId}')" 
                                class="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors">
                            <i class="fas fa-plus mr-1"></i>Add Course
                        </button>
                    </div>
                    <div class="space-y-3">
                        ${userCoursesList.map(item => `
                            <div class="border rounded-lg p-4 bg-gray-50">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h5 class="font-medium text-gray-900">${item.courseData.title}</h5>
                                        <p class="text-sm text-gray-600">${item.courseData.duration} • ${item.courseData.fees}</p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            Assigned: ${new Date(item.assignedAt).toLocaleDateString()}
                                        </p>
                                        ${item.notes ? `<p class="text-xs text-gray-600 mt-1">Notes: ${item.notes}</p>` : ''}
                                    </div>
                                    <button onclick="userManager.removeCourseAssignment('${userId}', '${item.courseId}')" 
                                            class="text-red-600 hover:text-red-800 text-sm">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        modal.classList.remove('hidden');
    }

    async removeCourseAssignment(userId, courseId) {
        const course = this.courses[courseId];
        const user = this.users[userId];
        
        const result = await window.Swal.fire({
            title: 'Remove Course Assignment?',
            text: `Remove "${course.title}" from ${user.name || 'this user'}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove it!'
        });

        if (result.isConfirmed) {
            this.showLoading(true);
            try {
                await database.ref(`userCourses/${userId}/${courseId}`).remove();
                this.showSuccess('Course assignment removed successfully!');
                // Refresh the manage modal
                this.manageCourses(userId);
            } catch (error) {
                console.error('Error removing course assignment:', error);
                this.showError('Failed to remove course assignment');
            } finally {
                this.showLoading(false);
            }
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    showSuccess(message) {
        window.Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    }

    showError(message) {
        window.Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: message
        });
    }
}

    // Initialize the user manager when the page loads
    window.userManager = new UserManager();
})(); // End of IIFE
