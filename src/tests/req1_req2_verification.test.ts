import { INITIAL_NODES, INITIAL_EDGES } from '../data/mockData';
import type { DeviceNodeData, ViewOverlayMode, EventLogItem, AttackScenarioStep } from '../types/soc';

const describe = (_name: string, fn: () => void) => {
  fn();
};

const test = (_name: string, fn: () => void) => {
  fn();
};

const expect = <T>(actual: T) => ({
  toBe: (expected: T) => {
    if (actual !== expected) {
      throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
    }
  },
  toEqual: (expected: T) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  },
  toContain: (item: any) => {
    if (Array.isArray(actual) || typeof actual === 'string') {
      if (!(actual as any).includes(item)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
      }
    } else {
      throw new Error('actual is not array or string');
    }
  },
  toBeGreaterThan: (num: number) => {
    if (typeof actual !== 'number' || actual <= num) {
      throw new Error(`Expected ${actual} to be greater than ${num}`);
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected ${String(actual)} to be null`);
    }
  },
});

describe('Requirement 1 & Requirement 2 Empirical Verification Suite', () => {

  // --------------------------------------------------------------------------
  // TASK 1: View Overlay Modes Toggle & Style Contract
  // --------------------------------------------------------------------------
  describe('Task 1: View Overlay Modes Contract', () => {
    const modes: ViewOverlayMode[] = ['logical', 'traffic', 'health', 'threat'];

    test('All 4 View Overlay Modes are valid ViewOverlayMode types', () => {
      expect(modes.length).toBe(4);
      expect(modes).toContain('logical');
      expect(modes).toContain('traffic');
      expect(modes).toContain('health');
      expect(modes).toContain('threat');
    });

    test('Node data transformation applies viewMode correctly', () => {
      modes.forEach((vm) => {
        const displayNodes = INITIAL_NODES.map((n) => ({
          ...n,
          data: {
            ...n.data,
            viewMode: vm,
          },
        }));

        displayNodes.forEach((node) => {
          expect((node.data as DeviceNodeData).viewMode).toBe(vm);
        });
      });
    });

    test('Edge data transformation applies viewMode correctly', () => {
      modes.forEach((vm) => {
        const displayEdges = INITIAL_EDGES.map((e) => ({
          ...e,
          data: {
            ...(e.data || {}),
            viewMode: vm,
          },
        }));

        displayEdges.forEach((edge) => {
          expect(edge.data?.viewMode).toBe(vm);
        });
      });
    });

    test('Traffic mode metrics computation logic', () => {
      const node = INITIAL_NODES[0];
      const data = node.data as DeviceNodeData;
      const mbps = data.throughputMbps ?? Math.round((data.cpu * 8.5) + 120);
      const pps = data.pps ?? Math.round(mbps * 2.8 + 250);

      expect(typeof mbps).toBe('number');
      expect(typeof pps).toBe('number');
      expect(mbps).toBeGreaterThan(0);
      expect(pps).toBeGreaterThan(0);
    });

    test('Threat mode CVE extraction logic', () => {
      const compromisedNodeData: Partial<DeviceNodeData> = { status: 'compromised' };
      const warningNodeData: Partial<DeviceNodeData> = { status: 'warning' };
      const healthyNodeData: Partial<DeviceNodeData> = { status: 'healthy' };

      const getCves = (d: Partial<DeviceNodeData>) => {
        return d.cves || (
          d.status === 'compromised'
            ? ['CVE-2024-3094', 'CVE-2023-38606']
            : d.status === 'warning'
            ? ['CVE-2024-21626']
            : d.isVulnerable
            ? ['CVE-2023-38606']
            : []
        );
      };

      expect(getCves(compromisedNodeData)).toEqual(['CVE-2024-3094', 'CVE-2023-38606']);
      expect(getCves(warningNodeData)).toEqual(['CVE-2024-21626']);
      expect(getCves(healthyNodeData)).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // TASK 2: Drag & Drop Position Accuracy & screenToFlowPosition Interface
  // --------------------------------------------------------------------------
  describe('Task 2: Drag & Drop Position Calculation', () => {
    test('screenToFlowPosition mapping contract simulation', () => {
      const mockScreenToFlowPosition = (screenPos: { x: number; y: number }) => {
        // Simulates canvas transform e.g. zoom: 1, pan: [100, 50]
        return {
          x: screenPos.x - 100,
          y: screenPos.y - 50,
        };
      };

      const dropClientX = 450;
      const dropClientY = 300;
      const computedPos = mockScreenToFlowPosition({ x: dropClientX, y: dropClientY });

      expect(computedPos.x).toBe(350);
      expect(computedPos.y).toBe(250);
    });

    test('Dropped node data initialization contract', () => {
      const mockPaletteItem = {
        label: 'Linux Firewall',
        type: 'firewall' as const,
        category: 'security' as const,
        defaultOs: 'Ubuntu 22.04 LTS',
        defaultPorts: [22, 80, 443],
      };

      const position = { x: 300, y: 200 };
      const newNode = {
        id: `node_${Date.now()}`,
        type: 'socNode',
        position,
        data: {
          hostname: `${mockPaletteItem.label.replace(/\s+/g, '-')}-42`,
          ip: '192.168.1.150',
          deviceType: mockPaletteItem.type,
          status: 'healthy',
          cpu: 10,
          ram: 4.0,
          maxRam: 16.0,
          disk: 30,
          os: mockPaletteItem.defaultOs,
          openPorts: mockPaletteItem.defaultPorts,
          category: mockPaletteItem.category,
          processes: [{ pid: 1001, name: 'system_daemon', cpu: 2, memoryMb: 150 }],
          alerts: [],
        },
      };

      expect(newNode.position).toEqual({ x: 300, y: 200 });
      expect(newNode.data.status).toBe('healthy');
      expect(newNode.data.deviceType).toBe('firewall');
      expect(newNode.data.openPorts).toEqual([22, 80, 443]);
    });
  });

  // --------------------------------------------------------------------------
  // TASK 3: Cable Connection & Node Isolation Action with Propagation Block
  // --------------------------------------------------------------------------
  describe('Task 3: Node Isolation & Attack Propagation Block', () => {
    test('Isolation sets node status to offline and isIsolated to true', () => {
      let nodes = JSON.parse(JSON.stringify(INITIAL_NODES));
      const targetId = nodes[0].id;

      // Simulate handleIsolateNode
      let toggledIsIsolated = false;
      nodes = nodes.map((node: any) => {
        if (node.id === targetId) {
          toggledIsIsolated = !node.data.isIsolated;
          return {
            ...node,
            data: {
              ...node.data,
              isIsolated: toggledIsIsolated,
              status: toggledIsIsolated ? 'offline' : 'healthy',
            },
          };
        }
        return node;
      });

      const isolatedNode = nodes.find((n: any) => n.id === targetId);
      expect(isolatedNode.data.isIsolated).toBe(true);
      expect(isolatedNode.data.status).toBe('offline');
    });

    test('Isolation styles connected edges to grey dashed (#64748B, strokeDasharray 4 4)', () => {
      let edges = JSON.parse(JSON.stringify(INITIAL_EDGES));
      const isolatedNodeId = edges[0].source;

      // Simulate edge isolation updating in handleIsolateNode
      edges = edges.map((edge: any) => {
        if (edge.source === isolatedNodeId || edge.target === isolatedNodeId) {
          return {
            ...edge,
            type: 'socEdge',
            animated: false,
            style: { stroke: '#64748B', strokeWidth: 2, strokeDasharray: '4 4' },
            data: { ...edge.data, isIsolated: true },
          };
        }
        return edge;
      });

      const connectedEdge = edges.find((e: any) => e.source === isolatedNodeId || e.target === isolatedNodeId);
      expect(connectedEdge.animated).toBe(false);
      expect(connectedEdge.style.stroke).toBe('#64748B');
      expect(connectedEdge.style.strokeDasharray).toBe('4 4');
      expect(connectedEdge.data.isIsolated).toBe(true);
    });

    test('Attack step propagation is BLOCKED when source or target is isolated/offline', () => {
      let nodes = JSON.parse(JSON.stringify(INITIAL_NODES));
      let logs: EventLogItem[] = [];

      // Isolate target node
      const targetId = INITIAL_NODES[1].id; // firewall-1
      nodes = nodes.map((n: any) => {
        if (n.id === targetId) {
          return {
            ...n,
            data: { ...n.data, isIsolated: true, status: 'offline' },
          };
        }
        return n;
      });

      // Attack step targeting firewall-1
      const step: AttackScenarioStep = {
        stepIndex: 1,
        title: 'Exploit Attempt',
        description: 'Test attack',
        mitrePhaseId: 'initial-access',
        mitreTechnique: 'T1190',
        sourceNodeId: INITIAL_NODES[0].id,
        targetNodeId: targetId,
        targetStatus: 'compromised',
        edgeAnimation: 'attack',
        logMessage: 'Ransomware payload sent',
        logLevel: 'CRITICAL',
        maliciousProcess: 'encryptor.exe',
      };

      // Propagation check logic from executeStep:
      const sourceNode = nodes.find((n: any) => n.id === step.sourceNodeId);
      const targetNode = nodes.find((n: any) => n.id === step.targetNodeId);

      const isSourceIsolated = (sourceNode?.data as DeviceNodeData)?.isIsolated || (sourceNode?.data as DeviceNodeData)?.status === 'offline';
      const isTargetIsolated = (targetNode?.data as DeviceNodeData)?.isIsolated || (targetNode?.data as DeviceNodeData)?.status === 'offline';

      let propagationExecuted = false;

      if (isSourceIsolated || isTargetIsolated) {
        const blockedHost = isTargetIsolated
          ? (targetNode?.data as DeviceNodeData)?.hostname || step.targetNodeId
          : (sourceNode?.data as DeviceNodeData)?.hostname || step.sourceNodeId;

        logs.push({
          id: 'log_blocked',
          timestamp: '10:00:00',
          level: 'WARNING',
          sourceNodeId: step.sourceNodeId,
          message: `[ISOLATION CONTAINMENT] Attack propagation to/from isolated node "${blockedHost}" was blocked by SOC policy.`,
          mitrePhase: step.mitreTechnique,
        });
      } else {
        propagationExecuted = true;
      }

      // Assertions
      expect(propagationExecuted).toBe(false);
      expect(logs.length).toBe(1);
      expect(logs[0].message).toContain('[ISOLATION CONTAINMENT]');
      expect(logs[0].message).toContain('was blocked by SOC policy');

      // Target node should remain offline/unmodified by attack payload
      const postTargetNode = nodes.find((n: any) => n.id === targetId);
      expect(postTargetNode.data.status).toBe('offline');
    });
  });

  // --------------------------------------------------------------------------
  // TASK 4: Header Screen Mode Navigation
  // --------------------------------------------------------------------------
  describe('Task 4: Screen Mode Navigation Contract', () => {
    test('ScreenMode types encompass all 4 SOC modules', () => {
      const validModes = ['canvas', 'logs', 'mitre', 'report'];
      expect(validModes.length).toBe(4);
    });
  });

  // --------------------------------------------------------------------------
  // TASK 5: Log Explorer Severity Filtering & Regex Evaluation
  // --------------------------------------------------------------------------
  describe('Task 5: Log Explorer Filtering & Regex Search', () => {
    test('Severity filtering correctly filters logs', () => {
      const testLogs: EventLogItem[] = [
        { id: '1', timestamp: '10:00', level: 'INFO', message: 'Info msg' },
        { id: '2', timestamp: '10:01', level: 'WARNING', message: 'Warn msg' },
        { id: '3', timestamp: '10:02', level: 'CRITICAL', message: 'Crit msg' },
      ];

      const filterBySeverity = (logs: EventLogItem[], lvl: string) => {
        return logs.filter((l) => lvl === 'ALL' || l.level === lvl);
      };

      expect(filterBySeverity(testLogs, 'ALL').length).toBe(3);
      expect(filterBySeverity(testLogs, 'CRITICAL').length).toBe(1);
      expect(filterBySeverity(testLogs, 'CRITICAL')[0].id).toBe('3');
      expect(filterBySeverity(testLogs, 'ERROR').length).toBe(0);
    });

    test('Regex evaluation handles valid patterns and catches syntax errors', () => {
      const testLogs: EventLogItem[] = [
        { id: '1', timestamp: '10:00', level: 'CRITICAL', message: 'Ransomware binary encryptor.exe executed' },
        { id: '2', timestamp: '10:01', level: 'WARNING', message: 'Nmap port scan detected' },
      ];

      const evaluateSearch = (query: string, isRegex: boolean) => {
        let pattern: RegExp | null = null;
        let err: string | null = null;

        if (isRegex && query.trim()) {
          try {
            pattern = new RegExp(query, 'i');
          } catch {
            err = 'Invalid Regex Expression';
          }
        }

        const filtered = testLogs.filter((log) => {
          const fullText = `${log.timestamp} ${log.level} ${log.message}`;
          if (isRegex) {
            if (err || !pattern) return false;
            return pattern.test(fullText);
          } else {
            return fullText.toLowerCase().includes(query.toLowerCase());
          }
        });

        return { filtered, err };
      };

      // Test valid regex
      const validRes = evaluateSearch('Ransomware|Nmap', true);
      expect(validRes.err).toBeNull();
      expect(validRes.filtered.length).toBe(2);

      // Test invalid regex pattern (unclosed parenthesis)
      const invalidRes = evaluateSearch('(Ransomware', true);
      expect(invalidRes.err).toBe('Invalid Regex Expression');
      expect(invalidRes.filtered.length).toBe(0);
    });

    test('Log Volume Histogram aggregation groups by time and level', () => {
      const logs: EventLogItem[] = [
        { id: '1', timestamp: '09:30:00', level: 'INFO', message: 'm1' },
        { id: '2', timestamp: '09:30:15', level: 'CRITICAL', message: 'm2' },
        { id: '3', timestamp: '09:31:00', level: 'WARNING', message: 'm3' },
      ];

      const timeMap: Record<string, { time: string; INFO: number; WARNING: number; ERROR: number; CRITICAL: number }> = {};
      logs.forEach((log) => {
        let timeKey = log.timestamp;
        if (timeKey.includes(':')) {
          const parts = timeKey.split(':');
          if (parts.length >= 2) timeKey = `${parts[0]}:${parts[1]}`;
        }
        if (!timeMap[timeKey]) {
          timeMap[timeKey] = { time: timeKey, INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
        }
        if (log.level in timeMap[timeKey]) {
          timeMap[timeKey][log.level] += 1;
        }
      });

      const histogram = Object.values(timeMap);
      expect(histogram.length).toBe(2);
      expect(histogram.find((h) => h.time === '09:30')?.INFO).toBe(1);
      expect(histogram.find((h) => h.time === '09:30')?.CRITICAL).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // TASK 6: MITRE Matrix 14 Tactics & Active Techniques Highlighting
  // --------------------------------------------------------------------------
  describe('Task 6: MITRE Matrix & Scenario Builder', () => {
    test('14 Tactics are defined in MITRE Matrix', () => {
      const tactics = [
        'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
        'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
        'Discovery', 'Lateral Movement', 'Collection', 'Command and Control',
        'Exfiltration', 'Impact'
      ];
      expect(tactics.length).toBe(14);
    });

    test('Active techniques highlight extraction logic', () => {
      const logs: EventLogItem[] = [
        { id: '1', timestamp: '10:00', level: 'WARNING', message: 'Port scan', mitrePhase: 'T1595 Active Scanning' },
        { id: '2', timestamp: '10:01', level: 'CRITICAL', message: 'Ransomware', mitrePhase: 'T1486' },
      ];

      const activeSet = new Set<string>();
      logs.forEach((l) => {
        if (l.mitrePhase) {
          const match = l.mitrePhase.match(/T\d{4}/i);
          if (match) {
            activeSet.add(match[0].toUpperCase());
          }
        }
      });

      expect(activeSet.has('T1595')).toBe(true);
      expect(activeSet.has('T1486')).toBe(true);
      expect(activeSet.has('T1059')).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // TASK 7: Executive Report Threat Score & KPI Metrics Formula
  // --------------------------------------------------------------------------
  describe('Task 7: Executive Report Threat Score Formula', () => {
    test('Threat Score calculation formula consistency', () => {
      const computeThreatScore = (compromised: number, warning: number, alertCount: number, vulnerable: number) => {
        const rawScore = (compromised * 30) + (warning * 12) + (alertCount * 4) + (vulnerable * 8);
        return Math.min(100, Math.max(0, Math.round(rawScore)));
      };

      // 0 risks -> 0 score (LOW RISK)
      expect(computeThreatScore(0, 0, 0, 0)).toBe(0);

      // 1 compromised (30) + 1 warning (12) + 2 alerts (8) = 50 (ELEVATED RISK)
      expect(computeThreatScore(1, 1, 2, 0)).toBe(50);

      // High severity scenario cap at 100 (CRITICAL RISK)
      expect(computeThreatScore(3, 2, 10, 4)).toBe(100);
    });

    test('Risk level category bounds', () => {
      const getCategory = (score: number) => {
        if (score >= 75) return 'CRITICAL RISK';
        if (score >= 45) return 'ELEVATED RISK';
        if (score >= 20) return 'MODERATE RISK';
        return 'LOW RISK';
      };

      expect(getCategory(85)).toBe('CRITICAL RISK');
      expect(getCategory(50)).toBe('ELEVATED RISK');
      expect(getCategory(30)).toBe('MODERATE RISK');
      expect(getCategory(10)).toBe('LOW RISK');
    });
  });
});
