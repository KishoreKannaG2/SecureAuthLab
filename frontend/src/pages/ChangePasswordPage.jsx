import { useState } from 'react'
import { authAPI } from '../services/api.js'
import { Lock, Eye, EyeOff } from 'lucide-react'

function PasswordField({
  label,
  field,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleVisibility,
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-cyber-accent mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-cyber-panel border border-cyber-border rounded-lg text-cyber-text placeholder-cyber-border focus:outline-none focus:ring-2 focus:ring-cyber-accent transition"
        />
        <button
          type="button"
          onClick={() => onToggleVisibility(field)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-border hover:text-cyber-accent transition"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const validatePasswords = () => {
    if (!oldPassword) {
      setMessage('Old password is required.')
      setMessageType('error')
      return false
    }
    if (!newPassword) {
      setMessage('New password is required.')
      setMessageType('error')
      return false
    }
    if (!confirmPassword) {
      setMessage('Confirm password is required.')
      setMessageType('error')
      return false
    }
    if (newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.')
      setMessageType('error')
      return false
    }
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.')
      setMessageType('error')
      return false
    }
    if (newPassword === oldPassword) {
      setMessage('New password must be different from old password.')
      setMessageType('error')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!validatePasswords()) {
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.changePassword(oldPassword, newPassword, confirmPassword)
      setMessageType('success')
      setMessage(res.data.message || 'Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessageType('error')
      setMessage(err.response?.data?.message || err.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center">
            <Lock size={20} className="text-cyber-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-cyber-accent">Change Password</h1>
            <p className="text-sm text-cyber-accent">Update your account password</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border text-sm font-display ${
              messageType === 'success'
                ? 'bg-green-900/20 border-green-500/30 text-green-300'
                : 'bg-red-900/20 border-red-500/30 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="panel p-6 rounded-xl border border-cyber-border bg-cyber-panel">
          <PasswordField
            label="Current Password"
            field="old"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder="Enter your current password"
            showPassword={showPasswords.old}
            onToggleVisibility={togglePasswordVisibility}
          />

          <div className="my-6 py-6 border-t border-b border-cyber-border/30">
            <div className="text-xs text-cyber-border font-mono mb-3">PASSWORD REQUIREMENTS:</div>
            <ul className="text-xs text-cyber-border space-y-1">
              <li className={newPassword.length >= 6 ? 'text-green-400' : ''}>
                ✓ At least 6 characters
              </li>
              <li className={newPassword && newPassword !== oldPassword ? 'text-green-400' : ''}>
                ✓ Different from current password
              </li>
              <li className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-400' : ''}>
                ✓ Passwords match
              </li>
            </ul>
          </div>

          <PasswordField
            label="New Password"
            field="new"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            showPassword={showPasswords.new}
            onToggleVisibility={togglePasswordVisibility}
          />

          <PasswordField
            label="Confirm New Password"
            field="confirm"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            showPassword={showPasswords.confirm}
            onToggleVisibility={togglePasswordVisibility}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-6 bg-cyber-accent text-cyber-bg font-semibold rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        <div className="mt-4 text-xs text-cyber-border text-center">
          💡 Keep your password secure. Never share it with anyone.
        </div>
      </div>
    </div>
  )
}
