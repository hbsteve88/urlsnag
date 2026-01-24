'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (groupName: string) => void
  selectedCount: number
  isLoading?: boolean
}

export default function GroupModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false,
}: GroupModalProps) {
  const [groupName, setGroupName] = useState('')

  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(groupName)
      setGroupName('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Create Domain Group</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            You are grouping <span className="font-semibold">{selectedCount} domain{selectedCount !== 1 ? 's' : ''}</span> together. They will be sold as a bundle.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g., Tech Startup Bundle"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!groupName.trim() || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}
