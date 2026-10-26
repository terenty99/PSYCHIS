import { NODE_TEMPLATES } from "./nodeTemplates";
import { RELATIONSHIP_TYPES } from "./colorTokens";
export const INITIAL_NODES = [
  {
    id: "0x00",
    type: "website",
    width: 270,
    height: 210,
    position: { x: 45, y: 180 },
    data: {
      ...NODE_TEMPLATES.website.defaultData,
      category: "website // corpus",
      status: "Illustrative example",
    },
  },
  {
    id: "0x01",
    type: "mechanism",
    width: 280,
    height: 330,
    position: { x: 345, y: 125 },
    data: {
      ...NODE_TEMPLATES.mechanism.defaultData,
      category: "mechanism // planar motion",
      status: "Illustrative example",
    },
  },
  {
    id: "0x02",
    type: "transport",
    width: 270,
    height: 290,
    position: { x: 655, y: 125 },
    data: {
      ...NODE_TEMPLATES.transport.defaultData,
      category: "transport // solid state",
      status: "Illustrative example",
    },
  },
  {
    id: "0x03",
    type: "topological",
    width: 250,
    height: 210,
    position: { x: 420, y: 480 },
    data: {
      ...NODE_TEMPLATES.topological.defaultData,
      category: "topological geometry",
      status: "Illustrative example",
    },
  },
  {
    id: "0x04",
    type: "contradiction",
    width: 280,
    height: 270,
    position: { x: 965, y: 125 },
    data: {
      ...NODE_TEMPLATES.contradiction.defaultData,
      category: "refutation // counter-thesis",
      status: "Illustrative example",
    },
  },
  {
    id: "0x05",
    type: "spawned",
    width: 270,
    height: 240,
    position: { x: 700, y: 440 },
    hidden: false,
    data: {
      ...NODE_TEMPLATES.spawned.defaultData,
      category: "ai discovery // 2026",
      status: "Illustrative example",
    },
  },
];

export const INITIAL_EDGES = [
  {
    id: "edge-web-1a",
    source: "0x00",
    target: "0x01",
    relationshipType: RELATIONSHIP_TYPES.ORIGIN_URL,
    label: "origin",
    description:
      "Primary web documentation origin anchoring Chebyshev kinematics analysis.",
    color: "#7A7570",
    style: "basic",
  },
  {
    id: "edge-1a-1b",
    source: "0x01",
    target: "0x02",
    relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
    label: "coupled",
    description:
      "Dynamic coupler linking continuous crank rotation with straight-line output motion.",
    color: "#7A7570",
    style: "basic",
  },
  {
    id: "edge-1a-1c",
    source: "0x01",
    target: "0x03",
    relationshipType: RELATIONSHIP_TYPES.COUPLED_SYSTEM,
    label: "geometry",
    description:
      "Geometric proof mapping the five-bar spherical constraint to Chebyshev coupler curves.",
    color: "#7A7570",
    style: "basic",
  },
  {
    id: "edge-1b-1d",
    source: "0x02",
    target: "0x04",
    relationshipType: RELATIONSHIP_TYPES.CONTRADICTS,
    label: "contradicts",
    description:
      "Physical friction contradiction: sliding linear bearings vs Chebyshev flexure pivots in ultra-high vacuum.",
    color: "#3A3530",
    style: "dashed",
  },
  {
    id: "edge-1a-spawned",
    source: "0x01",
    target: "0x05",
    relationshipType: RELATIONSHIP_TYPES.DEFAULT,
    label: "ai probe",
    description:
      "Analytical investigation extending coupler midpoint inflection circle equations.",
    color: "#7A7570",
    style: "arrowed",
  },
];

