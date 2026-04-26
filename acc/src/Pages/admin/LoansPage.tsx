import { useEffect, useState } from "react";
import {
  Landmark,
  Plus,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { loansApi, accountsApi } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import {
  Button,
  Input,
  Select,
  Modal,
  Badge,
  Loader,
  Textarea,
  PageHeader,
  Card,
  Table,
  Th,
  Td,
  Tr,
  EmptyState,
  StatCard,
} from "../../components";
import { fmt, getErrorMessage } from "../../utils/helpers";

export default function LoansPage() {
  const { accountingAuth } = useApp();
  const { schoolId, userId, currentSessionId } = accountingAuth;
  const toast = useToast();

  const [loans, setLoans] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [recordModal, setRecordModal] = useState(false);
  const [repayModal, setRepayModal] = useState<any | null>(null); // holds the loan being repaid
  const [saving, setSaving] = useState(false);

  // ── Expanded repayment history ────────────────────────────────────────────
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  // ── Record loan form ──────────────────────────────────────────────────────
  const [form, setForm] = useState({
    amount: "",
    lender: "",
    description: "",
    dateReceived: new Date().toISOString().split("T")[0],
    repaymentDate: "",
    liabilityAccountId: "",
    cashAccountId: "",
  });

  // ── Repay form ────────────────────────────────────────────────────────────
  const [repayForm, setRepayForm] = useState({ amount: "", note: "" });

  // ── Derived ───────────────────────────────────────────────────────────────
  const liabilityAccounts = accounts
    .filter((a) => a.accountType === "LIABILITY" && a.isActive)
    .map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }));

  const cashAccounts = accounts
    .filter((a) => a.accountType === "ASSET" && a.isActive)
    .map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }));

  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + (l.amount - l.amountRepaid),
    0,
  );
  const totalRepaid = loans.reduce((sum, l) => sum + l.amountRepaid, 0);
  const totalBorrowed = loans.reduce((sum, l) => sum + l.amount, 0);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const [lRes, aRes] = await Promise.all([
        loansApi.getAll(schoolId, { sessionId: currentSessionId || undefined }),
        accountsApi.getAll(schoolId),
      ]);
      setLoans(lRes.data);
      setAccounts(aRes.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [schoolId, currentSessionId]);

  // ── Record new loan ───────────────────────────────────────────────────────
  const handleRecord = async () => {
    if (
      !form.amount ||
      !form.lender ||
      !form.dateReceived ||
      !form.liabilityAccountId ||
      !form.cashAccountId
    ) {
      toast.error("All required fields must be filled.");
      return;
    }
    setSaving(true);
    try {
      await loansApi.record({
        ...form,
        amount: parseFloat(form.amount),
        sessionId: currentSessionId,
        schoolId,
        createdById: userId,
      });
      toast.success("Loan recorded and journal entry created.");
      setRecordModal(false);
      setForm({
        amount: "",
        lender: "",
        description: "",
        dateReceived: new Date().toISOString().split("T")[0],
        repaymentDate: "",
        liabilityAccountId: "",
        cashAccountId: "",
      });
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  // ── Repay loan (partial or full) ──────────────────────────────────────────
  const handleRepay = async () => {
    if (!repayModal) return;

    const amount = parseFloat(repayForm.amount);
    const balance = repayModal.amount - repayModal.amountRepaid;

    if (!repayForm.amount || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid repayment amount.");
      return;
    }
    if (amount > balance) {
      toast.error(
        `Amount exceeds remaining balance of ${fmt.currency(balance)}.`,
      );
      return;
    }

    setSaving(true);
    try {
      const res = await loansApi.repay(repayModal.id, {
        amount,
        note: repayForm.note || undefined,
      });
      toast.success(res.data.message);
      setRepayModal(null);
      setRepayForm({ amount: "", note: "" });
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLoans((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openRepayModal = (loan: any) => {
    setRepayForm({ amount: "", note: "" });
    setRepayModal(loan);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <PageHeader
        title="Loans"
        subtitle="Track borrowed funds and repayment progress"
        icon={<Landmark size={20} />}
        action={
          <Button
            leftIcon={<Plus size={15} />}
            onClick={() => setRecordModal(true)}
          >
            <span className="hidden sm:inline">Record Loan</span>
            <span className="sm:hidden">Record</span>
          </Button>
        }
      />

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="Active Loans"
          value={activeLoans.length}
          icon={<Landmark size={18} />}
          sub={`${loans.length} total`}
        />
        <StatCard
          label="Total Borrowed"
          value={fmt.currency(totalBorrowed)}
          icon={<Landmark size={18} />}
          sub="All sessions"
        />
        <StatCard
          label="Total Repaid"
          value={fmt.currency(totalRepaid)}
          icon={<Landmark size={18} />}
        />
        <StatCard
          label="Still Owed"
          value={fmt.currency(totalOutstanding)}
          icon={<Landmark size={18} />}
          accent
        />
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card padding={false}>
        {loading ? (
          <Loader />
        ) : loans.length === 0 ? (
          <EmptyState
            icon={<Landmark size={40} />}
            title="No loans recorded"
            action={
              <Button onClick={() => setRecordModal(true)}>Record Loan</Button>
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Lender</Th>
                <Th>Original</Th>
                <Th>Repaid</Th>
                <Th>Balance</Th>
                <Th className="hidden md:table-cell">Due Date</Th>
                <Th className="hidden lg:table-cell">Account</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => {
                const balance = l.amount - l.amountRepaid;
                const repaidPct =
                  l.amount > 0
                    ? Math.round((l.amountRepaid / l.amount) * 100)
                    : 0;
                const isExpanded = expandedLoans.has(l.id);
                const hasRepayments = l.repayments?.length > 0;

                return (
                  <>
                    <Tr
                      key={l.id}
                      clickable={hasRepayments}
                      onClick={
                        hasRepayments ? () => toggleExpand(l.id) : undefined
                      }
                    >
                      {/* Lender */}
                      <Td>
                        <p className="m-0 font-semibold text-white text-[13px]">
                          {l.lender}
                        </p>
                        {l.description && (
                          <p className="m-0 text-[11px] text-light hidden sm:block">
                            {l.description}
                          </p>
                        )}
                        <p className="m-0 text-[11px] text-light sm:hidden">
                          {fmt.date(l.dateReceived)}
                        </p>
                      </Td>

                      {/* Original amount */}
                      <Td className="whitespace-nowrap text-[13px] font-medium">
                        {fmt.currency(l.amount)}
                      </Td>

                      {/* Repaid + progress bar */}
                      <Td>
                        <p className="m-0 text-success text-[13px] font-medium whitespace-nowrap">
                          {fmt.currency(l.amountRepaid)}
                        </p>
                        {l.amountRepaid > 0 && (
                          <div className="mt-1 w-20 h-1.5 rounded-full bg-border overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full bg-success transition-all"
                              style={{ width: `${repaidPct}%` }}
                            />
                          </div>
                        )}
                      </Td>

                      {/* Remaining balance */}
                      <Td
                        className={`font-semibold whitespace-nowrap text-[13px] ${
                          balance === 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {fmt.currency(balance)}
                      </Td>

                      {/* Due date */}
                      <Td className="text-light hidden md:table-cell whitespace-nowrap text-[12px]">
                        {l.repaymentDate ? fmt.date(l.repaymentDate) : "—"}
                      </Td>

                      {/* Liability account */}
                      <Td className="text-light hidden lg:table-cell text-[12px]">
                        {l.LiabilityAccount?.name}
                      </Td>

                      {/* Status */}
                      <Td>
                        <Badge
                          variant={l.status === "PAID" ? "success" : "warning"}
                          dot
                        >
                          {l.status}
                        </Badge>
                      </Td>

                      {/* Actions */}
                      <Td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {l.status === "ACTIVE" && (
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<CreditCard size={13} />}
                              onClick={() => openRepayModal(l)}
                            >
                              <span className="hidden sm:inline">Repay</span>
                            </Button>
                          )}
                          {hasRepayments && (
                            <button
                              className="text-light hover:text-white transition-colors text-[11px] flex items-center gap-1"
                              onClick={() => toggleExpand(l.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                              <span className="hidden sm:inline">
                                {l.repayments.length}
                              </span>
                            </button>
                          )}
                        </div>
                      </Td>
                    </Tr>

                    {/* ── Repayment history rows ── */}
                    {isExpanded &&
                      l.repayments?.map((r: any) => (
                        <Tr key={r.id}>
                          {/* indent under Lender col */}
                          <Td>
                            <p className="m-0 text-[12px] text-light pl-3 border-l-2 border-success/40">
                              {r.note || "Repayment"}
                            </p>
                            <p className="m-0 text-[11px] text-light/60 pl-3">
                              {fmt.date(r.createdAt)}
                              {r.PaidBy?.name ? ` · ${r.PaidBy.name}` : ""}
                            </p>
                          </Td>
                          {/* original col — blank */}
                          <Td />
                          {/* repaid col — show this payment */}
                          <Td className="text-success font-medium text-[12px] whitespace-nowrap">
                            +{fmt.currency(r.amount)}
                          </Td>
                          {/* balance col — blank, per-payment running balance omitted to keep it simple */}
                          <Td />
                          <Td className="hidden md:table-cell" />
                          <Td className="hidden lg:table-cell" />
                          <Td />
                          <Td />
                        </Tr>
                      ))}
                  </>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {/* ── Record Loan Modal ───────────────────────────────────────────────── */}
      <Modal
        open={recordModal}
        onClose={() => setRecordModal(false)}
        title="Record Loan Received"
        size="lg"
      >
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Lender Name"
              placeholder="Bank or individual..."
              value={form.lender}
              onChange={(e) => setForm({ ...form, lender: e.target.value })}
              required
            />
            <Input
              label="Amount (₦)"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Date Received"
              type="date"
              value={form.dateReceived}
              onChange={(e) =>
                setForm({ ...form, dateReceived: e.target.value })
              }
              required
            />
            <Input
              label="Expected Repayment Date"
              type="date"
              value={form.repaymentDate}
              onChange={(e) =>
                setForm({ ...form, repaymentDate: e.target.value })
              }
            />
          </div>

          <Select
            label="Cash / Bank Account (Debit)"
            options={cashAccounts}
            value={form.cashAccountId}
            onChange={(e) =>
              setForm({ ...form, cashAccountId: e.target.value })
            }
            placeholder="Where the money was received..."
            required
          />

          <Select
            label="Loan Liability Account (Credit)"
            options={liabilityAccounts}
            value={form.liabilityAccountId}
            onChange={(e) =>
              setForm({ ...form, liabilityAccountId: e.target.value })
            }
            placeholder="Select liability account..."
            required
          />

          <Textarea
            label="Description"
            placeholder="Optional notes..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setRecordModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button loading={saving} onClick={handleRecord} className="flex-1">
              Record Loan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Repay Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={!!repayModal}
        onClose={() => setRepayModal(null)}
        title="Record Loan Repayment"
      >
        {repayModal &&
          (() => {
            const balance = repayModal.amount - repayModal.amountRepaid;
            const repaidPct =
              repayModal.amount > 0
                ? Math.round(
                    (repayModal.amountRepaid / repayModal.amount) * 100,
                  )
                : 0;
            const enteredAmount = parseFloat(repayForm.amount) || 0;
            const afterPayment = balance - enteredAmount;
            const isOverpay = enteredAmount > balance;

            return (
              <div className="p-4 sm:p-6 space-y-4">
                {/* ── Loan summary card ── */}
                <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="m-0 text-[13px] font-semibold text-white">
                        {repayModal.lender}
                      </p>
                      {repayModal.description && (
                        <p className="m-0 text-[11px] text-light">
                          {repayModal.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="warning" dot>
                      ACTIVE
                    </Badge>
                  </div>

                  {/* Amounts row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="m-0 text-[11px] text-light">Original</p>
                      <p className="m-0 text-[13px] font-semibold text-white">
                        {fmt.currency(repayModal.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="m-0 text-[11px] text-light">Repaid</p>
                      <p className="m-0 text-[13px] font-semibold text-success">
                        {fmt.currency(repayModal.amountRepaid)}
                      </p>
                    </div>
                    <div>
                      <p className="m-0 text-[11px] text-light">Balance</p>
                      <p className="m-0 text-[13px] font-semibold text-danger">
                        {fmt.currency(balance)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-light mb-1">
                      <span>Repayment progress</span>
                      <span>{repaidPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all duration-500"
                        style={{ width: `${repaidPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Repayment input ── */}
                <Input
                  label={`Repayment Amount (₦) — max ${fmt.currency(balance)}`}
                  type="number"
                  placeholder="0.00"
                  value={repayForm.amount}
                  onChange={(e) =>
                    setRepayForm({ ...repayForm, amount: e.target.value })
                  }
                  required
                />

                {/* Live feedback: what will remain after this payment */}
                {enteredAmount > 0 && (
                  <div
                    className={`rounded-lg px-3 py-2.5 text-[12px] border ${
                      isOverpay
                        ? "bg-danger/10 border-danger/30 text-danger"
                        : afterPayment === 0
                          ? "bg-success/10 border-success/30 text-success"
                          : "bg-primary/10 border-primary/30 text-primary"
                    }`}
                  >
                    {isOverpay ? (
                      <>
                        ⚠ Exceeds balance by{" "}
                        <strong>{fmt.currency(enteredAmount - balance)}</strong>
                        . Maximum is <strong>{fmt.currency(balance)}</strong>.
                      </>
                    ) : afterPayment === 0 ? (
                      <>
                        ✓ This payment will <strong>fully clear</strong> the
                        loan. Status will change to <strong>PAID</strong>.
                      </>
                    ) : (
                      <>
                        Remaining balance after payment:{" "}
                        <strong>{fmt.currency(afterPayment)}</strong>
                      </>
                    )}
                  </div>
                )}

                <Input
                  label="Note (optional)"
                  placeholder="e.g. Instalment 1, Bank transfer ref..."
                  value={repayForm.note}
                  onChange={(e) =>
                    setRepayForm({ ...repayForm, note: e.target.value })
                  }
                />

                <div className="flex gap-2 sm:gap-3 pt-1">
                  <Button
                    variant="secondary"
                    onClick={() => setRepayModal(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={saving}
                    onClick={handleRepay}
                    disabled={isOverpay || !repayForm.amount}
                    className="flex-1"
                  >
                    {afterPayment === 0 && enteredAmount > 0
                      ? "Pay & Close Loan"
                      : "Record Repayment"}
                  </Button>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
