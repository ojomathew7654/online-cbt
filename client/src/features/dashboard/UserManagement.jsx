import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTrash,
  FaUser,
  FaUsers,
  FaTimes,
  FaSave,
  FaUserShield,
  FaBook,
  FaClipboardList,
} from "react-icons/fa";

import { FiRefreshCw } from "react-icons/fi";
import { apiUrl, getError } from "../../utils";
import Spinner from "../../components/ui/Spinner";
import AlertDialog from "../../components/ui/AlertDialog";
import Dialog from "../../components/ui/Dialog";

/*
|--------------------------------------------------------------------------
| Initial form
|--------------------------------------------------------------------------
*/
const initialForm = {
  username: "",
  password: "",
  name: "",
  gender: "",
  role: "USER",
};

/*
|--------------------------------------------------------------------------
| User Management
|--------------------------------------------------------------------------
*/

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [assignedExams, setAssignedExams] = useState([]);
  const [selectedAssignmentUser, setSelectedAssignmentUser] = useState(null);

  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [removingAssignment, setRemovingAssignment] = useState(false);

  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showRemoveAssignmentDialog, setShowRemoveAssignmentDialog] =
    useState(false);

  const [assignmentToRemove, setAssignmentToRemove] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const loggedInStudent = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInStudent"));
    } catch {
      return null;
    }
  }, []);

  const schoolId = loggedInStudent?.schoolId;

  const handleViewAssignedExams = async (user) => {
    try {
      setLoadingAssignments(true);

      setSelectedAssignmentUser(user);
      setAssignedExams([]);
      setShowAssignmentsModal(true);

      const { data } = await axios.get(
        `${apiUrl}/api/user-exams/user/${user.id}`,
      );
      console.log(data);

      setAssignedExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assigned exams:", err);

      setShowAssignmentsModal(false);

      showAlert(getError(err) || "Failed to load the user's assigned exams.");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const openRemoveAssignmentDialog = (assignment) => {
    setAssignmentToRemove(assignment);
    setShowRemoveAssignmentDialog(true);
  };

  const closeRemoveAssignmentDialog = () => {
    if (removingAssignment) return;

    setShowRemoveAssignmentDialog(false);
    setAssignmentToRemove(null);
  };

  const handleRemoveAssignment = async () => {
    if (!selectedAssignmentUser?.id || !assignmentToRemove?.examId) {
      return;
    }

    try {
      setRemovingAssignment(true);

      await axios.delete(
        `${apiUrl}/api/user-exams/${selectedAssignmentUser.id}/${assignmentToRemove.examId}`,
      );

      setAssignedExams((previous) =>
        previous.filter(
          (assignment) => assignment.examId !== assignmentToRemove.examId,
        ),
      );

      setShowRemoveAssignmentDialog(false);
      setAssignmentToRemove(null);

      showAlert("The examination was successfully removed from this user.");
    } catch (err) {
      console.error("Failed to remove exam assignment:", err);

      showAlert(getError(err) || "Failed to remove the examination.");
    } finally {
      setRemovingAssignment(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch all users
  |--------------------------------------------------------------------------
  */

  const fetchUsers = async (showRefreshLoader = false) => {
    if (!schoolId) {
      setError("No school information found for the logged-in user.");
      setLoading(false);
      return;
    }

    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await axios.get(
        `${apiUrl}/api/users/school/${schoolId}/users`,
      );

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      setError(getError(err) || "Failed to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchUsers();
  }, [schoolId]);

  /*
  |--------------------------------------------------------------------------
  | Filter users
  |--------------------------------------------------------------------------
  */

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.username?.toLowerCase().includes(searchValue) ||
        user.name?.toLowerCase().includes(searchValue);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  /*
  |--------------------------------------------------------------------------
  | Form input
  |--------------------------------------------------------------------------
  */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Open Add modal
  |--------------------------------------------------------------------------
  */

  const openAddModal = () => {
    setEditingUser(null);
    setForm(initialForm);
    setError("");
    setShowFormModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | GET SINGLE USER
  |--------------------------------------------------------------------------
  */

  const handleViewUser = async (user) => {
    try {
      setError("");

      const { data } = await axios.get(`${apiUrl}/api/users/${user.id}`);

      setSelectedUser(data);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch user:", err);

      setError(getError(err) || "Failed to load user details.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open Edit modal
  |--------------------------------------------------------------------------
  */

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      username: user.username || "",
      password: "",
      name: user.name || "",
      gender: user.gender || "",
      role: user.role || "USER",
    });

    setError("");
    setShowFormModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE USER
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!schoolId) {
      setError("School information is missing.");
      return;
    }

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setError("Password is required when creating a user.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        const payload = {
          username: form.username.trim(),
          name: form.name.trim(),
          gender: form.gender,
          role: form.role,
        };

        // Only send password if admin entered a new one.
        if (form.password.trim()) {
          payload.password = form.password;
        }

        const { data } = await axios.put(
          `${apiUrl}/api/users/${editingUser.id}`,
          payload,
        );

        setUsers((previousUsers) =>
          previousUsers.map((user) =>
            user.id === editingUser.id ? data : user,
          ),
        );
      } else {
        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        const payload = {
          username: form.username.trim(),
          password: form.password,
          name: form.name.trim(),
          gender: form.gender,
          role: form.role,
          schoolId,
        };

        const { data } = await axios.post(
          `${apiUrl}/api/users/create-user`,
          payload,
        );

        setUsers((previousUsers) => [data, ...previousUsers]);
      }

      setForm(initialForm);
      setEditingUser(null);
      setShowFormModal(false);
    } catch (err) {
      console.error("Failed to save user:", err);

      setError(getError(err) || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE USER
  |--------------------------------------------------------------------------
  */

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setError("");
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete?.id) return;

    try {
      setDeleting(true);
      setError("");

      await axios.delete(`${apiUrl}/api/users/${userToDelete.id}`);

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user.id !== userToDelete.id),
      );

      setUserToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete user:", err);

      setError(getError(err) || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close modal
  |--------------------------------------------------------------------------
  */

  const closeFormModal = () => {
    if (saving) return;

    setShowFormModal(false);
    setEditingUser(null);
    setForm(initialForm);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-bg px-6">
        <Spinner size="4rem" />
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <section className="min-h-screen bg-bg px-3 py-5 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =========================================================
            HEADER
        ========================================================== */}

        <header className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FaUsers className="text-2xl" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-light">
                  Administration
                </p>

                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  User Management
                </h1>

                <p className="mt-1 text-sm text-light">
                  Create, view, edit and manage system users.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                py-3
                text-sm
                font-bold
                text-bg
                transition
                hover:brightness-110
              "
            >
              <FaPlus />
              Add User
            </button>
          </div>
        </header>

        {/* =========================================================
            ERROR
        ========================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-danger/30 bg-danger-variant px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* =========================================================
            STATS
        ========================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light">Total Users</p>

                <p className="mt-1 text-3xl font-bold text-white">
                  {users.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FaUsers />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light">Administrators</p>

                <p className="mt-1 text-3xl font-bold text-white">
                  {users.filter((user) => user.role === "ADMIN").length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-variant text-warning">
                <FaUserShield />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light">Regular Users</p>

                <p className="mt-1 text-3xl font-bold text-white">
                  {users.filter((user) => user.role === "USER").length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-variant text-success">
                <FaUser />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            TABLE CONTAINER
        ========================================================== */}

        <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
          {/* Search / Filter */}
          <div className="border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-light" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search username or name..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-bg
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-light
                    focus:border-primary
                  "
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-bg
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-primary
                  "
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="USER">Users</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchUsers(true)}
                  disabled={refreshing}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-border
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-light
                    transition
                    hover:bg-white/5
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* =======================================================
              DESKTOP TABLE
          ======================================================== */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-light">
                    User
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-light">
                    Username
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-light">
                    Gender
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-light">
                    Role
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-light">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-b-0 hover:bg-white/[0.02]"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-variant font-semibold text-primary">
                            {(user.name || user.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {user.name || "No name"}
                            </p>

                            <p className="text-xs text-light">User account</p>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-5 py-4 text-sm text-white">
                        {user.username}
                      </td>

                      {/* Gender */}
                      <td className="px-5 py-4 text-sm text-light">
                        {user.gender || "Not specified"}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            title="View user"
                            onClick={() => handleViewUser(user)}
                          >
                            <FaEye />
                          </ActionButton>

                          <ActionButton
                            title="View assigned exams"
                            onClick={() => handleViewAssignedExams(user)}
                          >
                            <FaClipboardList />
                          </ActionButton>

                          <ActionButton
                            title="Edit user"
                            onClick={() => openEditModal(user)}
                          >
                            <FaEdit />
                          </ActionButton>

                          <ActionButton
                            title="Delete user"
                            danger
                            onClick={() => openDeleteModal(user)}
                          >
                            <FaTrash />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center">
                      <FaUsers className="mx-auto text-4xl text-light" />

                      <p className="mt-3 font-medium text-white">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-light">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =======================================================
              MOBILE CARDS
          ======================================================== */}

          <div className="divide-y divide-border md:hidden">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-variant font-semibold text-primary">
                        {(user.name || user.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {user.name || "No name"}
                        </p>

                        <p className="truncate text-sm text-light">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <RoleBadge role={user.role} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-bg p-3">
                    <div>
                      <p className="text-xs text-light">Gender</p>
                      <p className="mt-1 text-sm text-white">
                        {user.gender || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-light">Username</p>
                      <p className="mt-1 truncate text-sm text-white">
                        {user.username}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => handleViewUser(user)}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-border
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-light
                        hover:bg-white/5
                        hover:text-white
                      "
                    >
                      <FaEye />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-primary/30
                        bg-primary-variant
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-primary
                      "
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(user)}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-danger/30
                        bg-danger-variant
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-danger
                      "
                    >
                      <FaTrash />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewAssignedExams(user)}
                      className="
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    border-primary/30
    bg-primary-variant
    px-3
    py-2
    text-xs
    font-semibold
    text-primary
  "
                    >
                      <FaClipboardList />
                      Exams
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <FaUsers className="mx-auto text-4xl text-light" />

                <p className="mt-3 font-medium text-white">No users found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-light">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">{users.length}</span>{" "}
              users
            </p>
          </div>
        </div>
      </div>

      {/* =============================================================
          ADD / EDIT USER MODAL
      ============================================================= */}

      {showFormModal && (
        <ModalOverlay onClose={closeFormModal}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-deep shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>

                <p className="mt-1 text-xs text-light">
                  {editingUser
                    ? "Update the user's account information."
                    : "Create a new system user for this school."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="rounded-lg p-2 text-light hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5 sm:p-6">
                {/* Username */}
                <FormField label="Username" required>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    autoComplete="username"
                    className={inputClass}
                  />
                </FormField>

                {/* Name */}
                <FormField label="Full Name">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={inputClass}
                  />
                </FormField>

                {/* Password */}
                <FormField
                  label={editingUser ? "New Password" : "Password"}
                  required={!editingUser}
                >
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    autoComplete={editingUser ? "new-password" : "new-password"}
                    className={inputClass}
                  />

                  {editingUser && (
                    <p className="mt-1.5 text-xs text-light">
                      Leave this empty if you don't want to change the password.
                    </p>
                  )}
                </FormField>

                {/* Gender + Role */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Gender">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </FormField>

                  <FormField label="Role">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-border p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="
                    rounded-xl
                    border
                    border-border
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-light
                    hover:bg-white/5
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-bg
                    transition
                    hover:brightness-110
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      {editingUser ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingUser ? <FaSave /> : <FaPlus />}
                      {editingUser ? "Update User" : "Create User"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* =============================================================
          VIEW USER MODAL
      ============================================================= */}

      {showViewModal && selectedUser && (
        <ModalOverlay onClose={closeViewModal}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-deep shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-white">User Details</h2>

                <p className="mt-1 text-xs text-light">Account information</p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg p-2 text-light hover:bg-white/5 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {/* Avatar */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-variant text-3xl font-bold text-primary">
                  {(selectedUser.name || selectedUser.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h3 className="mt-3 text-xl font-bold text-white">
                  {selectedUser.name || "No name"}
                </h3>

                <p className="text-sm text-light">@{selectedUser.username}</p>

                <div className="mt-3">
                  <RoleBadge role={selectedUser.role} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <DetailRow label="Username" value={selectedUser.username} />

                <DetailRow
                  label="Full Name"
                  value={selectedUser.name || "Not specified"}
                />

                <DetailRow
                  label="Gender"
                  value={selectedUser.gender || "Not specified"}
                />

                <DetailRow
                  label="Role"
                  value={selectedUser.role || "Not specified"}
                />

                <DetailRow
                  label="School ID"
                  value={selectedUser.schoolId || "Not assigned"}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  closeViewModal();
                  openEditModal(selectedUser);
                }}
                className="
                  mt-6
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-bg
                  hover:brightness-110
                "
              >
                <FaEdit />
                Edit User
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* =============================================================
          DELETE MODAL
      ============================================================= */}

      {showDeleteModal && userToDelete && (
        <ModalOverlay onClose={closeDeleteModal}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-deep p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-variant text-danger">
              <FaTrash />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">Delete User?</h2>

            <p className="mt-2 text-sm leading-6 text-light">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {userToDelete.name || userToDelete.username}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="
                  rounded-xl
                  border
                  border-border
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-light
                  hover:bg-white/5
                  hover:text-white
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-danger
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  hover:brightness-110
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deleting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {/* =============================================================
    ASSIGNED EXAMS MODAL
============================================================= */}

      {showAssignmentsModal && selectedAssignmentUser && (
        <ModalOverlay
          onClose={() => {
            if (loadingAssignments || removingAssignment) return;

            setShowAssignmentsModal(false);
            setSelectedAssignmentUser(null);
            setAssignedExams([]);
          }}
        >
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-bg-deep shadow-2xl">
            {/* =========================================================
          HEADER
      ========================================================== */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">
                  Assigned Examinations
                </h2>

                <p className="mt-1 truncate text-xs text-light">
                  {selectedAssignmentUser.name ||
                    selectedAssignmentUser.username}{" "}
                  — @{selectedAssignmentUser.username}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (loadingAssignments || removingAssignment) return;

                  setShowAssignmentsModal(false);
                  setSelectedAssignmentUser(null);
                  setAssignedExams([]);
                }}
                disabled={loadingAssignments || removingAssignment}
                className="
            rounded-lg
            p-2
            text-light
            transition
            hover:bg-white/5
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
              >
                <FaTimes />
              </button>
            </div>

            {/* =========================================================
          SUMMARY
      ========================================================== */}
            <div className="grid grid-cols-2 gap-3 border-b border-border p-5 sm:grid-cols-3 sm:p-6">
              {/* Total assigned examinations */}
              <AssignmentStat
                label="Assigned Exams"
                value={assignedExams.length}
                icon={<FaBook />}
              />

              {/* Number of unique subjects */}
              <AssignmentStat
                label="Subjects"
                value={
                  new Set(
                    assignedExams
                      .map((exam) => exam.subjectName)
                      .filter(Boolean),
                  ).size
                }
                icon={<FaClipboardList />}
              />

              {/* User role */}
              <AssignmentStat
                label="User"
                value={
                  selectedAssignmentUser.role === "USER" ? "User" : "Admin"
                }
                icon={<FaUser />}
              />
            </div>

            {/* =========================================================
          CONTENT
      ========================================================== */}
            <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
              {loadingAssignments ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <Spinner size="3rem" />
                </div>
              ) : assignedExams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-bg p-8 text-center">
                  <FaClipboardList className="mx-auto text-4xl text-light" />

                  <h3 className="mt-4 font-semibold text-white">
                    No examinations assigned
                  </h3>

                  <p className="mt-1 text-sm text-light">
                    This user currently has no assigned examinations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedExams.map((exam) => (
                    <div
                      key={exam.assignmentId}
                      className="
                  rounded-2xl
                  border
                  border-border
                  bg-bg
                  p-4
                  transition
                  hover:border-primary/30
                "
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Exam information */}
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary-variant
                        text-primary
                      "
                          >
                            <FaBook />
                          </div>

                          <div className="min-w-0">
                            {/* Subject */}
                            <p className="font-semibold text-white">
                              {exam.subjectName}
                            </p>

                            {/* Exam details */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <InfoBadge>{exam.level?.toUpperCase()}</InfoBadge>

                              <InfoBadge>{exam.termType}</InfoBadge>

                              <InfoBadge>
                                {exam.questionCount}{" "}
                                {exam.questionCount === 1
                                  ? "Question"
                                  : "Questions"}
                              </InfoBadge>

                              <InfoBadge>
                                {formatExamDuration(exam.examDuration)}
                              </InfoBadge>
                            </div>

                            {/* Assignment date */}
                            <p className="mt-2 text-xs text-light">
                              Assigned{" "}
                              {new Date(exam.assignedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => openRemoveAssignmentDialog(exam)}
                          disabled={removingAssignment}
                          className="
                      inline-flex
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-danger/30
                      bg-danger-variant
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-danger
                      transition
                      hover:border-danger/50
                      hover:brightness-110
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                        >
                          <FaTrash />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =========================================================
          FOOTER
      ========================================================== */}
            <div className="flex items-center justify-between border-t border-border px-5 py-4 sm:px-6">
              <p className="text-xs text-light">
                {assignedExams.length}{" "}
                {assignedExams.length === 1 ? "examination" : "examinations"}{" "}
                assigned
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowAssignmentsModal(false);
                  setSelectedAssignmentUser(null);
                  setAssignedExams([]);
                }}
                disabled={loadingAssignments || removingAssignment}
                className="
            rounded-xl
            border
            border-border
            px-5
            py-2.5
            text-sm
            font-semibold
            text-light
            transition
            hover:bg-white/5
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
              >
                Close
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* =============================================================
    REMOVE ASSIGNMENT CONFIRMATION
============================================================= */}

      {showRemoveAssignmentDialog && assignmentToRemove && (
        <Dialog
          setOpenDialog={setShowRemoveAssignmentDialog}
          loading={removingAssignment}
          title="Remove Exam Assignment"
          message={
            <>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-white">
                {assignmentToRemove.Exam?.name ||
                  assignmentToRemove.exam?.name ||
                  assignmentToRemove.Exam?.title ||
                  assignmentToRemove.exam?.title ||
                  "this examination"}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-white">
                {selectedAssignmentUser?.name ||
                  selectedAssignmentUser?.username}
              </span>
              ?
            </>
          }
          action={handleRemoveAssignment}
        />
      )}
      {alertOpen && (
        <AlertDialog setOpenAlert={setAlertOpen} message={alertMessage} />
      )}
    </section>
  );
};

/*
|--------------------------------------------------------------------------
| Small reusable components
|--------------------------------------------------------------------------
*/

const RoleBadge = ({ role }) => {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          isAdmin
            ? "bg-warning-variant text-warning"
            : "bg-primary-variant text-primary"
        }
      `}
    >
      {isAdmin ? "Administrator" : "User"}
    </span>
  );
};

const ActionButton = ({ children, title, onClick, danger = false }) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        border
        transition
        ${
          danger
            ? "border-danger/30 bg-danger-variant text-danger hover:border-danger/50"
            : "border-border text-light hover:border-primary/40 hover:bg-primary-variant hover:text-primary"
        }
      `}
    >
      {children}
    </button>
  );
};

const FormField = ({ label, required = false, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white">
        {label}

        {required && <span className="ml-1 text-danger">*</span>}
      </label>

      {children}
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-bg p-3">
      <span className="text-xs text-light">{label}</span>

      <span className="max-w-[65%] break-all text-right text-sm font-medium text-white">
        {value}
      </span>
    </div>
  );
};

const ModalOverlay = ({ children, onClose }) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/70
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
};

const inputClass = `
  w-full
  rounded-xl
  border
  border-border
  bg-bg
  px-4
  py-3
  text-sm
  text-white
  outline-none
  placeholder:text-light
  focus:border-primary
  focus:ring-1
  focus:ring-primary/30
`;
const AssignmentStat = ({ label, value, icon }) => {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-light">{label}</p>

          <p className="mt-1 text-xl font-bold text-white">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-variant text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoBadge = ({ children }) => {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-lg
        border
        border-border
        bg-bg-deep
        px-2.5
        py-1
        text-xs
        font-medium
        text-light
      "
    >
      {children}
    </span>
  );
};

const formatExamDuration = (seconds) => {
  if (!seconds || seconds <= 0) {
    return "No duration";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

export default UserManagement;
