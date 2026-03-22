export type DemoRevision = {
  id: string;
  label: string;
  shortLabel: string;
  timestamp: string;
  actor: string;
  note: string;
  sha256: string;
  config: string;
};

export type DemoDiffLine = {
  type: "context" | "add" | "remove";
  left?: string;
  right?: string;
};

export type DemoDiff = {
  id: string;
  title: string;
  timestamp: string;
  actor: string;
  summary: string;
  fromRevisionId: string;
  toRevisionId: string;
  lines: DemoDiffLine[];
};

export type DemoTimelineNode = {
  id: string;
  kind: "snapshot" | "diff";
  title: string;
  timestamp: string;
  actor: string;
  note: string;
  revisionId?: string;
  diffId?: string;
};

export type DemoFleetDevice = {
  id: number;
  hostname: string;
  mgmtIp: string;
  platform: string;
  site: string;
  status: "healthy" | "warning" | "drift";
  diffsLast24h: number;
  lastChange: string;
  latestRevisionId: string;
  latestSha256: string;
  summary: string;
};

export const demoDevice = {
  id: 1,
  hostname: "leaf-evpn-01",
  mgmtIp: "10.0.0.21",
  vendor: "nxos",
  platform: "Nexus 9300v",
  location: "LAB / Fabric A",
};

export const demoRevisions: DemoRevision[] = [
  {
    id: "rev-1",
    label: "Baseline",
    shortLabel: "08:14",
    timestamp: "2026-03-21T08:14:00Z",
    actor: "lab.seed",
    note: "Golden baseline before the EVPN rollout.",
    sha256: "1ef91d42886c0f5b6e3f40608c2298b00b31ed2c5f3d8b4d3f9f5e7b9060da7f",
    config: `hostname leaf-evpn-01
feature ospf
feature bgp
feature interface-vlan

interface Ethernet1/1
  description uplink-spine-01
  switchport
  mtu 9216
  no shutdown

interface Ethernet1/10
  description server-rack-22
  switchport access vlan 20
  spanning-tree port type edge
  no shutdown

vlan 20
  name APP-LEGACY

router bgp 65101
  router-id 10.255.0.21
  address-family ipv4 unicast

line console
  exec-timeout 15`,
  },
  {
    id: "rev-2",
    label: "VXLAN Bring-Up",
    shortLabel: "09:02",
    timestamp: "2026-03-22T09:02:00Z",
    actor: "ops.jane",
    note: "Adds EVPN/VXLAN services for the new tenant rollout.",
    sha256: "7134d7420a47b1bb7cf92726b6f78131e5a5b4d6e42e98dd0d5e16b708bf2f97",
    config: `hostname leaf-evpn-01
feature ospf
feature bgp
feature interface-vlan
feature nv overlay
nv overlay evpn

interface Ethernet1/1
  description uplink-spine-01
  switchport
  mtu 9216
  no shutdown

interface Ethernet1/10
  description server-rack-22
  switchport access vlan 110
  spanning-tree port type edge
  no shutdown

interface nve1
  no shutdown
  source-interface loopback1
  member vni 10110
    suppress-arp

vlan 110
  name TENANT_BLUE_WEB
  vn-segment 10110

interface Vlan110
  no shutdown
  ip address 10.110.10.1/24
  fabric forwarding mode anycast-gateway

router bgp 65101
  router-id 10.255.0.21
  address-family ipv4 unicast
  address-family l2vpn evpn

line console
  exec-timeout 15`,
  },
  {
    id: "rev-3",
    label: "Policy Cleanup",
    shortLabel: "11:37",
    timestamp: "2026-03-22T11:37:00Z",
    actor: "neteng.marcus",
    note: "Locks down console timeout and renames the tenant service.",
    sha256: "cf853ce908c9f4827fdb4af6b5e8d6c9a6c483637f6b0b7ea334ac24b6c12af8",
    config: `hostname leaf-evpn-01
feature ospf
feature bgp
feature interface-vlan
feature nv overlay
nv overlay evpn

interface Ethernet1/1
  description uplink-spine-01
  switchport
  mtu 9216
  no shutdown

interface Ethernet1/10
  description server-rack-22
  switchport access vlan 110
  spanning-tree port type edge
  no shutdown

interface nve1
  no shutdown
  source-interface loopback1
  member vni 10110
    suppress-arp

vlan 110
  name TENANT_BLUE_FRONTEND
  vn-segment 10110

interface Vlan110
  no shutdown
  ip address 10.110.10.1/24
  fabric forwarding mode anycast-gateway

router bgp 65101
  router-id 10.255.0.21
  address-family ipv4 unicast
  address-family l2vpn evpn

line console
  exec-timeout 5`,
  },
];

