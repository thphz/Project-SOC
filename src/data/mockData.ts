import type { AttackScenario, DeviceType, MitrePhase } from '../types/soc';
import type { Node, Edge } from '@xyflow/react';

export interface PaletteItem {
  type: DeviceType;
  label: string;
  category: 'endpoints' | 'networking' | 'servers' | 'security';
  iconName: string;
  defaultOs: string;
  defaultPorts: number[];
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // Endpoints
  { type: 'pc', label: 'Workstation PC', category: 'endpoints', iconName: 'Monitor', defaultOs: 'Windows 11 Enterprise', defaultPorts: [135, 139, 445] },
  { type: 'laptop', label: 'Admin Laptop', category: 'endpoints', iconName: 'Laptop', defaultOs: 'macOS Sequoia', defaultPorts: [22, 443] },
  { type: 'iot', label: 'IoT Device', category: 'endpoints', iconName: 'Smartphone', defaultOs: 'Embedded Linux', defaultPorts: [80, 8080] },
  { type: 'camera', label: 'IP Camera', category: 'endpoints', iconName: 'Camera', defaultOs: 'FreeRTOS', defaultPorts: [554, 80] },

  // Networking
  { type: 'router', label: 'Core Router', category: 'networking', iconName: 'Router', defaultOs: 'Cisco IOS-XE', defaultPorts: [22, 161] },
  { type: 'switch', label: 'L3 Switch', category: 'networking', iconName: 'Network', defaultOs: 'Arista EOS', defaultPorts: [22, 443] },
  { type: 'firewall', label: 'NGFW Firewall', category: 'networking', iconName: 'Shield', defaultOs: 'Palo Alto PAN-OS', defaultPorts: [443, 8443] },
  { type: 'ap', label: 'Wireless AP', category: 'networking', iconName: 'Wifi', defaultOs: 'OpenWrt', defaultPorts: [80] },
  { type: 'internet', label: 'External Internet', category: 'networking', iconName: 'Globe', defaultOs: 'WAN Cloud Gateway', defaultPorts: [80, 443] },

  // Servers
  { type: 'server_linux', label: 'Linux App Server', category: 'servers', iconName: 'Server', defaultOs: 'Ubuntu 24.04 LTS', defaultPorts: [22, 80, 443] },
  { type: 'server_win', label: 'Active Directory', category: 'servers', iconName: 'LayoutGrid', defaultOs: 'Windows Server 2022', defaultPorts: [53, 88, 389, 445] },
  { type: 'database', label: 'DB Server (SQL)', category: 'servers', iconName: 'Database', defaultOs: 'Debian 12 / PostgreSQL', defaultPorts: [5432, 3306] },
  { type: 'mail', label: 'Mail Server', category: 'servers', iconName: 'Mail', defaultOs: 'CentOS Stream 9 / Postfix', defaultPorts: [25, 143, 993] },
  { type: 'dns', label: 'DNS Server', category: 'servers', iconName: 'Globe2', defaultOs: 'BIND9 Linux', defaultPorts: [53] },

  // Security
  { type: 'honeypot', label: 'Decoy Honeypot', category: 'security', iconName: 'Bug', defaultOs: 'Dionaea Honeypot', defaultPorts: [21, 22, 80, 445] },
  { type: 'cloud', label: 'Cloud VPC', category: 'security', iconName: 'Cloud', defaultOs: 'AWS US-East-1', defaultPorts: [443] },
];

export const INITIAL_NODES: Node[] = [
  {
    id: 'internet-1',
    type: 'socNode',
    position: { x: 500, y: 40 },
    data: {
      hostname: 'Internet-Gateway',
      ip: '203.0.113.1',
      deviceType: 'internet',
      status: 'healthy',
      cpu: 12,
      ram: 2.1,
      maxRam: 16,
      disk: 15,
      os: 'WAN Cloud Edge',
      openPorts: [80, 443],
      category: 'networking',
      processes: [{ pid: 101, name: 'bgpd', cpu: 2, memoryMb: 120 }],
      alerts: []
    }
  },
  {
    id: 'firewall-1',
    type: 'socNode',
    position: { x: 500, y: 170 },
    data: {
      hostname: 'NGFW-Edge-01',
      ip: '192.168.1.1',
      deviceType: 'firewall',
      status: 'healthy',
      cpu: 24,
      ram: 4.2,
      maxRam: 16,
      disk: 28,
      os: 'Palo Alto PAN-OS 11.0',
      openPorts: [443, 8443],
      category: 'networking',
      processes: [
        { pid: 201, name: 'pan_mgmt', cpu: 5, memoryMb: 450 },
        { pid: 202, name: 'threat_engine', cpu: 12, memoryMb: 1200 }
      ],
      alerts: []
    }
  },
  {
    id: 'switch-1',
    type: 'socNode',
    position: { x: 500, y: 310 },
    data: {
      hostname: 'Core-Switch-A',
      ip: '192.168.1.2',
      deviceType: 'switch',
      status: 'healthy',
      cpu: 18,
      ram: 3.5,
      maxRam: 8,
      disk: 20,
      os: 'Arista EOS 4.28',
      openPorts: [22, 161],
      category: 'networking',
      processes: [{ pid: 301, name: 'lacpd', cpu: 3, memoryMb: 90 }],
      alerts: []
    }
  },
  {
    id: 'pc-1',
    type: 'socNode',
    position: { x: 180, y: 460 },
    data: {
      hostname: 'HR-PC-01',
      ip: '192.168.1.105',
      deviceType: 'pc',
      status: 'healthy',
      cpu: 15,
      ram: 6.2,
      maxRam: 16,
      disk: 45,
      os: 'Windows 11 Enterprise',
      openPorts: [135, 139, 445],
      category: 'endpoints',
      processes: [
        { pid: 1044, name: 'explorer.exe', cpu: 4, memoryMb: 180 },
        { pid: 2108, name: 'outlook.exe', cpu: 8, memoryMb: 350 },
        { pid: 3412, name: 'chrome.exe', cpu: 10, memoryMb: 850 }
      ],
      alerts: []
    }
  },
  {
    id: 'pc-2',
    type: 'socNode',
    position: { x: 380, y: 460 },
    data: {
      hostname: 'Dev-Laptop-02',
      ip: '192.168.1.108',
      deviceType: 'laptop',
      status: 'healthy',
      cpu: 22,
      ram: 9.8,
      maxRam: 32,
      disk: 60,
      os: 'macOS Sequoia 15.1',
      openPorts: [22, 443],
      category: 'endpoints',
      processes: [
        { pid: 501, name: 'vscode', cpu: 14, memoryMb: 1400 },
        { pid: 612, name: 'docker', cpu: 6, memoryMb: 2100 }
      ],
      alerts: []
    }
  },
  {
    id: 'server-web',
    type: 'socNode',
    position: { x: 620, y: 460 },
    data: {
      hostname: 'WEB-API-01',
      ip: '192.168.1.20',
      deviceType: 'server_linux',
      status: 'healthy',
      cpu: 31,
      ram: 7.4,
      maxRam: 32,
      disk: 52,
      os: 'Ubuntu 24.04 LTS',
      openPorts: [22, 80, 443],
      category: 'servers',
      processes: [
        { pid: 880, name: 'nginx', cpu: 12, memoryMb: 240 },
        { pid: 910, name: 'node_api', cpu: 18, memoryMb: 680 }
      ],
      alerts: []
    }
  },
  {
    id: 'server-db',
    type: 'socNode',
    position: { x: 820, y: 460 },
    data: {
      hostname: 'SQL-PROD-01',
      ip: '192.168.1.50',
      deviceType: 'database',
      status: 'healthy',
      cpu: 28,
      ram: 14.2,
      maxRam: 64,
      disk: 71,
      os: 'Debian 12 (PostgreSQL)',
      openPorts: [5432, 22],
      category: 'servers',
      processes: [
        { pid: 1402, name: 'postgres', cpu: 24, memoryMb: 4200 },
        { pid: 1510, name: 'sshd', cpu: 1, memoryMb: 45 }
      ],
      alerts: []
    }
  }
];

