// Notification Management JavaScript
(function() {
    // Check if Firebase is loaded and configured
    if (typeof window.SCAFirebase === 'undefined' || !window.SCAFirebase.database) {
        console.error('Firebase is not loaded or configured properly.');
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial;"><h2>Error: Firebase not loaded</h2><p>Please check your internet connection and refresh the page.</p></div>';
        return;
    }

    // Get database instance from centralized config
    const database = window.SCAFirebase.database;

    class NotificationManager {
        constructor() {
            this.users = {};
            this.notifications = {};
            this.selectedUsers = new Set();
            
            this.usersRef = database.ref('users');
            this.notificationsRef = database.ref('notifications');
            
            this.initializeEventListeners();
            this.loadData();
            this.setupRealtimeListeners();
        }

        initializeEventListeners() {
            // Form submission
            document.getElementById('notificationForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.showConfirmationModal();
            });

            // Clear form
            document.getElementById('clearButton').addEventListener('click', () => {
                this.clearForm();
            });

            // User selection radio buttons
            document.querySelectorAll('input[name="sendTo"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    this.toggleUserSelection();
                });
            });

            // User search
            document.getElementById('userSearch').addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });

            // Preview updates
            document.getElementById('messageTitle').addEventListener('input', () => {
                this.updatePreview();
            });
            document.getElementById('messageBody').addEventListener('input', () => {
                this.updatePreview();
            });

            // History search and filter
            document.getElementById('historySearch').addEventListener('input', (e) => {
                this.filterHistory(e.target.value);
            });
            document.getElementById('historyFilter').addEventListener('change', (e) => {
                this.filterHistory(document.getElementById('historySearch').value, e.target.value);
            });

            // Modal events
            document.getElementById('confirmSend').addEventListener('click', () => {
                this.sendNotification();
            });
            document.getElementById('cancelSend').addEventListener('click', () => {
                this.hideConfirmationModal();
            });
        }

        async loadData() {
            this.showLoading(true);
            try {
                await Promise.all([
                    this.loadUsers(),
                    this.loadNotificationHistory()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
                this.showError('Failed to load data');
            } finally {
                this.showLoading(false);
            }
        }

        async loadUsers() {
            try {
                const snapshot = await this.usersRef.once('value');
                this.users = snapshot.val() || {};
                this.renderUsersList();
            } catch (error) {
                console.error('Error loading users:', error);
                throw error;
            }
        }

        async loadNotificationHistory() {
            try {
                const snapshot = await this.notificationsRef.orderByChild('sentAt').once('value');
                this.notifications = snapshot.val() || {};
                this.renderNotificationHistory();
            } catch (error) {
                console.error('Error loading notification history:', error);
                throw error;
            }
        }

        setupRealtimeListeners() {
            // Listen for new users
            this.usersRef.on('child_added', (snapshot) => {
                const userId = snapshot.key;
                const userData = snapshot.val();
                this.users[userId] = userData;
                this.renderUsersList();
            });

            // Listen for user updates
            this.usersRef.on('child_changed', (snapshot) => {
                const userId = snapshot.key;
                const userData = snapshot.val();
                this.users[userId] = userData;
                this.renderUsersList();
            });

            // Listen for new notifications
            this.notificationsRef.on('child_added', (snapshot) => {
                const notificationId = snapshot.key;
                const notificationData = snapshot.val();
                this.notifications[notificationId] = notificationData;
                this.renderNotificationHistory();
            });
        }

        renderUsersList() {
            const usersList = document.getElementById('usersList');
            usersList.innerHTML = '';

            const usersArray = Object.entries(this.users);
            
            if (usersArray.length === 0) {
                usersList.innerHTML = '<p class="text-gray-500 text-sm">No users found.</p>';
                return;
            }

            usersArray.forEach(([userId, user]) => {
                const userDiv = document.createElement('div');
                userDiv.className = 'flex items-center space-x-3 p-2 hover:bg-gray-50 rounded';
                
                const hasToken = user.fcmToken && user.fcmToken.trim() !== '';
                const isEnabled = user.notificationSettings?.enabled !== false;
                
                userDiv.innerHTML = `
                    <input type="checkbox" id="user_${userId}" value="${userId}" 
                           class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                           ${!hasToken || !isEnabled ? 'disabled' : ''}>
                    <label for="user_${userId}" class="flex-1 text-sm ${!hasToken || !isEnabled ? 'text-gray-400' : 'text-gray-700'}">
                        <div class="font-medium">${user.name || 'No Name'}</div>
                        <div class="text-xs text-gray-500">${user.email}</div>
                        ${!hasToken ? '<div class="text-xs text-red-500">No FCM token</div>' : ''}
                        ${!isEnabled ? '<div class="text-xs text-orange-500">Notifications disabled</div>' : ''}
                    </label>
                `;
                
                const checkbox = userDiv.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => {
                    this.updateSelectedUsers();
                });
                
                usersList.appendChild(userDiv);
            });
        }

        filterUsers(searchTerm) {
            const usersList = document.getElementById('usersList');
            const userDivs = usersList.querySelectorAll('div');
            
            userDivs.forEach(div => {
                const label = div.querySelector('label');
                if (label) {
                    const text = label.textContent.toLowerCase();
                    const matches = text.includes(searchTerm.toLowerCase());
                    div.style.display = matches ? 'flex' : 'none';
                }
            });
        }

        updateSelectedUsers() {
            const checkboxes = document.querySelectorAll('#usersList input[type="checkbox"]:checked');
            this.selectedUsers.clear();
            
            checkboxes.forEach(checkbox => {
                this.selectedUsers.add(checkbox.value);
            });
            
            document.getElementById('selectedCount').textContent = this.selectedUsers.size;
        }

        toggleUserSelection() {
            const sendToAll = document.getElementById('allUsers').checked;
            const userSelectionContainer = document.getElementById('userSelectionContainer');
            
            if (sendToAll) {
                userSelectionContainer.classList.add('hidden');
            } else {
                userSelectionContainer.classList.remove('hidden');
            }
        }

        updatePreview() {
            const title = document.getElementById('messageTitle').value || 'Notification Title';
            const body = document.getElementById('messageBody').value || 'Notification message will appear here...';
            
            document.getElementById('previewTitle').textContent = title;
            document.getElementById('previewBody').textContent = body;
        }

        showConfirmationModal() {
            const title = document.getElementById('messageTitle').value;
            const body = document.getElementById('messageBody').value;
            const sendToAll = document.getElementById('allUsers').checked;
            
            if (!title.trim() || !body.trim()) {
                this.showError('Please fill in both title and message');
                return;
            }

            if (!sendToAll && this.selectedUsers.size === 0) {
                this.showError('Please select at least one user');
                return;
            }

            const recipientCount = sendToAll ? 
                Object.keys(this.users).filter(userId => {
                    const user = this.users[userId];
                    return user.fcmToken && user.fcmToken.trim() !== '' && 
                           user.notificationSettings?.enabled !== false;
                }).length : 
                this.selectedUsers.size;

            const message = `Are you sure you want to send "${title}" to ${recipientCount} user(s)?`;
            document.getElementById('confirmationMessage').textContent = message;
            document.getElementById('confirmationModal').classList.remove('hidden');
        }

        hideConfirmationModal() {
            document.getElementById('confirmationModal').classList.add('hidden');
        }

        async sendNotification() {
            this.hideConfirmationModal();
            this.showLoading(true, 'Sending notification...');

            try {
                const formData = this.getFormData();
                const notificationData = {
                    title: formData.title,
                    body: formData.body,
                    type: formData.type,
                    sendToAll: formData.sendToAll,
                    selectedUsers: formData.sendToAll ? null : Array.from(this.selectedUsers),
                    sentAt: firebase.database.ServerValue.TIMESTAMP,
                    status: 'pending'
                };

                // Save notification to database
                const notificationRef = await this.notificationsRef.push(notificationData);
                
                // Call Cloud Function to send notification
                // Note: This would typically call a Firebase Cloud Function
                // For now, we'll simulate the process
                await this.simulateNotificationSending(notificationRef.key, notificationData);
                
                this.showSuccess('Notification sent successfully!');
                this.clearForm();
                
            } catch (error) {
                console.error('Error sending notification:', error);
                this.showError('Failed to send notification');
            } finally {
                this.showLoading(false);
            }
        }

        async simulateNotificationSending(notificationId, notificationData) {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update notification status
            await this.notificationsRef.child(notificationId).update({
                status: 'sent',
                deliveredAt: firebase.database.ServerValue.TIMESTAMP,
                recipientCount: notificationData.sendToAll ? 
                    Object.keys(this.users).length : 
                    notificationData.selectedUsers?.length || 0
            });
        }

        getFormData() {
            return {
                title: document.getElementById('messageTitle').value.trim(),
                body: document.getElementById('messageBody').value.trim(),
                type: document.getElementById('notificationType').value,
                sendToAll: document.getElementById('allUsers').checked
            };
        }

        clearForm() {
            document.getElementById('notificationForm').reset();
            document.getElementById('allUsers').checked = true;
            this.toggleUserSelection();
            this.selectedUsers.clear();
            this.updateSelectedUsers();
            this.updatePreview();
        }

        renderNotificationHistory() {
            const tbody = document.getElementById('historyTableBody');
            const emptyState = document.getElementById('emptyHistoryState');
            
            const notificationsArray = Object.entries(this.notifications)
                .sort(([,a], [,b]) => (b.sentAt || 0) - (a.sentAt || 0));
            
            if (notificationsArray.length === 0) {
                tbody.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            tbody.innerHTML = '';

            notificationsArray.forEach(([notificationId, notification]) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                const sentDate = notification.sentAt ? 
                    new Date(notification.sentAt).toLocaleString() : 'Pending';
                
                const statusClass = notification.status === 'sent' ? 'text-green-600' : 
                                  notification.status === 'failed' ? 'text-red-600' : 'text-yellow-600';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sentDate}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                        <div class="font-medium">${notification.title}</div>
                        <div class="text-gray-500 truncate max-w-xs">${notification.body}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            ${notification.type.replace('_', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${notification.sendToAll ? 'All Users' : `${notification.selectedUsers?.length || 0} users`}
                        ${notification.recipientCount ? `(${notification.recipientCount})` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${statusClass}">
                        <i class="fas fa-circle text-xs mr-1"></i>
                        ${notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="notificationManager.viewNotification('${notificationId}')"
                                class="text-indigo-600 hover:text-indigo-900">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }

        filterHistory(searchTerm, typeFilter = 'all') {
            const rows = document.querySelectorAll('#historyTableBody tr');
            
            rows.forEach(row => {
                const title = row.querySelector('td:nth-child(2) .font-medium').textContent.toLowerCase();
                const body = row.querySelector('td:nth-child(2) .text-gray-500').textContent.toLowerCase();
                const type = row.querySelector('td:nth-child(3) span').textContent.toLowerCase();
                
                const matchesSearch = !searchTerm || 
                    title.includes(searchTerm.toLowerCase()) || 
                    body.includes(searchTerm.toLowerCase());
                
                const matchesType = typeFilter === 'all' || 
                    type.includes(typeFilter.replace('_', ' '));
                
                row.style.display = matchesSearch && matchesType ? '' : 'none';
            });
        }

        viewNotification(notificationId) {
            const notification = this.notifications[notificationId];
            if (notification) {
                alert(`Title: ${notification.title}\n\nMessage: ${notification.body}\n\nType: ${notification.type}\n\nSent: ${new Date(notification.sentAt).toLocaleString()}`);
            }
        }

        showLoading(show, message = 'Loading...') {
            const overlay = document.getElementById('loadingOverlay');
            if (show) {
                overlay.querySelector('span').textContent = message;
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }

        showSuccess(message) {
            this.showMessage(message, 'success');
        }

        showError(message) {
            this.showMessage(message, 'error');
        }

        showMessage(message, type) {
            const container = document.getElementById('messageContainer');
            const messageDiv = document.createElement('div');
            
            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            
            messageDiv.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-4 transform transition-all duration-300`;
            messageDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(messageDiv);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        window.notificationManager = new NotificationManager();
    });

})();
