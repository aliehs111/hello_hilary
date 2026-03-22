import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "@/components/ConfirmModal";

const ROLES = ['user', 'power_user', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', display_name: '', password: '', role: 'user' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch('/api/users', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to create user');
      setUsers((prev) => [...prev, data.user]);
      setCreateForm({ email: '', display_name: '', password: '', role: 'user' });
      setShowCreate(false);
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ display_name: user.display_name, role: user.role, is_enabled: user.is_enabled, password: '' });
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      setUsers((prev) => prev.map((u) => u.id === id ? data.user : u));
      setEditingId(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/users/${confirmDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 px-6 pt-20 pb-12">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pink-800">User Management ⚙️</h1>
            <p className="mt-2 text-gray-600">Create and manage user accounts.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              ← Media CMS
            </Link>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="rounded-full bg-pink-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-pink-600 transition"
            >
              + New User
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="mb-8 rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-pink-800">Create New User</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Email</label>
                <input
                  type="email" required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Display Name</label>
                <input
                  type="text" required
                  value={createForm.display_name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, display_name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Password</label>
                <input
                  type="password" required
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            {createError && <p className="mt-3 text-sm text-red-600">{createError}</p>}
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={creating}
                className="rounded-full bg-pink-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-pink-600 transition disabled:opacity-50">
                {creating ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <p className="text-gray-600">Loading users…</p>
          </div>
        )}

        {!loading && err && (
          <div className="rounded-3xl border border-red-300 bg-red-100 p-6 text-center text-red-800">
            {err}
          </div>
        )}

        {!loading && !err && (
          <div className="overflow-x-auto rounded-3xl bg-white shadow-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-pink-100 text-pink-900">
                <tr>
                  <th className="px-4 py-4 text-left">Name</th>
                  <th className="px-4 py-4 text-left">Email</th>
                  <th className="px-4 py-4 text-left">Role</th>
                  <th className="px-4 py-4 text-left">Status</th>
                  <th className="px-4 py-4 text-left">Joined</th>
                  <th className="px-4 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="px-4 py-4">
                      {editingId === user.id ? (
                        <input
                          value={editForm.display_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, display_name: e.target.value }))}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900">{user.display_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{user.email}</td>
                    <td className="px-4 py-4">
                      {editingId === user.id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                          className="rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          user.role === 'admin' ? 'bg-pink-100 text-pink-800' :
                          user.role === 'power_user' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {editingId === user.id ? (
                        <button
                          type="button"
                          onClick={() => setEditForm((f) => ({ ...f, is_enabled: !f.is_enabled }))}
                          className={`rounded-full px-4 py-1 text-xs font-bold transition ${
                            editForm.is_enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {editForm.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          user.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {editingId === user.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="password"
                            placeholder="New password (optional)"
                            value={editForm.password}
                            onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(user.id)}
                              className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white hover:bg-pink-600 transition">
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(user)}
                            className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white hover:bg-blue-600 transition">
                            Edit
                          </button>
                          <button onClick={() => setConfirmDelete(user)}
                            className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600 transition">
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-10 text-center text-gray-600">No users found.</div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={`Delete ${confirmDelete?.display_name}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
