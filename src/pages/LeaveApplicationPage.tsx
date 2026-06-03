import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, ChevronRight, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeaveManagement } from '../hooks/useLeaveManagement';
import type { LeaveRequest } from '../hooks/useLeaveManagement';

const LeaveApplicationPage = () => {
  const { user } = useAuth();
  const { getLeavesForUser, applyLeave } = useLeaveManagement();

  const [type, setType] = useState<LeaveRequest['type']>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const myLeaves = getLeavesForUser(user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;
    applyLeave({ userId: user.id, type, startDate, endDate, reason });
    setStartDate('');
    setEndDate('');
    setReason('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(136,172,136,0.12)', color: '#88AC88', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'Pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(228,183,109,0.12)', color: '#E4B76D', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
            <Clock size={12} /> Pending
          </span>
        );
      case 'Rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(230,57,70,0.10)', color: '#E63946', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default: return null;
    }
  };

  const leaveTypeConfig: Record<string, { color: string; bg: string; label: string }> = {
    'Casual':     { color: '#C37A67', bg: 'rgba(195,122,103,0.10)', label: 'Casual' },
    'Sick Leave': { color: '#A78BFA', bg: 'rgba(167,139,250,0.10)', label: 'Sick' },
    'Earned Leave':{ color: '#88AC88', bg: 'rgba(136,172,136,0.10)', label: 'Earned' },
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '52px',
    padding: '0 18px',
    borderRadius: '14px',
    border: '1.5px solid #E9E1D5',
    background: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    color: '#3A2C2B',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#8B7E74',
    display: 'block',
    marginBottom: '8px',
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', fontFamily: 'inherit' }}>
      <div className="w-full max-w-[1100px] mx-auto px-4 py-8 md:px-6 md:py-10">

        {/* Page Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '4px', height: '32px', background: '#C37A67', borderRadius: '99px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#3A2C2B', letterSpacing: '-0.02em', margin: 0 }}>
              Leave Application
            </h1>
          </div>
          <p style={{ color: '#8B7E74', fontSize: '14px', fontWeight: 500, margin: '0 0 0 16px', paddingLeft: '16px' }}>
            Apply for leave and track your history
          </p>
          <div style={{ height: '1px', background: '#E9E1D5', marginTop: '24px' }} />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-[28px] items-start">

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Application Form Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #E9E1D5', overflow: 'hidden', boxShadow: '0 2px 16px rgba(58,44,43,0.05)' }}>
              <div style={{ padding: '28px 32px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(195,122,103,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} color="#C37A67" />
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B7E74', margin: 0 }}>New Request</p>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#3A2C2B', margin: 0 }}>Leave Application</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

                  {/* Leave Type */}
                  <div>
                    <label style={labelStyle}>Leave Type</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {(['Casual', 'Sick Leave'] as LeaveRequest['type'][]).map((t) => {
                        const cfg = leaveTypeConfig[t];
                        const isActive = type === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            style={{
                              flex: 1,
                              padding: '12px 8px',
                              borderRadius: '14px',
                              border: isActive ? `1.5px solid ${cfg.color}` : '1.5px solid #E9E1D5',
                              background: isActive ? cfg.bg : '#FDFBF7',
                              color: isActive ? cfg.color : '#8B7E74',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              letterSpacing: '0.01em',
                            }}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        style={inputStyle}
                        required
                        onFocus={e => { e.target.style.borderColor = '#C37A67'; e.target.style.boxShadow = '0 0 0 3px rgba(195,122,103,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E9E1D5'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        style={inputStyle}
                        required
                        onFocus={e => { e.target.style.borderColor = '#C37A67'; e.target.style.boxShadow = '0 0 0 3px rgba(195,122,103,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E9E1D5'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label style={labelStyle}>Reason</label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      required
                      placeholder="Briefly describe your reason for leave..."
                      style={{
                        ...inputStyle,
                        height: '110px',
                        padding: '16px 18px',
                        resize: 'none',
                        lineHeight: '1.6',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#C37A67'; e.target.style.boxShadow = '0 0 0 3px rgba(195,122,103,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E9E1D5'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Submit */}
                  <div style={{ paddingTop: '4px' }}>
                    <button
                      type="submit"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0 28px',
                        height: '48px',
                        background: submitted ? '#88AC88' : '#C37A67',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        transition: 'background 0.2s, transform 0.12s',
                        boxShadow: submitted ? '0 4px 16px rgba(136,172,136,0.25)' : '0 4px 16px rgba(195,122,103,0.25)',
                      }}
                      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {submitted ? (
                        <><CheckCircle2 size={15} /> Application Submitted</>
                      ) : (
                        <><ChevronRight size={15} /> Submit Application</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Leave History Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #E9E1D5', overflow: 'hidden', boxShadow: '0 2px 16px rgba(58,44,43,0.05)' }}>
              <div style={{ padding: '22px 28px', borderBottom: '1px solid #F4F1DE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(58,44,43,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={16} color="#8B7E74" />
                </div>
                <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B7E74', margin: 0 }}>Leave History</p>
              </div>

              {myLeaves.length === 0 ? (
                <div style={{ padding: '56px 28px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F4F1DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Calendar size={22} color="#8B7E74" />
                  </div>
                  <p style={{ color: '#8B7E74', fontSize: '14px', fontWeight: 600, margin: 0 }}>No leave history yet</p>
                  <p style={{ color: '#8B7E74', fontSize: '12px', fontWeight: 400, margin: '4px 0 0', opacity: 0.7 }}>Your applications will appear here</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FDFBF7' }}>
                        {['Type', 'Duration', 'Reason', 'Status'].map((h, i) => (
                          <th key={h} style={{
                            padding: '12px 20px',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.09em',
                            color: '#8B7E74',
                            textAlign: i === 3 ? 'right' : 'left',
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myLeaves.map((l, i) => {
                        const cfg = leaveTypeConfig[l.type] ?? { color: '#8B7E74', bg: '#F4F1DE', label: l.type };
                        return (
                          <tr
                            key={i}
                            style={{ borderTop: '1px solid #F4F1DE', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#FDFBF7')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: 700 }}>
                                {cfg.label}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#3A2C2B', whiteSpace: 'nowrap' }}>
                              {l.startDate}
                              <span style={{ color: '#8B7E74', margin: '0 6px', fontWeight: 400 }}>—</span>
                              {l.endDate}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8B7E74', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {l.reason}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                              {getStatusBadge(l.status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Available Leaves Banner */}
            <div style={{
              background: 'linear-gradient(145deg, #C37A67 0%, #b06a57 100%)',
              borderRadius: '24px',
              padding: '32px 28px',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(195,122,103,0.30)',
            }}>
              <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', margin: '0 0 4px' }}>
                Available Balance
              </p>
              <p style={{ fontSize: '60px', fontWeight: 900, lineHeight: 1, margin: '0 0 28px', letterSpacing: '-0.03em' }}>18</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'Casual Leaves', count: 8 },
                  { label: 'Sick Leaves', count: 5 },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '13px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>{item.label}</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E9E1D5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(58,44,43,0.04)' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #F4F1DE' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B7E74', margin: 0 }}>This Year</p>
              </div>
              <div style={{ padding: '6px 0' }}>
                {[
                  { label: 'Approved', count: myLeaves.filter(l => l.status === 'Approved').length, color: '#88AC88', bg: 'rgba(136,172,136,0.10)' },
                  { label: 'Pending', count: myLeaves.filter(l => l.status === 'Pending').length, color: '#E4B76D', bg: 'rgba(228,183,109,0.10)' },
                  { label: 'Rejected', count: myLeaves.filter(l => l.status === 'Rejected').length, color: '#E63946', bg: 'rgba(230,57,70,0.10)' },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.color }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#3A2C2B' }}>{stat.label}</span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: stat.bg, color: stat.color, fontSize: '13px', fontWeight: 800 }}>
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice */}
            <div style={{ background: '#FFFBEB', borderRadius: '16px', border: '1.5px solid rgba(228,183,109,0.35)', padding: '18px 20px' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E4B76D', margin: '0 0 6px' }}>Note</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#8B7E74', margin: 0, lineHeight: 1.6 }}>
                Leaves must be applied at least 2 days in advance. Emergency sick leave is exempt.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationPage;