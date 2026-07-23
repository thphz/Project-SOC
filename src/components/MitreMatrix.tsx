import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Play, 
  Trash2, 
  X, 
  Layers, 
  Zap, 
  Sparkles
} from 'lucide-react';
import type { 
  EventLogItem, 
  NodeHealthStatus, 
  EventLogLevel, 
  AttackScenarioStep, 
  AttackScenario 
} from '../types/soc';
import type { Node } from '@xyflow/react';

interface MitreMatrixProps {
  logs: EventLogItem[];
  nodes: Node[];
  onExecuteCustomScenario: (scenario: AttackScenario) => void;
  currentStepIndex?: number;
  onClose?: () => void;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tacticId: string;
  tacticName: string;
  description: string;
}

const MITRE_14_TACTICS: { id: string; name: string; stage: number; techniques: MitreTechnique[] }[] = [
  {
    id: 'recon',
    name: 'Reconnaissance',
    stage: 1,
    techniques: [
      { id: 'T1595', name: 'Active Scanning', tacticId: 'recon', tacticName: 'Reconnaissance', description: 'Scanning IP ranges for open ports and vulnerable services.' },
      { id: 'T1592', name: 'Gather Victim Host Info', tacticId: 'recon', tacticName: 'Reconnaissance', description: 'Gathering hostnames, OS version, and network configurations.' },
      { id: 'T1589', name: 'Gather Victim Identity Info', tacticId: 'recon', tacticName: 'Reconnaissance', description: 'Harvesting employee emails and authentication mechanisms.' },
      { id: 'T1590', name: 'Gather Victim Network Info', tacticId: 'recon', tacticName: 'Reconnaissance', description: 'Mapping internal IP subnets and DNS routing records.' },
    ]
  },
  {
    id: 'resource-dev',
    name: 'Resource Development',
    stage: 2,
    techniques: [
      { id: 'T1583', name: 'Acquire Infrastructure', tacticId: 'resource-dev', tacticName: 'Resource Development', description: 'Buying VPS nodes, domains, or serverless infrastructure.' },
      { id: 'T1586', name: 'Compromise Accounts', tacticId: 'resource-dev', tacticName: 'Resource Development', description: 'Taking over third-party cloud or email accounts.' },
      { id: 'T1587', name: 'Develop Capabilities', tacticId: 'resource-dev', tacticName: 'Resource Development', description: 'Writing custom exploits, ransomware, or C2 agents.' },
      { id: 'T1584', name: 'Compromise Infrastructure', tacticId: 'resource-dev', tacticName: 'Resource Development', description: 'Hacking existing web servers to host payloads.' },
    ]
  },
  {
    id: 'initial-access',
    name: 'Initial Access',
    stage: 3,
    techniques: [
      { id: 'T1566', name: 'Phishing', tacticId: 'initial-access', tacticName: 'Initial Access', description: 'Spearphishing attachment or malicious URL link.' },
      { id: 'T1190', name: 'Exploit Public-Facing App', tacticId: 'initial-access', tacticName: 'Initial Access', description: 'Exploiting web vulnerability (SQLi, RCE, Deserialization).' },
      { id: 'T1078', name: 'Valid Accounts', tacticId: 'initial-access', tacticName: 'Initial Access', description: 'Using stolen credentials via VPN or SSH gateway.' },
      { id: 'T1189', name: 'Drive-by Compromise', tacticId: 'initial-access', tacticName: 'Initial Access', description: 'Infecting target when visiting malicious website.' },
    ]
  },
  {
    id: 'execution',
    name: 'Execution',
    stage: 4,
    techniques: [
      { id: 'T1059', name: 'Command & Script Interpreter', tacticId: 'execution', tacticName: 'Execution', description: 'Running PowerShell, Bash, CMD, or Python payloads.' },
      { id: 'T1204', name: 'User Execution', tacticId: 'execution', tacticName: 'Execution', description: 'Victim opening malicious document or double-clicking EXE.' },
      { id: 'T1047', name: 'Windows Management Instrumentation', tacticId: 'execution', tacticName: 'Execution', description: 'Executing code remotely via WMI services.' },
      { id: 'T1053', name: 'Scheduled Task/Job', tacticId: 'execution', tacticName: 'Execution', description: 'Creating cron jobs or Windows Task Scheduler entries.' },
    ]
  },
  {
    id: 'persistence',
    name: 'Persistence',
    stage: 5,
    techniques: [
      { id: 'T1547', name: 'Boot/Logon Autostart', tacticId: 'persistence', tacticName: 'Persistence', description: 'Adding registry Run keys or startup folder binaries.' },
      { id: 'T1136', name: 'Create Account', tacticId: 'persistence', tacticName: 'Persistence', description: 'Creating rogue local administrator account.' },
      { id: 'T1543', name: 'Create/Modify System Process', tacticId: 'persistence', tacticName: 'Persistence', description: 'Installing malicious system daemon or Windows service.' },
      { id: 'T1098', name: 'Account Manipulation', tacticId: 'persistence', tacticName: 'Persistence', description: 'Modifying group memberships or SSH authorized keys.' },
    ]
  },
  {
    id: 'priv-esc',
    name: 'Privilege Escalation',
    stage: 6,
    techniques: [
      { id: 'T1548', name: 'Abuse Elevation Control', tacticId: 'priv-esc', tacticName: 'Privilege Escalation', description: 'Bypassing UAC or sudo misconfigurations.' },
      { id: 'T1068', name: 'Exploitation for Priv Esc', tacticId: 'priv-esc', tacticName: 'Privilege Escalation', description: 'Exploiting kernel vulnerabilities to get ROOT/SYSTEM.' },
      { id: 'T1055', name: 'Process Injection', tacticId: 'priv-esc', tacticName: 'Privilege Escalation', description: 'Injecting DLL/shellcode into legitimate system process.' },
      { id: 'T1484', name: 'Domain Policy Modification', tacticId: 'priv-esc', tacticName: 'Privilege Escalation', description: 'Modifying Active Directory Group Policy objects.' },
    ]
  },
  {
    id: 'defense-evasion',
    name: 'Defense Evasion',
    stage: 7,
    techniques: [
      { id: 'T1070', name: 'Indicator Removal', tacticId: 'defense-evasion', tacticName: 'Defense Evasion', description: 'Clearing Windows Event logs or deleting bash history.' },
      { id: 'T1036', name: 'Masquerading', tacticId: 'defense-evasion', tacticName: 'Defense Evasion', description: 'Renaming malware executable to svchost.exe.' },
      { id: 'T1027', name: 'Obfuscated Files/Info', tacticId: 'defense-evasion', tacticName: 'Defense Evasion', description: 'Encoding payloads in Base64 or XOR obfuscation.' },
      { id: 'T1562', name: 'Impair Defenses', tacticId: 'defense-evasion', tacticName: 'Defense Evasion', description: 'Disabling EDR agent, Defender, or firewall rules.' },
    ]
  },
  {
    id: 'cred-access',
    name: 'Credential Access',
    stage: 8,
    techniques: [
      { id: 'T1003', name: 'OS Credential Dumping', tacticId: 'cred-access', tacticName: 'Credential Access', description: 'Dumping LSASS memory or SAM database hashes.' },
      { id: 'T1110', name: 'Brute Force', tacticId: 'cred-access', tacticName: 'Credential Access', description: 'Password spraying against SSH, RDP, or Active Directory.' },
      { id: 'T1555', name: 'Credentials from Password Stores', tacticId: 'cred-access', tacticName: 'Credential Access', description: 'Extracting saved browser credentials or Wi-Fi passwords.' },
      { id: 'T1552', name: 'Unsecured Credentials', tacticId: 'cred-access', tacticName: 'Credential Access', description: 'Searching config files for plaintext passwords.' },
    ]
  },
  {
    id: 'discovery',
    name: 'Discovery',
    stage: 9,
    techniques: [
      { id: 'T1082', name: 'System Info Discovery', tacticId: 'discovery', tacticName: 'Discovery', description: 'Querying system architecture, patches, and uptime.' },
      { id: 'T1083', name: 'File & Directory Discovery', tacticId: 'discovery', tacticName: 'Discovery', description: 'Searching for sensitive documents or backup shares.' },
      { id: 'T1046', name: 'Network Service Discovery', tacticId: 'discovery', tacticName: 'Discovery', description: 'Port scanning internal subnets from compromised node.' },
      { id: 'T1018', name: 'Remote System Discovery', tacticId: 'discovery', tacticName: 'Discovery', description: 'Enumerating domain controllers and server hostnames.' },
    ]
  },
  {
    id: 'lateral-movement',
    name: 'Lateral Movement',
    stage: 10,
    techniques: [
      { id: 'T1021', name: 'Remote Services', tacticId: 'lateral-movement', tacticName: 'Lateral Movement', description: 'Pivoting via SSH, SMB, WinRM, or PsExec.' },
      { id: 'T1210', name: 'Exploitation of Remote Services', tacticId: 'lateral-movement', tacticName: 'Lateral Movement', description: 'Exploiting EternalBlue (MS17-010) on internal LAN.' },
      { id: 'T1570', name: 'Lateral Tool Transfer', tacticId: 'lateral-movement', tacticName: 'Lateral Movement', description: 'Copying C2 binaries across network shares.' },
      { id: 'T1550', name: 'Use Alternate Auth Material', tacticId: 'lateral-movement', tacticName: 'Lateral Movement', description: 'Pass-the-Hash or Pass-the-Ticket attacks.' },
    ]
  },
  {
    id: 'collection',
    name: 'Collection',
    stage: 11,
    techniques: [
      { id: 'T1005', name: 'Data from Local System', tacticId: 'collection', tacticName: 'Collection', description: 'Staging confidential files into zip archives.' },
      { id: 'T1056', name: 'Input Capture', tacticId: 'collection', tacticName: 'Collection', description: 'Logging keystrokes or clipboard data.' },
      { id: 'T1114', name: 'Email Collection', tacticId: 'collection', tacticName: 'Collection', description: 'Exporting Exchange mailboxes or PST archives.' },
      { id: 'T1113', name: 'Screen Capture', tacticId: 'collection', tacticName: 'Collection', description: 'Taking periodic screenshots of desktop session.' },
    ]
  },
  {
    id: 'c2',
    name: 'Command and Control',
    stage: 12,
    techniques: [
      { id: 'T1071', name: 'Application Layer Protocol', tacticId: 'c2', tacticName: 'Command and Control', description: 'C2 beaconing over HTTPS/TLS or DNS tunneling.' },
      { id: 'T1573', name: 'Encrypted Channel', tacticId: 'c2', tacticName: 'Command and Control', description: 'Custom AES-256 encrypted C2 communication.' },
      { id: 'T1095', name: 'Non-Application Layer Protocol', tacticId: 'c2', tacticName: 'Command and Control', description: 'Raw ICMP or TCP sockets for beaconing.' },
      { id: 'T1105', name: 'Ingress Tool Transfer', tacticId: 'c2', tacticName: 'Command and Control', description: 'Downloading secondary malware payloads onto victim.' },
    ]
  },
  {
    id: 'exfiltration',
    name: 'Exfiltration',
    stage: 13,
    techniques: [
      { id: 'T1041', name: 'Exfiltration Over C2', tacticId: 'exfiltration', tacticName: 'Exfiltration', description: 'Sending stolen archives back over existing C2 channel.' },
      { id: 'T1020', name: 'Automated Exfiltration', tacticId: 'exfiltration', tacticName: 'Exfiltration', description: 'Scheduled automatic data transfer to cloud storage.' },
      { id: 'T1048', name: 'Exfiltration Over Alt Protocol', tacticId: 'exfiltration', tacticName: 'Exfiltration', description: 'Uploading data via SFTP, FTP, or DNS exfiltration.' },
      { id: 'T1567', name: 'Exfiltration Over Web Service', tacticId: 'exfiltration', tacticName: 'Exfiltration', description: 'Exfiltrating data to Dropbox, Mega, or GitHub.' },
    ]
  },
  {
    id: 'impact',
    name: 'Impact',
    stage: 14,
    techniques: [
      { id: 'T1486', name: 'Data Encrypted for Impact', tacticId: 'impact', tacticName: 'Impact', description: 'Ransomware encrypting local disks and network shares.' },
      { id: 'T1489', name: 'Service Stop', tacticId: 'impact', tacticName: 'Impact', description: 'Terminating critical database and web services.' },
      { id: 'T1490', name: 'Inhibit System Recovery', tacticId: 'impact', tacticName: 'Impact', description: 'Deleting VSS Volume Shadow Copies and system backups.' },
      { id: 'T1498', name: 'Network Denial of Service', tacticId: 'impact', tacticName: 'Impact', description: 'Flooding network interfaces with SYN/UDP flood.' },
    ]
  }
];

