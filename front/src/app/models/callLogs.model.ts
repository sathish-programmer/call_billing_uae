export interface CallLogs {
    _id: string;
    branch: string;
    department: string;
    callerNumber?: string;
    calledNumber?: string;
    dialedNumber?: string;
    CalculatedCost?: string;
    TotalCycles?: any;
    CostPerCycle?: string;
    CallType?: string;
    CallDuration?: string;
    CallDirection?: string;
}