export const INITIAL_EDGES: Edge[] = [
  { id: 'e-int-fw', source: 'internet-1', target: 'firewall-1', type: 'socEdge', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e-fw-sw', source: 'firewall-1', target: 'switch-1', type: 'socEdge', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e-sw-pc1', source: 'switch-1', target: 'pc-1', type: 'socEdge', animated: false, style: { stroke: '#4B5563', strokeWidth: 2 } },
  { id: 'e-sw-pc2', source: 'switch-1', target: 'pc-2', type: 'socEdge', animated: false, style: { stroke: '#4B5563', strokeWidth: 2 } },
  { id: 'e-sw-web', source: 'switch-1', target: 'server-web', type: 'socEdge', animated: false, style: { stroke: '#4B5563', strokeWidth: 2 } },
  { id: 'e-sw-db', source: 'switch-1', target: 'server-db', type: 'socEdge', animated: false, style: { stroke: '#4B5563', strokeWidth: 2 } },
];

export const MITRE_STAGES: MitrePhase[] = [
  { id: 'recon', name: 'Reconnaissance', stage: 1, status: 'pending', techniqueId: 'T1595 - Active Scanning' },
  { id: 'initial-access', name: 'Initial Access', stage: 2, status: 'pending', techniqueId: 'T1566 - Phishing / Spearphishing' },
  { id: 'execution', name: 'Execution', stage: 3, status: 'pending', techniqueId: 'T1204 - User Execution' },
  { id: 'credential-access', name: 'Credential Access', stage: 4, status: 'pending', techniqueId: 'T1110 - Brute Force' },
  { id: 'persistence', name: 'Persistence', stage: 5, status: 'pending', techniqueId: 'T1547 - Boot/Logon Autostart' },
  { id: 'discovery', name: 'Discovery', stage: 6, status: 'pending', techniqueId: 'T1046 - Network Service Discovery' },
  { id: 'lateral', name: 'Lateral Movement', stage: 7, status: 'pending', techniqueId: 'T1021 - SMB/Windows Admin Shares' },
  { id: 'exfiltration', name: 'Exfiltration', stage: 8, status: 'pending', techniqueId: 'T1041 - Exfiltration Over C2' },
  { id: 'impact', name: 'Impact', stage: 9, status: 'pending', techniqueId: 'T1486 - Data Encrypted for Impact' },
];