export const demoDiffs: DemoDiff[] = [
  {
    id: "diff-1",
    title: "Baseline -> VXLAN Bring-Up",
    timestamp: "2026-03-22T09:02:00Z",
    actor: "ops.jane",
    summary: "Introduced NVE, tenant VLAN 110, and EVPN address-family.",
    fromRevisionId: "rev-1",
    toRevisionId: "rev-2",
    lines: [
      { type: "context", left: "hostname leaf-evpn-01", right: "hostname leaf-evpn-01" },
      { type: "context", left: "feature interface-vlan", right: "feature interface-vlan" },
      { type: "add", right: "feature nv overlay" },
      { type: "add", right: "nv overlay evpn" },
      { type: "context", left: "interface Ethernet1/10", right: "interface Ethernet1/10" },
      { type: "remove", left: "  switchport access vlan 20" },
      { type: "add", right: "  switchport access vlan 110" },
      { type: "add", right: "interface nve1" },
      { type: "add", right: "  no shutdown" },
      { type: "add", right: "  source-interface loopback1" },
      { type: "add", right: "  member vni 10110" },
      { type: "add", right: "    suppress-arp" },
      { type: "remove", left: "vlan 20" },
      { type: "remove", left: "  name APP-LEGACY" },
      { type: "add", right: "vlan 110" },
      { type: "add", right: "  name TENANT_BLUE_WEB" },
      { type: "add", right: "  vn-segment 10110" },
      { type: "add", right: "interface Vlan110" },
      { type: "add", right: "  no shutdown" },
      { type: "add", right: "  ip address 10.110.10.1/24" },
      { type: "add", right: "  fabric forwarding mode anycast-gateway" },
      { type: "context", left: "router bgp 65101", right: "router bgp 65101" },
      { type: "context", left: "  address-family ipv4 unicast", right: "  address-family ipv4 unicast" },
      { type: "add", right: "  address-family l2vpn evpn" },
    ],
  },
  {
    id: "diff-2",
    title: "VXLAN Bring-Up -> Policy Cleanup",
    timestamp: "2026-03-22T11:37:00Z",
    actor: "neteng.marcus",
    summary: "Adjusted tenant naming and tightened console session timeout.",
    fromRevisionId: "rev-2",
    toRevisionId: "rev-3",
    lines: [
      { type: "context", left: "vlan 110", right: "vlan 110" },
      { type: "remove", left: "  name TENANT_BLUE_WEB" },
      { type: "add", right: "  name TENANT_BLUE_FRONTEND" },
      { type: "context", left: "  vn-segment 10110", right: "  vn-segment 10110" },
      { type: "context", left: "line console", right: "line console" },
      { type: "remove", left: "  exec-timeout 15" },
      { type: "add", right: "  exec-timeout 5" },
    ],
  },
];

export const demoTimeline: DemoTimelineNode[] = [
  {
    id: "node-rev-3",
    kind: "snapshot",
    title: "Policy Cleanup",
    timestamp: demoRevisions[2].timestamp,
    actor: demoRevisions[2].actor,
    note: demoRevisions[2].note,
    revisionId: demoRevisions[2].id,
  },
  {
    id: "node-diff-2",
    kind: "diff",
    title: demoDiffs[1].title,
    timestamp: demoDiffs[1].timestamp,
    actor: demoDiffs[1].actor,
    note: demoDiffs[1].summary,
    diffId: demoDiffs[1].id,
  },
  {
    id: "node-rev-2",
    kind: "snapshot",
    title: "VXLAN Bring-Up",
    timestamp: demoRevisions[1].timestamp,
    actor: demoRevisions[1].actor,
    note: demoRevisions[1].note,
    revisionId: demoRevisions[1].id,
  },
  {
    id: "node-diff-1",
    kind: "diff",
    title: demoDiffs[0].title,
    timestamp: demoDiffs[0].timestamp,
    actor: demoDiffs[0].actor,
    note: demoDiffs[0].summary,
    diffId: demoDiffs[0].id,
  },
  {
    id: "node-rev-1",
    kind: "snapshot",
    title: "Baseline",
    timestamp: demoRevisions[0].timestamp,
    actor: demoRevisions[0].actor,
    note: demoRevisions[0].note,
    revisionId: demoRevisions[0].id,
  },
];

export function getRevisionById(id: string) {
  return demoRevisions.find((revision) => revision.id === id) ?? demoRevisions[0];
}

export function getDiffById(id: string) {
  return demoDiffs.find((diff) => diff.id === id) ?? demoDiffs[0];
}

export const demoFleetDevices: DemoFleetDevice[] = [
  {
    id: 1,
    hostname: "leaf-evpn-01",
    mgmtIp: "10.0.0.21",
    platform: "Nexus 9300v",
    site: "LAB / Fabric A",
    status: "warning",
    diffsLast24h: 2,
    lastChange: "2026-03-22T11:37:00Z",
    latestRevisionId: "rev-3",
    latestSha256: "cf853ce908c9f4827fdb4af6b5e8d6c9a6c483637f6b0b7ea334ac24b6c12af8",
    summary: "EVPN rollout completed, followed by console policy cleanup.",
  },
  {
    id: 2,
    hostname: "leaf-evpn-02",
    mgmtIp: "10.0.0.22",
    platform: "Nexus 9300v",
    site: "LAB / Fabric A",
    status: "healthy",
    diffsLast24h: 0,
    lastChange: "2026-03-21T18:05:00Z",
    latestRevisionId: "rev-2",
    latestSha256: "b3d6a0a45d3291387edf8d66b346f5d5882f44992469dcf72d3dd3ebfbbef76c",
    summary: "No changes in the last 24 hours. Matches expected baseline.",
  },
  {
    id: 3,
    hostname: "border-gw-01",
    mgmtIp: "10.0.1.10",
    platform: "ASR1001-X",
    site: "LAB / Edge",
    status: "drift",
    diffsLast24h: 1,
    lastChange: "2026-03-22T04:18:00Z",
    latestRevisionId: "rev-2",
    latestSha256: "60dabb01a47f0713f868c583c8d2e267c8d94d9d5f604f89d52752fe4c1d9d4a",
    summary: "Route-policy drift detected after an emergency maintenance window.",
  },
  {
    id: 4,
    hostname: "core-dist-01",
    mgmtIp: "10.0.2.11",
    platform: "Catalyst 9500",
    site: "LAB / Campus",
    status: "healthy",
    diffsLast24h: 0,
    lastChange: "2026-03-20T21:45:00Z",
    latestRevisionId: "rev-1",
    latestSha256: "6c8c6f511ae7441890b0f36f457ca494d2e247a0d52f281c7473fee4efd4d6d1",
    summary: "Stable, no unexpected changes, last revision was a planned ACL update.",
  },
];
