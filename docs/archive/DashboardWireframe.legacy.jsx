import React, { useState } from 'react';

// Dashboard Wireframe - Modern Minimal Style
// Supports: View/Browse, Create/Edit, Search/Filter, Multi-step Process

export default function DashboardWireframe() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Sample data
  const stats = [
    { label: 'Total Users', value: '2,451', change: '+12%' },
    { label: 'Active Projects', value: '18', change: '+3' },
    { label: 'Tasks Completed', value: '847', change: '+24%' },
    { label: 'Revenue', value: '$12.4k', change: '+8%' },
  ];

  const recentItems = [
    { id: 1, title: 'Project Alpha', status: 'In Progress', date: '2 hours ago' },
    { id: 2, title: 'Design Review', status: 'Pending', date: '5 hours ago' },
    { id: 3, title: 'API Integration', status: 'Completed', date: '1 day ago' },
    { id: 4, title: 'User Research', status: 'In Progress', date: '2 days ago' },
  ];

  const filteredItems = recentItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo Placeholder */}
            <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
              Logo
            </div>
            {/* Navigation Tabs */}
            <nav className="flex gap-1">
              {['overview', 'projects', 'tasks', 'reports'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              + Create New
            </button>

            {/* User Avatar Placeholder */}
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-500">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Recent Items List */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Recent Items</h2>
              <div className="flex gap-2">
                {/* Filter Dropdown Placeholder */}
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200">
                  <option>All Status</option>
                  <option>In Progress</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  No items match your search
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      {/* Item Icon Placeholder */}
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Completed' ? 'bg-green-50 text-green-700' :
                        item.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                      {/* Action Button */}
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions / Activity */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {['New Project', 'Add Task', 'Generate Report', 'Invite Member'].map((action, i) => (
                  <button
                    key={i}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">+</div>
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { text: 'John updated Project Alpha', time: '2m ago' },
                  { text: 'New comment on Design Review', time: '15m ago' },
                  { text: 'Task completed: API docs', time: '1h ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-700">{activity.text}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Modal with Wizard/Process Flow */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Create New Item</h3>
              <button
                onClick={() => { setShowCreateModal(false); setWizardStep(1); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Wizard Progress */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map(step => (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        wizardStep >= step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step}
                      </div>
                      <span className={`text-sm ${wizardStep >= step ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step === 1 ? 'Details' : step === 2 ? 'Settings' : 'Review'}
                      </span>
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-0.5 mx-4 ${wizardStep > step ? 'bg-gray-900' : 'bg-gray-100'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="px-6 pb-4">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="Enter item name..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      placeholder="Add a description..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200">
                      <option>Select a category...</option>
                      <option>Project</option>
                      <option>Task</option>
                      <option>Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map(priority => (
                        <button
                          key={priority}
                          className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 focus:bg-gray-100 focus:border-gray-300 transition-colors"
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="text-gray-400">Name:</span> [Item Name]</p>
                      <p><span className="text-gray-400">Category:</span> Project</p>
                      <p><span className="text-gray-400">Priority:</span> Medium</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Review the details above and click "Create" to finish.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                className={`px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors ${wizardStep === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (wizardStep < 3) {
                    setWizardStep(wizardStep + 1);
                  } else {
                    setShowCreateModal(false);
                    setWizardStep(1);
                  }
                }}
                className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {wizardStep === 3 ? 'Create' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