export const PRESET_SCENARIOS: AttackScenario[] = [
  {
    id: 'scenario-1-ransomware',
    name: '1. Ransomware & Lateral Spreading',
    category: 'Malware / Ransomware',
    description: 'Tải mã độc qua Email Phishing trên HR-PC-01, tự động quét mạng nội bộ SMB Port 445 và mã hóa dữ liệu trên Server SQL.',
    steps: [
      {
        stepIndex: 1,
        title: 'Phishing Email Delivered',
        description: 'Người dùng HR-PC-01 mở tệp đính kèm Invoice_2026.pdf.exe giả mạo.',
        mitrePhaseId: 'initial-access',
        mitreTechnique: 'T1566.001 - Spearphishing Attachment',
        sourceNodeId: 'internet-1',
        targetNodeId: 'pc-1',
        targetStatus: 'warning',
        edgeAnimation: 'warning',
        logMessage: 'Suspicious process payload Invoice_2026.exe executed on HR-PC-01',
        logLevel: 'WARNING',
        maliciousProcess: 'ransom_payload.exe',
        alertTitle: 'Suspicious Binary Execution'
      },
      {
        stepIndex: 2,
        title: 'Malware Execution & Host Compromise',
        description: 'Mã độc khởi chạy tiến trình ẩn, tắt Windows Defender và chiếm quyền kiểm soát HR-PC-01.',
        mitrePhaseId: 'execution',
        mitreTechnique: 'T1204 - User Execution',
        sourceNodeId: 'pc-1',
        targetNodeId: 'pc-1',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'CRITICAL: HR-PC-01 Defense Evaded! Ransomware active in memory.',
        logLevel: 'CRITICAL',
        maliciousProcess: 'encryptor_srv.exe',
        alertTitle: 'Host Fully Compromised (Ransomware)'
      },
      {
        stepIndex: 3,
        title: 'Internal Network Discovery (SMB Scan)',
        description: 'Mã độc tự động quét dải IP nội bộ tìm port 445 SMB lỗ hổng EternalBlue.',
        mitrePhaseId: 'discovery',
        mitreTechnique: 'T1046 - Network Service Discovery',
        sourceNodeId: 'pc-1',
        targetNodeId: 'switch-1',
        targetStatus: 'scanning',
        edgeAnimation: 'attack',
        logMessage: 'ABNORMAL TRAFFIC: High rate SMB port 445 SYN requests from HR-PC-01 to Subnet',
        logLevel: 'WARNING',
        alertTitle: 'Port Scan Activity Detected'
      },
      {
        stepIndex: 4,
        title: 'Lateral Movement to Core Switch & Server',
        description: 'Khai thác lỗ hổng SMB truyền payload mã độc sang Server API & Database.',
        mitrePhaseId: 'lateral',
        mitreTechnique: 'T1021.002 - SMB/Windows Admin Shares',
        sourceNodeId: 'switch-1',
        targetNodeId: 'server-web',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'SECURITY ALERT: Unauthorized remote SMB command on WEB-API-01',
        logLevel: 'CRITICAL',
        maliciousProcess: 'wnry_helper.sh',
        alertTitle: 'Lateral Spread to Server'
      },
      {
        stepIndex: 5,
        title: 'Data Encrypted for Impact',
        description: 'Mã hóa cơ sở dữ liệu SQL-PROD-01 và đòi tiền chuộc Bitcoin.',
        mitrePhaseId: 'impact',
        mitreTechnique: 'T1486 - Data Encrypted for Impact',
        sourceNodeId: 'server-web',
        targetNodeId: 'server-db',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'CRITICAL INCIDENT: Database SQL-PROD-01 storage encrypted! Extension .LOCKED applied.',
        logLevel: 'CRITICAL',
        maliciousProcess: 'lock_db.py',
        alertTitle: 'Ransomware Encryption Complete'
      }
    ]
  },
  {
    id: 'scenario-2-ddos',
    name: '2. Distributed Denial of Service (DDoS)',
    category: 'Availability Attack',
    description: 'Hàng triệu gói tin SYN Flood từ Botnet ngoài Internet tấn công dồn dập khiến Firewall và Web Gateway bị liệt hoàn toàn.',
    steps: [
      {
        stepIndex: 1,
        title: 'Reconnaissance & Botnet Assembly',
        description: 'Botnet ngoài Internet bắt đầu gửi các gói tin thăm dò đến IP Public 203.0.113.1',
        mitrePhaseId: 'recon',
        mitreTechnique: 'T1595 - Active Scanning',
        sourceNodeId: 'internet-1',
        targetNodeId: 'internet-1',
        targetStatus: 'scanning',
        edgeAnimation: 'warning',
        logMessage: 'INFO: High volume external ping sweeps originating from 104.28.x.x',
        logLevel: 'INFO'
      },
      {
        stepIndex: 2,
        title: 'Volumetric SYN Flood Launch',
        description: 'Bắn 850 Mbps luồng dữ liệu giả mạo làm tắc nghẽn NGFW-Edge-01.',
        mitrePhaseId: 'impact',
        mitreTechnique: 'T1498 - Network Denial of Service',
        sourceNodeId: 'internet-1',
        targetNodeId: 'firewall-1',
        targetStatus: 'warning',
        edgeAnimation: 'attack',
        logMessage: 'WARNING: NGFW-Edge-01 Packet Buffer 92% full! Drop rate: 4500 pps',
        logLevel: 'WARNING',
        alertTitle: 'High Volume Inbound Traffic'
      },
      {
        stepIndex: 3,
        title: 'Firewall CPU Exhaustion',
        description: 'Tài nguyên xử lý của Firewall đạt 99% CPU, không thể phân tích luật mới.',
        mitrePhaseId: 'impact',
        mitreTechnique: 'T1499 - Endpoint Denial of Service',
        sourceNodeId: 'firewall-1',
        targetNodeId: 'firewall-1',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'CRITICAL: Firewall NGFW-Edge-01 CPU at 99%! Security policies failing.',
        logLevel: 'CRITICAL',
        alertTitle: 'Hardware Resource Exhausted'
      },
      {
        stepIndex: 4,
        title: 'Web Service Degradation & Outage',
        description: 'Server WEB-API-01 mất kết nối hoàn toàn với khách hàng.',
        mitrePhaseId: 'impact',
        mitreTechnique: 'T1489 - Service Stop',
        sourceNodeId: 'firewall-1',
        targetNodeId: 'server-web',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'CRITICAL: WEB-API-01 HTTP 504 Gateway Timeout for 100% requests.',
        logLevel: 'CRITICAL',
        alertTitle: 'Service Outage Confirmed'
      }
    ]
  },
  {
    id: 'scenario-3-apt',
    name: '3. APT & Data Exfiltration',
    category: 'Advanced Persistent Threat',
    description: 'Thủ phạm dò quẹt mật khẩu SSH trên Web Server, nâng quyền ROOT và trích xuất dữ liệu nhạy cảm ra ngoài IP nước ngoài.',
    steps: [
      {
        stepIndex: 1,
        title: 'SSH Brute Force Attack',
        description: 'Tấn công dò mật khẩu SSH Port 22 liên tục vào WEB-API-01.',
        mitrePhaseId: 'recon',
        mitreTechnique: 'T1110 - Brute Force',
        sourceNodeId: 'internet-1',
        targetNodeId: 'server-web',
        targetStatus: 'scanning',
        edgeAnimation: 'warning',
        logMessage: 'WARNING: 500+ failed SSH login attempts for root on WEB-API-01',
        logLevel: 'WARNING',
        alertTitle: 'Brute Force SSH Attack'
      },
      {
        stepIndex: 2,
        title: 'Successful Authentication & Privilege Escalation',
        description: 'Attacker dò trúng mật khẩu weak admin, leo quyền bằng CVE-2024-21626.',
        mitrePhaseId: 'execution',
        mitreTechnique: 'T1068 - Exploitation for Privilege Escalation',
        sourceNodeId: 'server-web',
        targetNodeId: 'server-web',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'CRITICAL: Root shell spawned on WEB-API-01 via CVE exploitation!',
        logLevel: 'CRITICAL',
        maliciousProcess: 'backdoor.sh',
        alertTitle: 'Root Privilege Escalation'
      },
      {
        stepIndex: 3,
        title: 'Credential Dumping & Database Query',
        description: 'Truy cập DB SQL-PROD-01 dump bảng thông tin thẻ tín dụng & tài khoản.',
        mitrePhaseId: 'discovery',
        mitreTechnique: 'T1003 - OS Credential Dumping',
        sourceNodeId: 'server-web',
        targetNodeId: 'server-db',
        targetStatus: 'warning',
        edgeAnimation: 'attack',
        logMessage: 'SECURITY ALERT: SELECT * FROM customer_credit_cards executed by web_user',
        logLevel: 'CRITICAL',
        alertTitle: 'Sensitive DB Exfiltration Query'
      },
      {
        stepIndex: 4,
        title: 'Data Exfiltration via Encrypted Channel',
        description: 'Đẩy tệp dump 4.2GB nén ra IP 185.220.101.5 (Suspicious Tor Exit Node).',
        mitrePhaseId: 'impact',
        mitreTechnique: 'T1041 - Exfiltration Over C2 Channel',
        sourceNodeId: 'server-web',
        targetNodeId: 'internet-1',
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'CRITICAL WARNING: 4.2GB outbound transfer to untrusted IP 185.220.101.5',
        logLevel: 'CRITICAL',
        alertTitle: 'Data Exfiltration Confirmed'
      }
    ]
  }
];

export const INITIAL_LOGS: Array<{ id: string; timestamp: string; level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'; sourceHost: string; message: string }> = [
  { id: 'log-1', timestamp: '09:30:15', level: 'INFO', sourceHost: 'NGFW-Edge-01', message: 'Firewall ruleset v4.12 loaded successfully. All interfaces UP.' },
  { id: 'log-2', timestamp: '09:31:02', level: 'INFO', sourceHost: 'Core-Switch-A', message: 'VLAN 10 (Endpoints) and VLAN 20 (Servers) routing active.' },
  { id: 'log-3', timestamp: '09:32:44', level: 'INFO', sourceHost: 'HR-PC-01', message: 'User hr_admin logged in via Active Directory SSO.' },
  { id: 'log-4', timestamp: '09:33:10', level: 'INFO', sourceHost: 'WEB-API-01', message: 'Nginx service health check HTTP 200 OK.' },
  { id: 'log-5', timestamp: '09:34:00', level: 'INFO', sourceHost: 'SQL-PROD-01', message: 'PostgreSQL connection pool initialized (10/100 active).' },
];