export const MitreMatrix: React.FC<MitreMatrixProps> = ({
  logs,
  nodes,
  onExecuteCustomScenario,
  onClose
}) => {
  // Scenario Builder Form State
  const [showBuilder, setShowBuilder] = useState<boolean>(true);
  const [scenarioName, setScenarioName] = useState<string>('Custom SOC Attack Simulation');
  const [scenarioCategory, setScenarioCategory] = useState<string>('Red Team Scenario');
  
  const [customSteps, setCustomSteps] = useState<AttackScenarioStep[]>([
    {
      stepIndex: 1,
      title: 'Initial Reconnaissance Scan',
      description: 'Nmap vulnerability scan against web gateway',
      mitrePhaseId: 'recon',
      mitreTechnique: 'T1595 Active Scanning',
      sourceNodeId: nodes[0]?.id || 'node_attacker',
      targetNodeId: nodes[1]?.id || nodes[0]?.id || 'node_target',
      targetStatus: 'warning',
      edgeAnimation: 'warning',
      logMessage: 'RECON: Port scan detected targeting TCP 80, 443, 22',
      logLevel: 'WARNING'
    },
    {
      stepIndex: 2,
      title: 'Web Exploit Payload Injection',
      description: 'Exploiting RCE vulnerability on web API server',
      mitrePhaseId: 'initial-access',
      mitreTechnique: 'T1190 Exploit Public-Facing App',
      sourceNodeId: nodes[0]?.id || 'node_attacker',
      targetNodeId: nodes[1]?.id || nodes[0]?.id || 'node_target',
      targetStatus: 'compromised',
      edgeAnimation: 'attack',
      logMessage: 'EXPLOIT: Unauthenticated RCE payload delivered to WEB-API-01',
      logLevel: 'CRITICAL',
      maliciousProcess: 'xmrig_miner.exe',
      alertTitle: 'Critical RCE Exploit Triggered'
    }
  ]);

  // Form Fields for new step
  const [stepSource, setStepSource] = useState<string>(nodes[0]?.id || '');
  const [stepTarget, setStepTarget] = useState<string>(nodes[1]?.id || nodes[0]?.id || '');
  const [stepTechnique, setStepTechnique] = useState<string>('T1566 Phishing');
  const [stepPayload, setStepPayload] = useState<string>('Spearphishing email payload executed');
  const [stepLogLevel, setStepLogLevel] = useState<EventLogLevel>('CRITICAL');
  const [stepTargetStatus] = useState<NodeHealthStatus>('compromised');

  // Active technique IDs extracted from recent logs or active phases
  const activeTechniqueIds = useMemo(() => {
    const activeSet = new Set<string>();
    logs.forEach(l => {
      if (l.mitrePhase) {
        // e.g. "T1595 Active Scanning" or "T1595"
        const match = l.mitrePhase.match(/T\d{4}/i);
        if (match) {
          activeSet.add(match[0].toUpperCase());
        } else {
          activeSet.add(l.mitrePhase.toUpperCase());
        }
      }
    });

    customSteps.forEach(st => {
      const match = st.mitreTechnique.match(/T\d{4}/i);
      if (match) activeSet.add(match[0].toUpperCase());
    });

    return activeSet;
  }, [logs, customSteps]);

  // Helper to add step to scenario builder
  const handleAddStep = () => {
    const sourceNodeObj = nodes.find(n => n.id === stepSource);
    const targetNodeObj = nodes.find(n => n.id === stepTarget);
    const sourceLabel = sourceNodeObj ? (sourceNodeObj.data as any).hostname : stepSource;
    const targetLabel = targetNodeObj ? (targetNodeObj.data as any).hostname : stepTarget;

    const newStep: AttackScenarioStep = {
      stepIndex: customSteps.length + 1,
      title: `Step ${customSteps.length + 1}: ${stepTechnique}`,
      description: `Attack vector from ${sourceLabel} to ${targetLabel}`,
      mitrePhaseId: 'execution',
      mitreTechnique: stepTechnique,
      sourceNodeId: stepSource,
      targetNodeId: stepTarget,
      targetStatus: stepTargetStatus,
      edgeAnimation: stepLogLevel === 'CRITICAL' ? 'attack' : 'warning',
      logMessage: `${stepTechnique} [${sourceLabel} -> ${targetLabel}]: ${stepPayload}`,
      logLevel: stepLogLevel,
      maliciousProcess: stepLogLevel === 'CRITICAL' ? 'malicious_agent.exe' : undefined,
      alertTitle: stepLogLevel === 'CRITICAL' ? `Threat Alert: ${stepTechnique}` : undefined
    };

    setCustomSteps([...customSteps, newStep]);
  };

  // Helper to remove step
  const handleRemoveStep = (idx: number) => {
    const updated = customSteps.filter((_, i) => i !== idx).map((s, i) => ({
      ...s,
      stepIndex: i + 1
    }));
    setCustomSteps(updated);
  };

  // Execute Custom Scenario
  const handleExecute = () => {
    if (customSteps.length === 0) return;
    const scenario: AttackScenario = {
      id: `custom-scenario-${Date.now()}`,
      name: scenarioName,
      category: scenarioCategory,
      description: `User-authored attack sequence with ${customSteps.length} MITRE ATT&CK steps.`,
      steps: customSteps
    };
    onExecuteCustomScenario(scenario);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#070B14] text-gray-100 font-sans overflow-hidden relative">
      {/* Top Bar Header */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              MITRE ATT&CK Enterprise Matrix (14 Tactics) & Visual Scenario Builder
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-semibold">
                v14 Enterprise
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Real-Time Active Threat Highlighting • Drag & Sequence Attack Workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
              showBuilder
                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showBuilder ? 'Hide Scenario Builder' : 'Open Scenario Builder'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition"
              title="Close Matrix View"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Vertical Split */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        {/* 1. VISUAL SCENARIO BUILDER PANEL (Collapsible / Top Section) */}
        {showBuilder && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shrink-0 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                Visual Cyber Attack Scenario Builder & Sequencer
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecute}
                  disabled={customSteps.length === 0}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Execute Custom Scenario ({customSteps.length} Steps)
                </button>
              </div>
            </div>

            {/* Scenario Metadata Inputs & Add Step Form */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 text-xs font-mono">
              {/* Col 1: Scenario Metadata */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Scenario Title</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
                />

                <label className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Attack Category</label>
                <input
                  type="text"
                  value={scenarioCategory}
                  onChange={(e) => setScenarioCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Col 2 & 3: Add Step Form */}
              <div className="lg:col-span-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Attack Step to Sequence
                  </span>
                  <span className="text-[10px] text-slate-500">Step #{customSteps.length + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Source Node</label>
                    <select
                      value={stepSource}
                      onChange={(e) => setStepSource(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-gray-200 text-xs focus:outline-none"
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {(n.data as any).hostname || n.id} ({(n.data as any).ip})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Target Node</label>
                    <select
                      value={stepTarget}
                      onChange={(e) => setStepTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-gray-200 text-xs focus:outline-none"
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {(n.data as any).hostname || n.id} ({(n.data as any).ip})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">MITRE Technique</label>
                    <select
                      value={stepTechnique}
                      onChange={(e) => setStepTechnique(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-gray-200 text-xs focus:outline-none"
                    >
                      <option value="T1595 Active Scanning">T1595 Active Scanning</option>
                      <option value="T1566 Phishing">T1566 Phishing</option>
                      <option value="T1190 Exploit Public-Facing App">T1190 Exploit Public-Facing App</option>
                      <option value="T1059 Command & Script Interpreter">T1059 Command & Script Interpreter</option>
                      <option value="T1003 OS Credential Dumping">T1003 OS Credential Dumping</option>
                      <option value="T1021 Remote Services (Lateral)">T1021 Remote Services (Lateral)</option>
                      <option value="T1071 C2 Application Layer Protocol">T1071 C2 Application Layer</option>
                      <option value="T1041 Exfiltration Over C2">T1041 Exfiltration Over C2</option>
                      <option value="T1486 Data Encrypted for Impact">T1486 Data Encrypted (Ransomware)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Log Level</label>
                    <select
                      value={stepLogLevel}
                      onChange={(e) => setStepLogLevel(e.target.value as EventLogLevel)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-gray-200 text-xs focus:outline-none"
                    >
                      <option value="INFO">INFO</option>
                      <option value="WARNING">WARNING</option>
                      <option value="ERROR">ERROR</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Payload details e.g. CVE-2024-21887 Command Injection"
                    value={stepPayload}
                    onChange={(e) => setStepPayload(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleAddStep}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>
              </div>

              {/* Col 4: Sequence Preview */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col max-h-44 overflow-y-auto">
                <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                  Sequenced Steps ({customSteps.length})
                </span>
                {customSteps.length === 0 ? (
                  <div className="text-slate-600 text-[11px] py-4 text-center">No steps added yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {customSteps.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <div className="truncate pr-2">
                          <span className="text-amber-400 font-bold mr-1">#{st.stepIndex}</span>
                          <span className="text-purple-300 font-semibold">{st.mitreTechnique}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveStep(idx)}
                          className="p-0.5 text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. 14-COLUMN Enterprise MITRE ATT&CK MATRIX */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col p-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
                Enterprise ATT&CK Matrix (14 Tactics)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 inline-block" />
                Inactive Technique
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                <span className="text-red-400 font-bold">Active Attack In Progress</span>
              </span>
            </div>
          </div>

          {/* 14 Scrollable Columns Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto pb-2">
            <div className="grid grid-cols-14 min-w-[2100px] gap-2">
              {MITRE_14_TACTICS.map((tactic) => (
                <div key={tactic.id} className="flex flex-col gap-2">
                  {/* Column Header */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center shrink-0">
                    <span className="text-[9px] font-mono font-bold text-blue-400 block uppercase">
                      STAGE {tactic.stage}
                    </span>
                    <h4 className="text-[11px] font-bold text-gray-200 leading-tight mt-0.5">
                      {tactic.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                      {tactic.techniques.length} Techniques
                    </span>
                  </div>

                  {/* Technique Cards List */}
                  <div className="space-y-2">
                    {tactic.techniques.map((tech) => {
                      // Check if active
                      const isActive = activeTechniqueIds.has(tech.id.toUpperCase());

                      return (
                        <div
                          key={tech.id}
                          className={`p-2 rounded-lg border transition-all duration-300 relative group cursor-pointer ${
                            isActive
                              ? 'bg-red-950/80 border-red-500 text-red-200 shadow-lg shadow-red-950/60 animate-pulse'
                              : 'bg-slate-950/60 border-slate-800/80 text-gray-300 hover:border-slate-700 hover:bg-slate-900/90'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                                isActive
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {tech.id}
                            </span>
                            {isActive && (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                          </div>

                          <h5 className="text-[11px] font-bold leading-snug">
                            {tech.name}
                          </h5>

                          <p className="text-[9px] text-slate-400 font-mono mt-1 line-clamp-2 leading-tight">
                            {tech.description}
                          </p>

                          {/* Hover Tooltip Overlay */}
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-30 w-48 p-2 rounded-lg bg-slate-950 border border-slate-700 text-[10px] text-gray-300 shadow-xl font-mono">
                            <p className="font-bold text-blue-400">{tech.id} - {tech.name}</p>
                            <p className="text-slate-400 mt-1">{tech.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
