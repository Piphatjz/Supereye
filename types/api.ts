// types/api.ts
export type Prediction = {
  label: string;
  prob: number;
};

export type Advisory = {
  is_uncertain?: boolean;
  reasons?: string[];
  suggestions?: string[];
  metrics?: {
    brightness?: number;
    contrast?: number;
    entropy?: number;
    lap_var?: number;
    tenengrad?: number;
  };
  notes?: Record<string, number | string | boolean>;
};

export type ExplainViz = {
  centroid_x?: number;
  centroid_y?: number;
  spread?: number;
  overlay_png?: string; // data URL
  reason_pos?: string;
  optic_disc_xy?: { x: number; y: number } | null;
};

export type ApiResponse = {
  labels_current: string[];
  probs: number[];
  predictions: Prediction[];
  top1: { index: number; label: string; prob: number };
  advisory?: Advisory;
  explain?: string | null;
  explain_viz?: ExplainViz;
  error?: string;
};
