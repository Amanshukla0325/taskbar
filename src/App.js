import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  Calendar, 
  DollarSign 
} from 'lucide-react';

const App = () => {
  // --- Configuration Based on PDF ---
  const PHASES_DATA = [
    {
      id: 1,
      title: "Phase 1: Foundational Setup & Core Engine",
      costTotal: 20000,
      baseDeadline: "2024-12-04",
      purpose: "Establish the Skeleton System, Auth & Database Schema.",
      steps: [
        "Admin creates Hotel A (Subdomain)",
        "Manager logs in & adds Room 101",
        "Create booking 2 PM - 11 AM (Check conflict logic)"
      ],
      demoLink: "https://dev-p1.tourbnb.in"
    },
    {
      id: 2,
      title: "Phase 2: Basic Booking Flow & Dashboards",
      costTotal: 20000,
      baseDeadline: "2024-12-19",
      purpose: "Working MVP with Calendar Widget & Tenant Routing.",
      steps: [
        "View/Cancel/Modify bookings in Dashboard",
        "Verify 'Paid' vs 'Pending' status flags",
        "Check Tenant Routing (hotel-a.ourapp.com)"
      ],
      demoLink: "https://dev-p2.tourbnb.in"
    },
    {
      id: 3,
      title: "Phase 3: Channel Manager & Flex Inventory",
      costTotal: 60000,
      baseDeadline: "2025-01-03",
      purpose: "Real-time Sync, Hourly Logic & OTA Integration.",
      steps: [
        "Test Hybrid Timeline (10AM-2PM & 4PM-10AM)",
        "Trigger Stop-Sell Rule for Booking.com",
        "Verify Webhook ingestion from OTAs"
      ],
      demoLink: "https://dev-p3.tourbnb.in"
    },
    {
      id: 4,
      title: "Phase 4: Guest Portal (Magic Link)",
      costTotal: 60000,
      baseDeadline: "2025-01-18",
      purpose: "App-less Guest Journey, KYC & Smart Locks.",
      steps: [
        "Guest opens Magic Link (No Login)",
        "Upload Passport/Aadhaar to S3",
        "Complete Payment & Receive TTLock PIN"
      ],
      demoLink: "https://guest.tourbnb.in"
    },
    {
      id: 5,
      title: "Phase 5: Testing & Tuning",
      costTotal: 60000,
      baseDeadline: "2025-02-02",
      purpose: "Scale, Security Audit & Load Performance.",
      steps: [
        "Simulate 100+ bookings/minute (k6)",
        "Verify Redis Caching hits",
        "Check Rate-limiting on login endpoints"
      ],
      demoLink: "https://status.tourbnb.in"
    },
    {
      id: 6,
      title: "Phase 6: Final Launch & Handoff",
      costTotal: 60000,
      baseDeadline: "2025-02-17",
      purpose: "Production Deployment & Client Handover.",
      steps: [
        "DNS Pointing (*.tourbnb.in)",
        "Run automated Tenant Onboarding script",
        "Final Data Migration check"
      ],
      demoLink: "https://tourbnb.in"
    }
  ];

  // --- State for Simulation ---
  // 'paidCheckpoints' now tracks specific parts: '1_start', '1_finish', etc.
  // Initial state: Phase 1 Start (25%) is PAID.
  const [currentDate, setCurrentDate] = useState("2024-12-05"); 
  const [paidCheckpoints, setPaidCheckpoints] = useState(['1_start']); 
    
  // --- Logic Engine ---

  const calculateDelay = (phaseId, baseDeadlineStr) => {
    const deadline = new Date(baseDeadlineStr);
    const current = new Date(currentDate);
        
    // We consider the phase "Completed" for timing purposes only if the 75% Finish is paid
    const isFinishPaid = paidCheckpoints.includes(`${phaseId}_finish`);
        
    // If finish is paid, no delay active
    if (isFinishPaid) return { daysLate: 0, penaltyDays: 0, status: 'completed' };

    // Buffer is 7 days after deadline
    const bufferEnd = new Date(deadline);
    bufferEnd.setDate(deadline.getDate() + 7);

    if (current <= deadline) {
      return { daysLate: 0, penaltyDays: 0, status: 'active' };
    } else if (current <= bufferEnd) {
      // Inside the 7 day buffer
      const daysInBuffer = Math.floor((current - deadline) / (1000 * 60 * 60 * 24));
      return { daysLate: 0, penaltyDays: 0, status: 'buffer', daysInBuffer };
    } else {
      // Late!
      const daysLate = Math.floor((current - bufferEnd) / (1000 * 60 * 60 * 24));
      const penaltyDays = daysLate * 3; // 3 days for every 1 day late
      return { daysLate, penaltyDays, status: 'late' };
    }
  };

  // Calculate Total Accumulated Delay to shift future dates
  let totalPenaltyShift = 0;

  const renderPhase = (phase, index) => {
    const { daysLate, penaltyDays, status, daysInBuffer } = calculateDelay(phase.id, phase.baseDeadline);
        
    // Shift this phase's display date by previous penalties
    const originalDate = new Date(phase.baseDeadline);
    originalDate.setDate(originalDate.getDate() + totalPenaltyShift);
        
    // If this phase is currently causing a delay, add it to the accumulator for NEXT phases
    if (status === 'late') {
      totalPenaltyShift += penaltyDays;
    }

    const isCompleted = status === 'completed';
    const isLate = status === 'late';
    const isBuffer = status === 'buffer';
    const isActive = status === 'active';

    // Check specific payment parts
    const isStartPaid = paidCheckpoints.includes(`${phase.id}_start`);
    const isFinishPaid = paidCheckpoints.includes(`${phase.id}_finish`);

    const displayDate = originalDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        return (
          <div key={phase.id} className={`relative timeline-wrapper pb-8 sm:pb-12 ${index === PHASES_DATA.length - 1 ? 'last-phase' : ''}`}>
        {/* Connector Line */}
        <div className={`absolute left-6 top-[60px] -bottom-5 w-0.5 -z-0 ${isCompleted ? 'bg-indigo-500' : 'bg-gray-200'} ${index === PHASES_DATA.length - 1 ? 'hidden' : ''}`}></div>

        {/* Phase Icon Bubble */}
                <div className={`absolute left-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 z-10 timeline-icon 
          ${isCompleted ? 'bg-indigo-600 border-indigo-100 text-white' : 
            isLate ? 'bg-red-600 border-red-100 text-white' : 
            isBuffer ? 'bg-yellow-500 border-yellow-100 text-white' :
            'bg-white border-gray-200 text-gray-400'}`}>
          {isCompleted ? <CheckCircle2 size={24} /> : 
           isLate ? <ShieldAlert size={24} /> :
           isBuffer ? <Clock size={24} /> :
           <span className="font-bold text-lg">{phase.id}</span>}
        </div>

        {/* Card Content */}
                <div className={`rounded-xl timeline-card shadow-sm border transition-all duration-300 backdrop-blur-md
          ${isLate ? 'border-red-500 shadow-red-100 bg-red-50/90' : 
            isBuffer ? 'border-yellow-400 shadow-yellow-100 bg-yellow-50/90' : 
            isCompleted ? 'border-indigo-200 bg-white/95' : 'border-gray-200 bg-gray-50/90'}`}>
                    
          {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div>
                            <h3 className={`header-title font-bold ${isLate ? 'text-red-700' : 'text-gray-900'}`}>{phase.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className={`flex items-center gap-1 ${isLate ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  <Calendar size={14} /> 
                  Target: <span className="date-compact">{displayDate}</span>
                  {isLate && <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full ml-2">+{penaltyDays} Days Shift</span>}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <DollarSign size={14} /> 
                  Total: ₹{phase.costTotal.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 md:mt-0">
              {isCompleted ? (
                <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200">
                  Paid & Shipped
                </span>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs font-mono text-gray-500 mb-1">
                    PAYMENT STRUCTURE
                  </div>
                                    <div className="flex gap-2">
                    {/* 25% Start Badge */}
                    <button 
                      onClick={() => !isStartPaid && setPaidCheckpoints([...paidCheckpoints, `${phase.id}_start`])}
                      className={`action-btn px-3 py-1 rounded-l-md text-xs font-medium border transition-colors
                      ${isStartPaid 
                        ? 'bg-green-100 text-green-700 border-green-200'  // Green when paid
                        : (isActive || isBuffer || isLate) 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                      {isStartPaid ? '25% Paid' : '25% Start'}
                    </button>
                                        
                    {/* 75% Finish Badge */}
                    <button 
                      onClick={() => !isFinishPaid && setPaidCheckpoints([...paidCheckpoints, `${phase.id}_finish`])}
                      className={`action-btn px-3 py-1 rounded-r-md text-xs font-medium border transition-colors
                      ${isFinishPaid
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : isLate 
                          ? 'bg-red-600 text-white animate-pulse border-red-700' 
                          : isBuffer 
                            ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                            : 'bg-white text-gray-400 border-gray-200'
                      }`}>
                      75% Finish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buffer/Penalty Banner */}
          {isBuffer && !isFinishPaid && (
            <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-yellow-800">Buffer Period Active</p>
                  <p className="text-sm text-yellow-700">Project work continues. {7 - daysInBuffer} days remaining before timeline penalty.</p>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{7 - daysInBuffer}d</div>
              </div>
            </div>
          )}

          {isLate && !isFinishPaid && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-600 p-4 rounded-r">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="font-bold text-red-800 flex items-center gap-2">
                    <ShieldAlert size={18} />
                    CRITICAL DELAY
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Buffer exceeded by {daysLate} days. 
                    <br/>
                    <strong>Multiplier Logic (3x):</strong> {daysLate} × 3 = <span className="underline decoration-2">{penaltyDays} days</span> added to launch date.
                  </p>
                </div>
                <div className="text-right">
                  <button 
                    onClick={() => setPaidCheckpoints([...paidCheckpoints, `${phase.id}_finish`])}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors">
                    Pay 75% Remainder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* The 3-Block Grid Section (User Request) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
            {/* Block 1: Purpose */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col h-full">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Purpose of Phase</h4>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {phase.purpose}
              </p>
            </div>

            {/* Block 2: Steps to Test */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col h-full">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Steps to Test Phase {phase.id}</h4>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                {phase.steps.map((step, i) => (
                  <li key={i} className="leading-tight">{step}</li>
                ))}
              </ul>
            </div>

            {/* Block 3: Demo Link */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-center items-center h-full text-center group hover:border-indigo-200 transition-colors cursor-pointer">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Demo Link</h4>
              {isActive || isCompleted || isBuffer || isLate ? (
                <a href={phase.demoLink} target="_blank" className="flex flex-col items-center text-indigo-600 hover:text-indigo-800">
                                    <ExternalLink size={20} className="mb-2 group-hover:scale-110 transition-transform"/>
                  <span className="text-sm font-semibold break-all">{phase.demoLink}</span>
                </a>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Lock size={24} className="mb-2"/>
                  <span className="text-sm">Locked</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 font-sans bg-gray-100 text-gray-900">
      {/* Top Hero / Header */}
            <div className="bg-indigo-900 text-white pt-8 sm:pt-12 pb-12 sm:pb-24 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Tracker: Tourbnb.in</h1>
              <p className="text-indigo-200 mt-2">Real-time Development & Payment Status</p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-indigo-300 text-sm">Projected Launch</div>
              <div className="text-2xl sm:text-3xl font-bold">
                {new Date(new Date("2025-02-17").getTime() + (totalPenaltyShift * 86400000)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {totalPenaltyShift > 0 && (
                <div className="text-red-400 text-xs font-bold mt-1">
                  +{totalPenaltyShift} Days Delayed
                </div>
              )}
            </div>
          </div>
                    
          {/* Summary Cards */}
                    <div className="summary-grid">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="text-xs text-indigo-300 uppercase">Phase 0 Status</div>
              <div className="text-lg font-semibold text-green-300">Paid & Done</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="text-xs text-indigo-300 uppercase">Current Status</div>
              <div className={`text-lg font-semibold ${totalPenaltyShift > 0 ? 'text-red-300' : 'text-green-300'}`}>
                {totalPenaltyShift > 0 ? 'Delayed' : 'On Track'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="text-xs text-indigo-300 uppercase">Next Payment</div>
              <div className="text-lg font-semibold">75% of Phase 1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Content */}
        <div className="max-w-4xl w-full mx-auto px-4 -mt-12 relative z-10">
        {PHASES_DATA.map((phase, index) => renderPhase(phase, index))}
      </div>

      {/* ----------------- ADMIN SIMULATOR (Bottom Bar) ----------------- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Tracker Simulator</span>
            <span className="text-xs text-gray-500 hidden md:inline">| Change date to test logic</span>
          </div>
                    
          <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
            <label className="text-sm text-gray-600 font-medium">Current Date:</label>
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Try setting date to:</span>
            <button onClick={() => setCurrentDate("2024-12-04")} className="underline hover:text-indigo-600">Start (Clean)</button>
            <button onClick={() => setCurrentDate("2024-12-10")} className="underline hover:text-indigo-600">Buffer (Warning)</button>
            <button onClick={() => setCurrentDate("2024-12-15")} className="underline hover:text-red-600">Late (Red Alert)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
