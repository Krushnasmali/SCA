// Course Management JavaScript
(function() {
    // Check if Firebase is loaded and configured
    if (typeof window.SCAFirebase === 'undefined' || !window.SCAFirebase.database) {
        console.error('Firebase is not loaded or configured properly.');
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial;"><h2>Error: Firebase not loaded</h2><p>Please check your internet connection and refresh the page.</p></div>';
        return;
    }

    // Get database instance from centralized config
    const database = window.SCAFirebase.database;

class CourseManager {
    constructor() {
        this.courses = {};
        this.currentEditingId = null;
        this.coursesRef = database.ref('courses');
        
        this.initializeEventListeners();
        this.loadCourses();
        this.setupRealtimeListener();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('addCourseBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        
        // Form submission
        document.getElementById('courseForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterCourses());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterCourses());
        
        // Close modal when clicking outside
        document.getElementById('courseModal').addEventListener('click', (e) => {
            if (e.target.id === 'courseModal') {
                this.closeModal();
            }
        });
    }

    setupRealtimeListener() {
        this.coursesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            this.courses = data || {};
            this.renderCourses();
            this.updateStatistics();
        });
    }

    async loadCourses() {
        this.showLoading(true);
        try {
            const snapshot = await this.coursesRef.once('value');
            const data = snapshot.val();
            this.courses = data || {};
            this.renderCourses();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showError('Failed to load courses');
        } finally {
            this.showLoading(false);
        }
    }

    renderCourses() {
        const tbody = document.getElementById('coursesTableBody');
        tbody.innerHTML = '';

        const coursesArray = Object.entries(this.courses);
        
        if (coursesArray.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        No courses found. Click "Add New Course" to get started.
                    </td>
                </tr>
            `;
            return;
        }

        coursesArray.forEach(([id, course]) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const categoryBadge = this.getCategoryBadge(course.categories?.[0] || 'other');
            
            row.innerHTML = `
                <td class="px-3 sm:px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center">
                                <i class="fas fa-book text-white text-xs sm:text-sm"></i>
                            </div>
                        </div>
                        <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                            <div class="text-sm font-medium text-gray-900 truncate">${course.title}</div>
                            <div class="text-xs sm:text-sm text-gray-500 truncate sm:hidden">${course.duration} • ${course.fees}</div>
                            <div class="text-xs text-gray-500 truncate hidden sm:block">${course.introduction?.substring(0, 50) || ''}...</div>
                            <div class="sm:hidden mt-1">${categoryBadge}</div>
                        </div>
                    </div>
                </td>
                <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    ${categoryBadge}
                </td>
                <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${course.duration}
                </td>
                <td class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${course.fees}
                </td>
                <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                        <button onclick="courseManager.editCourse('${id}')"
                                class="text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm">
                            <i class="fas fa-edit"></i> <span class="hidden sm:inline">Edit</span>
                        </button>
                        <button onclick="courseManager.deleteCourse('${id}')"
                                class="text-red-600 hover:text-red-900 text-xs sm:text-sm">
                            <i class="fas fa-trash"></i> <span class="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    getCategoryBadge(category) {
        const badges = {
            'coding': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Coding</span>',
            'business': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Business</span>',
            'designing': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">Designing</span>',
            'digital_literacy': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Digital Literacy</span>',
            'other': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Other</span>'
        };
        return badges[category] || badges.other;
    }

    updateStatistics() {
        const coursesArray = Object.values(this.courses);
        const total = coursesArray.length;
        
        const coding = coursesArray.filter(course => course.categories?.includes('coding')).length;
        const business = coursesArray.filter(course => course.categories?.includes('business')).length;
        const designing = coursesArray.filter(course => course.categories?.includes('designing')).length;
        
        document.getElementById('totalCourses').textContent = total;
        document.getElementById('codingCourses').textContent = coding;
        document.getElementById('businessCourses').textContent = business;
        document.getElementById('designCourses').textContent = designing;
    }

    filterCourses() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilterElement = document.getElementById('categoryFilter');

        if (!searchInput || !categoryFilterElement) return;

        const searchTerm = (searchInput.value || '').toLowerCase();
        const categoryFilter = categoryFilterElement.value || '';

        const rows = document.querySelectorAll('#coursesTableBody tr');

        rows.forEach(row => {
            if (!row.cells || row.cells.length === 1) return; // Skip "no courses" row

            const titleCell = row.cells[0];
            const categoryCell = row.cells[1];

            if (!titleCell || !categoryCell) return;

            const title = (titleCell.textContent || '').toLowerCase();
            const category = (categoryCell.textContent || '').toLowerCase();

            const matchesSearch = !searchTerm || title.includes(searchTerm);
            const matchesCategory = !categoryFilter || category.includes(categoryFilter.toLowerCase());

            row.style.display = matchesSearch && matchesCategory ? '' : 'none';
        });
    }

    openModal(course = null) {
        this.currentEditingId = course ? course.id : null;
        
        const modal = document.getElementById('courseModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('courseForm');
        
        if (course) {
            title.textContent = 'Edit Course';
            this.populateForm(course.data);
        } else {
            title.textContent = 'Add New Course';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('courseModal').classList.add('hidden');
        document.getElementById('courseForm').reset();
        this.currentEditingId = null;
    }

    populateForm(course) {
        document.getElementById('courseTitle').value = course.title || '';
        document.getElementById('courseDuration').value = course.duration || '';
        document.getElementById('courseFees').value = course.fees || '';
        document.getElementById('courseCategory').value = course.categories?.[0] || '';
        document.getElementById('courseIntroduction').value = course.introduction || '';
        document.getElementById('courseSyllabus').value = course.syllabus || '';
        document.getElementById('courseImage').value = course.image || '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('courseTitle').value.trim(),
            duration: document.getElementById('courseDuration').value.trim(),
            fees: document.getElementById('courseFees').value.trim(),
            categories: [document.getElementById('courseCategory').value],
            introduction: document.getElementById('courseIntroduction').value.trim(),
            syllabus: document.getElementById('courseSyllabus').value.trim(),
            image: document.getElementById('courseImage').value.trim() || null,
            updatedAt: new Date().toISOString()
        };

        if (!this.currentEditingId) {
            formData.createdAt = new Date().toISOString();
        }

        this.showLoading(true);
        
        try {
            if (this.currentEditingId) {
                await database.ref(`courses/${this.currentEditingId}`).set(formData);
                this.showSuccess('Course updated successfully!');
            } else {
                await this.coursesRef.push(formData);
                this.showSuccess('Course added successfully!');
            }
            
            this.closeModal();
        } catch (error) {
            console.error('Error saving course:', error);
            this.showError('Failed to save course');
        } finally {
            this.showLoading(false);
        }
    }

    editCourse(courseId) {
        const course = this.courses[courseId];
        if (course) {
            this.openModal({ id: courseId, data: course });
        }
    }

    async deleteCourse(courseId) {
        const course = this.courses[courseId];
        if (!course) return;

        const result = await window.Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete "${course.title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            this.showLoading(true);
            try {
                await database.ref(`courses/${courseId}`).remove();
                this.showSuccess('Course deleted successfully!');
            } catch (error) {
                console.error('Error deleting course:', error);
                this.showError('Failed to delete course');
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

    // Initialize the course manager when the page loads
    window.courseManager = new CourseManager();
})(); // End of IIFE
