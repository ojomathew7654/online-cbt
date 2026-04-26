import { useEffect, useState } from "react";
import { Users, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { superAdminApi } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import {
  PageHeader,
  Card,
  Table,
  Th,
  Td,
  Tr,
  Loader,
  EmptyState,
  Badge,
  SearchInput,
  StatCard,
  Select,
  Modal,
  Input,
  Button,
  ConfirmDialog,
} from "../../components";
import { getErrorMessage } from "../../utils/helpers";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

const emptyEditForm = { name: "", username: "", password: "", role: "ADMIN" };

export default function SuperAdminUsersPage() {
  const toast = useToast();

  const [schools, setSchools] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [search, setSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set(),
  );

  // ── Edit / Delete state ───────────────────────────────────────────────────
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Load schools ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true);
      try {
        const res = await superAdminApi.getSchools();
        setSchools(res.data);
        if (res.data.length > 0) setSelectedSchoolId(res.data[0].id);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  // ── Load users for selected school ────────────────────────────────────────
  const fetchUsers = async (schoolId: string) => {
    setLoadingUsers(true);
    setVisiblePasswords(new Set());
    try {
      const res = await superAdminApi.getSchoolUsers(schoolId);
      setUsers(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!selectedSchoolId) return;
    fetchUsers(selectedSchoolId);
  }, [selectedSchoolId]);

  // ── Password visibility ───────────────────────────────────────────────────
  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (u: any) => {
    setSelectedUser(u);
    setEditForm({
      name: u.name || "",
      username: u.username || "",
      password: "",
      role: u.role || "ADMIN",
    });
    setShowEditPassword(false);
    setEditModal(true);
  };

  const handleEdit = async () => {
    const trimmed = {
      name: editForm.name.trim(),
      username: editForm.username.trim(),
      password: editForm.password.trim(),
      role: editForm.role,
    };

    if (!trimmed.username) {
      toast.error("Username is required.");
      return;
    }

    // Only include password if user actually typed one
    const payload: any = {
      name: trimmed.name,
      username: trimmed.username,
      role: trimmed.role,
    };
    if (trimmed.password) payload.password = trimmed.password;

    setSaving(true);
    try {
      const res = await superAdminApi.updateUser(selectedUser.id, payload);
      toast.success("User updated successfully.");
      setEditModal(false);
      setSelectedUser(null);
      // Update in-place — no full reload needed
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? res.data : u)),
      );
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete = (u: any) => {
    setSelectedUser(u);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await superAdminApi.deleteUser(selectedUser.id);
      toast.success("User deleted.");
      setDeleteConfirm(false);
      setSelectedUser(null);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  const schoolOptions = schools.map((s) => ({
    value: s.id,
    label: s.fullName || s.name,
  }));

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = filtered.filter((u) => u.role === "ADMIN").length;
  const userCount = filtered.filter((u) => u.role === "USER").length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <PageHeader
        title="School Users"
        subtitle="View and manage login credentials for all staff accounts"
        icon={<Users size={20} />}
      />

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="Total Users"
          value={filtered.length}
          icon={<Users size={18} />}
          accent
        />
        <StatCard
          label="Admins"
          value={adminCount}
          icon={<Users size={18} />}
        />
        <StatCard
          className="col-span-2 sm:col-span-1"
          label="Staff"
          value={userCount}
          icon={<Users size={18} />}
        />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-4">
        <div className="w-full sm:w-64">
          <Select
            label=""
            options={schoolOptions}
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            placeholder="Select school..."
          />
        </div>
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or username..."
          />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card padding={false}>
        {loadingSchools || loadingUsers ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={40} />}
            title={
              search
                ? "No users match your search"
                : "No users found for this school"
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Username</Th>
                <Th>Password</Th>
                <Th className="hidden sm:table-cell">Role</Th>
                <Th className="hidden md:table-cell">School</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isVisible = visiblePasswords.has(u.id);
                return (
                  <Tr key={u.id}>
                    <Td>
                      <p className="m-0 font-medium text-white text-[13px]">
                        {u.name || "—"}
                      </p>
                    </Td>
                    <Td className="font-mono text-[12px] text-primary">
                      {u.username}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] text-light">
                          {isVisible ? u.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(u.id)}
                          className="text-light hover:text-white transition-colors shrink-0"
                          title={isVisible ? "Hide password" : "Show password"}
                        >
                          {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">
                      <Badge
                        variant={u.role === "ADMIN" ? "warning" : "info"}
                        dot
                      >
                        {u.role}
                      </Badge>
                    </Td>
                    <Td className="hidden md:table-cell text-light text-[12px]">
                      {selectedSchool?.fullName || selectedSchool?.name || "—"}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-md cursor-pointer text-light hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit user"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-1.5 rounded-md cursor-pointer text-light hover:text-danger hover:bg-danger/10 transition-all"
                          title="Delete user"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {/* ── Edit User Modal ───────────────────────────────────────────────── */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit User"
      >
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Adeyemi"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Username"
            placeholder="e.g. john.admin"
            value={editForm.username}
            onChange={(e) =>
              setEditForm({ ...editForm, username: e.target.value })
            }
            required
          />
          <Input
            label="Password"
            type={showEditPassword ? "text" : "password"}
            placeholder="Leave blank to keep current..."
            value={editForm.password}
            onChange={(e) =>
              setEditForm({ ...editForm, password: e.target.value })
            }
            hint="Leave blank to keep current password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowEditPassword((v) => !v)}
                className="text-light hover:text-white transition-colors"
              >
                {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          />
          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button loading={saving} onClick={handleEdit} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name || selectedUser?.username}"? This cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
