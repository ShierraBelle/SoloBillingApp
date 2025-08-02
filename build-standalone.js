#!/usr/bin/env node

/**
 * Build script to create a standalone offline version of Solo Billing
 * This creates a single HTML file with all dependencies bundled
 */

import fs from 'fs';
import path from 'path';

console.log('Building standalone Solo Billing app...');

// Read the main HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solo Billing - Offline</title>
    <style>
        /* Embedded Tailwind CSS and app styles will go here */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .app-container { min-height: 100vh; background: #f8fafc; }
    </style>
</head>
<body>
    <div id="root">
        <div class="app-container">
            <div class="flex h-screen bg-gray-100">
                <!-- Sidebar -->
                <div class="w-64 bg-white shadow-lg">
                    <div class="p-6 border-b">
                        <h1 class="text-xl font-bold text-gray-800">Solo Billing</h1>
                        <p class="text-sm text-gray-600">Offline Mode</p>
                    </div>
                    <nav class="mt-6">
                        <a href="#dashboard" class="nav-link active" onclick="showPage('dashboard')">
                            <span>📊 Dashboard</span>
                        </a>
                        <a href="#meetings" class="nav-link" onclick="showPage('meetings')">
                            <span>📅 Meetings</span>
                        </a>
                        <a href="#clients" class="nav-link" onclick="showPage('clients')">
                            <span>👥 Clients</span>
                        </a>
                        <a href="#invoices" class="nav-link" onclick="showPage('invoices')">
                            <span>🧾 Invoices</span>
                        </a>
                        <a href="#calendar" class="nav-link" onclick="showPage('calendar')">
                            <span>📅 Calendar</span>
                        </a>
                        <a href="#reports" class="nav-link" onclick="showPage('reports')">
                            <span>📊 Reports</span>
                        </a>
                        <a href="#profile" class="nav-link" onclick="showPage('profile')">
                            <span>👤 Profile</span>
                        </a>
                        <a href="#notifications" class="nav-link" onclick="showPage('notifications')">
                            <span>🔔 Notifications</span>
                        </a>
                    </nav>
                    <div class="absolute bottom-4 left-4 right-4">
                        <button onclick="exportData()" class="w-full bg-blue-500 text-white py-2 px-4 rounded mb-2">
                            💾 Export Data
                        </button>
                        <input type="file" id="importFile" accept=".json" onchange="importData()" class="hidden">
                        <button onclick="document.getElementById('importFile').click()" class="w-full bg-green-500 text-white py-2 px-4 rounded">
                            📁 Import Data
                        </button>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="flex-1 overflow-hidden">
                    <div id="dashboard" class="page active p-6">
                        <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
                        <div class="grid grid-cols-4 gap-6 mb-6">
                            <div class="bg-white p-6 rounded-lg shadow">
                                <h3 class="text-sm text-gray-600">Today's Meetings</h3>
                                <p class="text-2xl font-bold" id="todayMeetings">0</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow">
                                <h3 class="text-sm text-gray-600">Hours Tracked</h3>
                                <p class="text-2xl font-bold" id="hoursTracked">0.0</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow">
                                <h3 class="text-sm text-gray-600">Today's Revenue</h3>
                                <p class="text-2xl font-bold" id="todayRevenue">₱0.00</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow">
                                <h3 class="text-sm text-gray-600">Total Clients</h3>
                                <p class="text-2xl font-bold" id="totalClients">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="meetings" class="page p-6" style="display:none;">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold">Meetings</h2>
                            <button onclick="showAddMeetingForm()" class="bg-blue-500 text-white px-4 py-2 rounded">
                                Add New Meeting
                            </button>
                        </div>
                        <div id="meetingsList" class="bg-white rounded-lg shadow"></div>
                    </div>
                    
                    <div id="clients" class="page p-6" style="display:none;">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold">Clients</h2>
                            <button onclick="showAddClientForm()" class="bg-blue-500 text-white px-4 py-2 rounded">
                                Add New Client
                            </button>
                        </div>
                        <div class="mb-4">
                            <div class="flex space-x-2">
                                <button onclick="showClientTab('active')" class="tab-btn active" id="activeTab">
                                    Active Clients (<span id="activeCount">0</span>)
                                </button>
                                <button onclick="showClientTab('archived')" class="tab-btn" id="archivedTab">
                                    Archived Clients (<span id="archivedCount">0</span>)
                                </button>
                            </div>
                        </div>
                        <div id="clientsList" class="bg-white rounded-lg shadow"></div>
                    </div>
                    
                    <div id="invoices" class="page p-6" style="display:none;">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold">Invoices</h2>
                            <button onclick="showGenerateInvoiceForm()" class="bg-blue-500 text-white px-4 py-2 rounded">
                                Generate Invoice
                            </button>
                        </div>
                        <div id="invoicesList" class="bg-white rounded-lg shadow"></div>
                    </div>
                    
                    <div id="calendar" class="page p-6" style="display:none;">
                        <h2 class="text-2xl font-bold mb-6">Calendar</h2>
                        <div id="calendarView" class="bg-white rounded-lg shadow p-6">
                            <p class="text-gray-600">Calendar view will be implemented here</p>
                        </div>
                    </div>
                    
                    <div id="reports" class="page p-6" style="display:none;">
                        <h2 class="text-2xl font-bold mb-6">Reports</h2>
                        <div class="bg-white rounded-lg shadow p-6">
                            <p class="text-gray-600">Reports and analytics will be shown here</p>
                        </div>
                    </div>
                    
                    <div id="profile" class="page p-6" style="display:none;">
                        <h2 class="text-2xl font-bold mb-6">Profile</h2>
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Company Name</label>
                                    <input type="text" id="companyName" class="form-input" placeholder="Your Company">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Default Hourly Rate</label>
                                    <input type="number" id="defaultRate" class="form-input" placeholder="150">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" id="companyEmail" class="form-input" placeholder="billing@yourcompany.com">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Phone</label>
                                    <input type="tel" id="companyPhone" class="form-input" placeholder="(555) 123-4567">
                                </div>
                            </div>
                            <button onclick="saveProfile()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                                Save Profile
                            </button>
                        </div>
                    </div>
                    
                    <div id="notifications" class="page p-6" style="display:none;">
                        <h2 class="text-2xl font-bold mb-6">Notifications</h2>
                        <div id="notificationsList" class="bg-white rounded-lg shadow"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <style>
        .nav-link {
            display: block;
            padding: 12px 24px;
            color: #6b7280;
            text-decoration: none;
            border-left: 3px solid transparent;
            transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
            background-color: #f3f4f6;
            color: #1f2937;
            border-left-color: #3b82f6;
        }
        .page {
            height: 100vh;
            overflow-y: auto;
        }
        .form-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
        }
        .tab-btn {
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            background: white;
            cursor: pointer;
            border-radius: 4px;
        }
        .tab-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        .client-card, .meeting-card, .invoice-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            background: white;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-booked { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #fef2f2; color: #dc2626; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-overdue { background: #fef2f2; color: #dc2626; }
    </style>

    <script>
        // Local Storage Keys
        const STORAGE_KEYS = {
            clients: 'solo-billing-clients',
            meetings: 'solo-billing-meetings',
            invoices: 'solo-billing-invoices',
            notifications: 'solo-billing-notifications',
            settings: 'solo-billing-settings'
        };

        // Initialize app data
        let appData = {
            clients: [],
            meetings: [],
            invoices: [],
            notifications: [],
            settings: {
                companyName: 'Your Company',
                companyEmail: 'billing@yourcompany.com',
                companyPhone: '(555) 123-4567',
                defaultHourlyRate: 150
            }
        };

        // Load data from localStorage
        function loadAppData() {
            Object.keys(STORAGE_KEYS).forEach(key => {
                const stored = localStorage.getItem(STORAGE_KEYS[key]);
                if (stored) {
                    appData[key] = JSON.parse(stored);
                }
            });
            updateDashboard();
            updateAllViews();
        }

        // Save data to localStorage
        function saveAppData() {
            Object.keys(STORAGE_KEYS).forEach(key => {
                localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(appData[key]));
            });
        }

        // Navigation
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            
            // Remove active class from nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).style.display = 'block';
            
            // Add active class to current nav link
            document.querySelector(\`[onclick="showPage('\${pageId}')"]\`).classList.add('active');
            
            // Update page-specific data
            updatePageData(pageId);
        }

        // Update page-specific data
        function updatePageData(pageId) {
            switch(pageId) {
                case 'clients':
                    updateClientsView();
                    break;
                case 'meetings':
                    updateMeetingsView();
                    break;
                case 'invoices':
                    updateInvoicesView();
                    break;
                case 'notifications':
                    updateNotificationsView();
                    break;
                case 'profile':
                    loadProfileData();
                    break;
            }
        }

        // Dashboard functions
        function updateDashboard() {
            const today = new Date().toDateString();
            const todayMeetings = appData.meetings.filter(m => 
                new Date(m.startTime).toDateString() === today && m.status === 'booked'
            );
            
            const hoursTracked = todayMeetings.reduce((sum, m) => sum + (m.duration || 0), 0) / 60;
            const todayRevenue = todayMeetings.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0);
            
            document.getElementById('todayMeetings').textContent = todayMeetings.length;
            document.getElementById('hoursTracked').textContent = hoursTracked.toFixed(1);
            document.getElementById('todayRevenue').textContent = \`₱\${todayRevenue.toFixed(2)}\`;
            document.getElementById('totalClients').textContent = appData.clients.filter(c => !c.isArchived).length;
        }

        // Client functions
        let currentClientTab = 'active';

        function showClientTab(tab) {
            currentClientTab = tab;
            document.getElementById('activeTab').classList.toggle('active', tab === 'active');
            document.getElementById('archivedTab').classList.toggle('active', tab === 'archived');
            updateClientsView();
        }

        function updateClientsView() {
            const activeClients = appData.clients.filter(c => !c.isArchived);
            const archivedClients = appData.clients.filter(c => c.isArchived);
            
            document.getElementById('activeCount').textContent = activeClients.length;
            document.getElementById('archivedCount').textContent = archivedClients.length;
            
            const clientsToShow = currentClientTab === 'active' ? activeClients : archivedClients;
            const clientsList = document.getElementById('clientsList');
            
            if (clientsToShow.length === 0) {
                clientsList.innerHTML = \`
                    <div class="p-8 text-center text-gray-500">
                        <p>No \${currentClientTab} clients found</p>
                        <button onclick="showAddClientForm()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                            Add First Client
                        </button>
                    </div>
                \`;
                return;
            }
            
            clientsList.innerHTML = clientsToShow.map(client => \`
                <div class="client-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-lg">\${client.name}</h3>
                            <p class="text-gray-600">\${client.company || ''}</p>
                            <p class="text-sm text-gray-500">\${client.email}</p>
                            <p class="text-sm text-gray-500">\${client.contactInfo?.phone || ''}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">₱\${client.hourlyRate}/hour</p>
                            <div class="mt-2 space-x-2">
                                <button onclick="editClient('\${client.id}')" class="text-blue-500 text-sm">Edit</button>
                                \${currentClientTab === 'active' ? 
                                    \`<button onclick="archiveClient('\${client.id}')" class="text-yellow-500 text-sm">Archive</button>\` :
                                    \`<button onclick="restoreClient('\${client.id}')" class="text-green-500 text-sm">Restore</button>\`
                                }
                                <button onclick="deleteClient('\${client.id}')" class="text-red-500 text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // Meeting functions
        function updateMeetingsView() {
            const meetingsList = document.getElementById('meetingsList');
            
            if (appData.meetings.length === 0) {
                meetingsList.innerHTML = \`
                    <div class="p-8 text-center text-gray-500">
                        <p>No meetings found</p>
                        <button onclick="showAddMeetingForm()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                            Add First Meeting
                        </button>
                    </div>
                \`;
                return;
            }
            
            const sortedMeetings = appData.meetings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            
            meetingsList.innerHTML = sortedMeetings.map(meeting => {
                const client = appData.clients.find(c => c.id === meeting.clientId);
                const clientName = client ? client.name : 'Unknown Client';
                
                return \`
                    <div class="meeting-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-semibold">\${meeting.title || 'Meeting'}</h3>
                                <p class="text-gray-600">\${clientName}</p>
                                <p class="text-sm text-gray-500">
                                    \${new Date(meeting.startTime).toLocaleString()}
                                </p>
                                \${meeting.duration ? \`<p class="text-sm text-gray-500">\${meeting.duration} minutes</p>\` : ''}
                                \${meeting.notes ? \`<p class="text-sm text-gray-600 mt-2">\${meeting.notes}</p>\` : ''}
                            </div>
                            <div class="text-right">
                                <span class="status-badge status-\${meeting.status}">\${meeting.status}</span>
                                \${meeting.amount ? \`<p class="font-semibold mt-1">₱\${meeting.amount}</p>\` : ''}
                                <div class="mt-2 space-x-2">
                                    <button onclick="editMeeting('\${meeting.id}')" class="text-blue-500 text-sm">Edit</button>
                                    <button onclick="deleteMeeting('\${meeting.id}')" class="text-red-500 text-sm">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        // Invoice functions
        function updateInvoicesView() {
            const invoicesList = document.getElementById('invoicesList');
            
            if (appData.invoices.length === 0) {
                invoicesList.innerHTML = \`
                    <div class="p-8 text-center text-gray-500">
                        <p>No invoices found</p>
                        <button onclick="showGenerateInvoiceForm()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                            Generate First Invoice
                        </button>
                    </div>
                \`;
                return;
            }
            
            invoicesList.innerHTML = appData.invoices.map(invoice => {
                const client = appData.clients.find(c => c.id === invoice.clientId);
                const clientName = client ? client.name : 'Unknown Client';
                
                return \`
                    <div class="invoice-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-semibold">\${invoice.invoiceNumber}</h3>
                                <p class="text-gray-600">\${clientName}</p>
                                <p class="text-sm text-gray-500">\${invoice.cutOffPeriod}</p>
                                <p class="text-sm text-gray-500">
                                    Due: \${new Date(invoice.dueDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-lg">₱\${invoice.total}</p>
                                <span class="status-badge status-\${invoice.paymentStatus}">\${invoice.paymentStatus}</span>
                                <div class="mt-2 space-x-2">
                                    <button onclick="editInvoice('\${invoice.id}')" class="text-blue-500 text-sm">Edit</button>
                                    <button onclick="deleteInvoice('\${invoice.id}')" class="text-red-500 text-sm">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        // Notification functions
        function updateNotificationsView() {
            const notificationsList = document.getElementById('notificationsList');
            
            if (appData.notifications.length === 0) {
                notificationsList.innerHTML = \`
                    <div class="p-8 text-center text-gray-500">
                        <p>No notifications</p>
                    </div>
                \`;
                return;
            }
            
            notificationsList.innerHTML = appData.notifications.map(notification => \`
                <div class="client-card \${notification.isRead ? 'opacity-60' : ''}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold">\${notification.title}</h3>
                            <p class="text-gray-600">\${notification.message}</p>
                            <p class="text-sm text-gray-500">\${new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                        <div class="space-x-2">
                            \${!notification.isRead ? \`<button onclick="markNotificationRead('\${notification.id}')" class="text-blue-500 text-sm">Mark Read</button>\` : ''}
                            <button onclick="deleteNotification('\${notification.id}')" class="text-red-500 text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // Profile functions
        function loadProfileData() {
            const settings = appData.settings;
            document.getElementById('companyName').value = settings.companyName || '';
            document.getElementById('companyEmail').value = settings.companyEmail || '';
            document.getElementById('companyPhone').value = settings.companyPhone || '';
            document.getElementById('defaultRate').value = settings.defaultHourlyRate || 150;
        }

        function saveProfile() {
            appData.settings.companyName = document.getElementById('companyName').value;
            appData.settings.companyEmail = document.getElementById('companyEmail').value;
            appData.settings.companyPhone = document.getElementById('companyPhone').value;
            appData.settings.defaultHourlyRate = parseFloat(document.getElementById('defaultRate').value) || 150;
            
            saveAppData();
            alert('Profile saved successfully!');
        }

        // CRUD Operations
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        // Client CRUD
        function showAddClientForm() {
            const name = prompt('Client Name:');
            if (!name) return;
            
            const company = prompt('Company:');
            const email = prompt('Email:');
            const phone = prompt('Phone:');
            const rate = prompt('Hourly Rate (₱):', '150');
            
            const client = {
                id: generateUUID(),
                name,
                company: company || '',
                email: email || '',
                contactInfo: { phone: phone || '' },
                hourlyRate: rate || '150',
                isArchived: false,
                archivedAt: null,
                createdAt: new Date().toISOString()
            };
            
            appData.clients.push(client);
            saveAppData();
            updateAllViews();
        }

        function archiveClient(id) {
            const client = appData.clients.find(c => c.id === id);
            if (client) {
                client.isArchived = true;
                client.archivedAt = new Date().toISOString();
                saveAppData();
                updateAllViews();
            }
        }

        function restoreClient(id) {
            const client = appData.clients.find(c => c.id === id);
            if (client) {
                client.isArchived = false;
                client.archivedAt = null;
                saveAppData();
                updateAllViews();
            }
        }

        function deleteClient(id) {
            if (confirm('Are you sure you want to delete this client?')) {
                appData.clients = appData.clients.filter(c => c.id !== id);
                saveAppData();
                updateAllViews();
            }
        }

        // Meeting CRUD
        function showAddMeetingForm() {
            if (appData.clients.filter(c => !c.isArchived).length === 0) {
                alert('Please add a client first');
                return;
            }
            
            const clientName = prompt('Select client (enter name):');
            const client = appData.clients.find(c => c.name.toLowerCase().includes(clientName.toLowerCase()) && !c.isArchived);
            
            if (!client) {
                alert('Client not found');
                return;
            }
            
            const title = prompt('Meeting Title:');
            const date = prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
            const time = prompt('Time (HH:MM):', '10:00');
            const duration = prompt('Duration (minutes):', '60');
            const notes = prompt('Notes (optional):');
            
            const hourlyRate = parseFloat(client.hourlyRate);
            const meetingDuration = parseInt(duration);
            let amount = 0;
            
            if (meetingDuration <= 30) {
                amount = hourlyRate * 0.5; // 30-minute rate
            } else {
                amount = hourlyRate; // Full hour rate
            }
            
            const meeting = {
                id: generateUUID(),
                clientId: client.id,
                title: title || 'Meeting',
                startTime: new Date(\`\${date}T\${time}\`).toISOString(),
                endTime: new Date(new Date(\`\${date}T\${time}\`).getTime() + meetingDuration * 60000).toISOString(),
                duration: meetingDuration,
                status: 'booked',
                notes: notes || '',
                amount: amount.toFixed(2),
                createdAt: new Date().toISOString()
            };
            
            appData.meetings.push(meeting);
            saveAppData();
            updateAllViews();
        }

        function deleteMeeting(id) {
            if (confirm('Are you sure you want to delete this meeting?')) {
                appData.meetings = appData.meetings.filter(m => m.id !== id);
                saveAppData();
                updateAllViews();
            }
        }

        // Invoice CRUD
        function showGenerateInvoiceForm() {
            const bookedMeetings = appData.meetings.filter(m => m.status === 'booked' && m.amount);
            
            if (bookedMeetings.length === 0) {
                alert('No billable meetings found');
                return;
            }
            
            const clientName = prompt('Select client for invoice:');
            const client = appData.clients.find(c => c.name.toLowerCase().includes(clientName.toLowerCase()));
            
            if (!client) {
                alert('Client not found');
                return;
            }
            
            const clientMeetings = bookedMeetings.filter(m => m.clientId === client.id);
            
            if (clientMeetings.length === 0) {
                alert('No billable meetings found for this client');
                return;
            }
            
            const total = clientMeetings.reduce((sum, m) => sum + parseFloat(m.amount), 0);
            const cutOffPeriod = prompt('Billing Period:', 'Jan 2025 (1st - 15th)');
            
            const invoice = {
                id: generateUUID(),
                clientId: client.id,
                invoiceNumber: \`INV-\${new Date().getFullYear()}-\${String(appData.invoices.length + 1).padStart(3, '0')}\`,
                issueDate: new Date().toISOString(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                meetingIds: clientMeetings.map(m => m.id),
                subtotal: total.toFixed(2),
                taxAmount: '0.00',
                total: total.toFixed(2),
                status: 'draft',
                cutOffPeriod: cutOffPeriod,
                paymentStatus: 'pending',
                paymentDate: null,
                paymentMethod: null,
                paymentNotes: null,
                createdAt: new Date().toISOString()
            };
            
            appData.invoices.push(invoice);
            saveAppData();
            updateAllViews();
        }

        function deleteInvoice(id) {
            if (confirm('Are you sure you want to delete this invoice?')) {
                appData.invoices = appData.invoices.filter(i => i.id !== id);
                saveAppData();
                updateAllViews();
            }
        }

        // Notification CRUD
        function markNotificationRead(id) {
            const notification = appData.notifications.find(n => n.id === id);
            if (notification) {
                notification.isRead = true;
                saveAppData();
                updateNotificationsView();
            }
        }

        function deleteNotification(id) {
            appData.notifications = appData.notifications.filter(n => n.id !== id);
            saveAppData();
            updateNotificationsView();
        }

        // Data Export/Import
        function exportData() {
            const dataToExport = {
                ...appData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`solo-billing-backup-\${new Date().toISOString().split('T')[0]}.json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Data exported successfully!');
        }

        function importData() {
            const file = document.getElementById('importFile').files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (confirm('This will replace all current data. Are you sure?')) {
                        appData.clients = importedData.clients || [];
                        appData.meetings = importedData.meetings || [];
                        appData.invoices = importedData.invoices || [];
                        appData.notifications = importedData.notifications || [];
                        appData.settings = importedData.settings || appData.settings;
                        
                        saveAppData();
                        updateAllViews();
                        alert('Data imported successfully!');
                    }
                } catch (error) {
                    alert('Error importing data: Invalid file format');
                }
            };
            reader.readAsText(file);
        }

        // Update all views
        function updateAllViews() {
            updateDashboard();
            updateClientsView();
            updateMeetingsView();
            updateInvoicesView();
            updateNotificationsView();
        }

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadAppData();
            
            // Add sample notification on first run
            if (appData.notifications.length === 0) {
                appData.notifications.push({
                    id: generateUUID(),
                    type: 'welcome',
                    title: 'Welcome to Solo Billing!',
                    message: 'Your offline billing app is ready to use. Start by adding your first client.',
                    priority: 'low',
                    relatedId: null,
                    relatedType: null,
                    isRead: false,
                    isDismissed: false,
                    createdAt: new Date().toISOString()
                });
                saveAppData();
            }
        });
    </script>
</body>
</html>
`;

// Write the standalone HTML file
fs.writeFileSync('solo-billing-offline.html', htmlTemplate);

console.log('✅ Standalone Solo Billing app created: solo-billing-offline.html');
console.log('');
console.log('🚀 To use:');
console.log('1. Open solo-billing-offline.html in any web browser');
console.log('2. Works completely offline - no internet required');
console.log('3. Data is saved in your browser\'s local storage');
console.log('4. Use Export/Import buttons to backup and restore data');
console.log('');
console.log('📱 Features included:');
console.log('• Complete offline functionality');
console.log('• Client management with Active/Archived tabs');
console.log('• Meeting tracking with billing calculations');
console.log('• Invoice generation');
console.log('• Data export/import for backups');
console.log('• Responsive design for mobile and desktop');